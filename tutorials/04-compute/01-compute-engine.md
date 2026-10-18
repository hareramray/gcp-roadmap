# Compute Engine: build and operate a VM

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

You will create a private Linux VM, connect through Identity-Aware Proxy (IAP), inspect its boot process, and explain the difference between stopping a VM and deleting its storage. Run the commands in **Google Cloud Shell Bash**, including when your own computer uses Windows. Complete the lab setup first; `PROJECT_ID`, `REGION`, and `ZONE` must identify your disposable project and a zone within the region. Allow 45–60 minutes. The VM and disk incur charges while this lab exists.

## Understand the resource model

A VM is zonal. Its machine type supplies vCPUs and memory; its boot disk supplies an operating system. General-purpose families suit varied workloads, compute-optimized families suit sustained CPU demand, memory-optimized families suit large working sets, and accelerator-optimized families support specific GPU configurations. Compare supported zones, processor architecture, bandwidth, disk compatibility, and measured performance before selecting a family. A smaller machine that constantly swaps can cost more per completed task than a larger one.

An image is a reusable boot-disk source; a snapshot captures disk state; an instance template describes how to construct VMs. An image family resolves to a current image, which is convenient for a lab but less reproducible than a pinned image name. Disk snapshots alone do not guarantee an application-consistent database backup. Quiesce the application or use its native backup procedure.

Instance metadata can configure startup scripts and OS Login. It is not a secret vault. Applications can reach the metadata server, so the VM service account defines an important security boundary. This lab attaches no service account because it needs no Google API access. A production application should receive a dedicated, minimally privileged account. OS Login integrates Linux login authorization with IAM; IAP supplies a tunnel without requiring a public VM address. These solve different problems. [OS Login documentation](https://docs.cloud.google.com/compute/docs/oslogin/set-up-oslogin)

## Hands-on: private access and lifecycle

1. Enable the APIs and create an isolated custom network. The example subnet is intentionally simple; choose a nonoverlapping range if you connect it to other networks.

```bash
gcloud services enable compute.googleapis.com iap.googleapis.com
gcloud compute networks create vm-lab-net --subnet-mode=custom
gcloud compute networks subnets create vm-lab-subnet \
  --network=vm-lab-net --region="$REGION" --range=10.60.0.0/24
gcloud compute firewall-rules create vm-lab-iap \
  --network=vm-lab-net --direction=INGRESS --action=ALLOW \
  --rules=tcp:22 --source-ranges=35.235.240.0/20 --target-tags=iap-ssh
```

2. Have your administrator grant your user `roles/compute.osLogin` (or `roles/compute.osAdminLogin` only if administrative shell access is needed) and `roles/iap.tunnelResourceAccessor`, scoped appropriately. Project-level Compute Viewer can supply discovery permissions. An IAM binding and the firewall rule are both required. Do not replace the IAP source range with unrestricted internet SSH.

3. Create a startup script that needs no package downloads, then create the VM.

```bash
cat > startup.sh <<'EOF'
#!/bin/bash
set -eu
printf 'startup completed at %s\n' "$(date -Is)" > /var/tmp/startup-proof.txt
logger -t roadmap-startup 'boot configuration completed'
EOF
gcloud compute instances create vm-lab \
  --zone="$ZONE" --machine-type=e2-small \
  --network=vm-lab-net --subnet=vm-lab-subnet --no-address \
  --image-family=debian-12 --image-project=debian-cloud \
  --boot-disk-size=10GB --boot-disk-type=pd-balanced \
  --no-service-account --no-scopes --tags=iap-ssh \
  --metadata=enable-oslogin=TRUE \
  --metadata-from-file=startup-script=startup.sh
gcloud compute ssh vm-lab --zone="$ZONE" --tunnel-through-iap \
  --command='cat /var/tmp/startup-proof.txt; uname -m; df -h /'
```

4. Inspect the instance and its serial output. Expect `RUNNING`, an internal address, no external `natIP`, and the startup confirmation. The no-public-IP design intentionally has no general internet egress; installing packages would require a planned egress path such as Cloud NAT.

```bash
gcloud compute instances describe vm-lab --zone="$ZONE" \
  --format='yaml(status,machineType,networkInterfaces,disks,serviceAccounts)'
gcloud compute instances get-serial-port-output vm-lab --zone="$ZONE"
gcloud compute instances stop vm-lab --zone="$ZONE"
gcloud compute instances start vm-lab --zone="$ZONE"
```

After restarting, read the startup file again: the timestamp changes because startup scripts run during boot. Design scripts to be idempotent. Stopping releases running compute consumption, but persistent disks, reserved addresses, and other resources can still cost money. Resetting is abrupt; prefer a clean shutdown when possible. [VM lifecycle](https://docs.cloud.google.com/compute/docs/instances/instance-lifecycle)

## Troubleshooting and operational checks

- An IAP connection timeout usually points to firewall targeting, the IAP range, guest SSH readiness, or tunnel permissions. A Linux permission denial instead points toward OS Login authorization or username configuration.
- A boot failure requires serial-output inspection before recreating resources. Check image architecture, disk fullness, and malformed startup scripts.
- A CPU graph alone is insufficient for sizing. Collect memory and disk metrics with the Ops Agent, then compare latency and throughput under representative load.

## Cleanup and exercises

```bash
gcloud compute instances delete vm-lab --zone="$ZONE"
gcloud compute firewall-rules delete vm-lab-iap
gcloud compute networks subnets delete vm-lab-subnet --region="$REGION"
gcloud compute networks delete vm-lab-net
```

Confirm the boot disk was auto-deleted; delete any intentionally retained lab disks separately. Exercise: explain how your design changes for a VM needing Secret Manager access, a Windows application, and an application requiring recovery in another zone. Produce a recovery procedure with an explicit recovery-time target.

## Official references

- [Machine families](https://docs.cloud.google.com/compute/docs/machine-resource)
- [Linux startup scripts](https://docs.cloud.google.com/compute/docs/instances/startup-scripts/linux)
- [IAP TCP forwarding](https://docs.cloud.google.com/iap/docs/using-tcp-forwarding)

