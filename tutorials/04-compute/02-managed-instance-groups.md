# Managed instance groups: immutable fleets

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and architecture

Build a regional managed instance group (MIG), observe instance replacement, and perform a controlled template rollout. Use Cloud Shell Bash with the lab setup variables. This is a paid lab: three small VMs, disks, and possible temporary surge capacity. Finish the single-VM tutorial first. Allow approximately one hour.

A MIG reconciles a desired fleet of VMs against an instance template. Manually changing a member VM does not change the template; those changes disappear when the VM is replaced. A regional MIG distributes instances across zones, reducing dependence on a single zone. It does not make the application automatically resilient: sessions, database dependencies, load balancing, and enough surviving-zone capacity still matter.

Templates are immutable. Create a new template for a new release, then tell the group how to update. Autoscaling changes the desired instance count using signals such as CPU, load-balancing utilization, or supported monitoring metrics. Autohealing recreates unhealthy instances. Load-balancer health checks decide which backends receive traffic; autohealing checks decide whether to destroy and replace a VM. Use more conservative autohealing thresholds to avoid replacement storms during transient failures. [MIG concepts](https://docs.cloud.google.com/compute/docs/instance-groups)

## Hands-on: templates and a regional group

Create a dedicated network and allow only Google's health-check ranges to the application port. The startup application uses Python already present in the chosen Debian image; if a future image lacks it, build an image containing the interpreter rather than introducing unplanned internet egress.

```bash
gcloud services enable compute.googleapis.com
gcloud compute networks create mig-lab-net --subnet-mode=custom
gcloud compute networks subnets create mig-lab-subnet \
  --network=mig-lab-net --region="$REGION" --range=10.61.0.0/24
gcloud compute firewall-rules create mig-lab-health \
  --network=mig-lab-net --allow=tcp:8080 --target-tags=mig-http \
  --source-ranges=130.211.0.0/22,35.191.0.0/16
cat > startup-v1.sh <<'EOF'
#!/bin/bash
set -eu
mkdir -p /srv/roadmap
printf 'release=v1 host=%s\n' "$(hostname)" > /srv/roadmap/index.html
cat > /etc/systemd/system/roadmap.service <<'UNIT'
[Unit]
Description=Roadmap lab web server
After=network.target
[Service]
WorkingDirectory=/srv/roadmap
ExecStart=/usr/bin/python3 -m http.server 8080 --bind 0.0.0.0
Restart=always
User=nobody
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now roadmap
EOF
gcloud compute instance-templates create mig-lab-v1 \
  --machine-type=e2-small --network=mig-lab-net --subnet=mig-lab-subnet \
  --region="$REGION" --no-address --no-service-account --no-scopes \
  --image-family=debian-12 --image-project=debian-cloud \
  --tags=mig-http --metadata-from-file=startup-script=startup-v1.sh
gcloud compute instance-groups managed create mig-lab \
  --region="$REGION" --template=mig-lab-v1 --size=3
gcloud compute health-checks create http mig-lab-check \
  --port=8080 --request-path=/ --check-interval=10s \
  --healthy-threshold=2 --unhealthy-threshold=3
gcloud compute instance-groups managed update mig-lab \
  --region="$REGION" --health-check=mig-lab-check --initial-delay=180
gcloud compute instance-groups managed wait-until mig-lab \
  --region="$REGION" --stable
gcloud compute instance-groups managed list-instances mig-lab --region="$REGION"
```

Expect three running instances and eventually healthy application states. A startup delay is a grace period before autohealing judges a new VM. Tune it from measured initialization time, not an arbitrary guess. This lab does not add a load balancer; the health check directly probes the VM addresses.

## Scaling and controlled change

```bash
gcloud compute instance-groups managed set-autoscaling mig-lab \
  --region="$REGION" --min-num-replicas=3 --max-num-replicas=4 \
  --target-cpu-utilization=0.65 --cool-down-period=180
sed 's/release=v1/release=v2/' startup-v1.sh > startup-v2.sh
gcloud compute instance-templates create mig-lab-v2 \
  --machine-type=e2-small --network=mig-lab-net --subnet=mig-lab-subnet \
  --region="$REGION" --no-address --no-service-account --no-scopes \
  --image-family=debian-12 --image-project=debian-cloud \
  --tags=mig-http --metadata-from-file=startup-script=startup-v2.sh
gcloud compute instance-groups managed rolling-action start-update mig-lab \
  --region="$REGION" --version=template=mig-lab-v2 \
  --max-surge=3 --max-unavailable=0
gcloud compute instance-groups managed wait-until mig-lab --region="$REGION" --stable
```

Regional MIG fixed rollout limits must respect the number of participating zones; three surge VMs can temporarily double this lab's size. Reserve quota and cost headroom. A percentage-based policy is another option for larger fleets. Examine each member's template after the update. A rollback repeats the update with `mig-lab-v1`; rollback does not undo database writes or external effects. Canary updates can assign a second template to part of the fleet, but require representative traffic and clear success metrics. [Rolling updates](https://docs.cloud.google.com/compute/docs/instance-groups/rolling-out-updates-to-managed-instance-groups)

Stateful MIGs preserve specified disks or metadata for specialized workloads. They change recovery and scaling assumptions, so do not treat a stateless web-tier procedure as a stateful database procedure.

## Troubleshooting, cleanup, and exercises

A group that repeatedly recreates VMs usually has an application boot error, incorrect health-check port, blocked firewall, or insufficient initialization grace. Inspect serial logs before increasing thresholds. An update that stalls can indicate quota exhaustion, insufficient zonal capacity, or zero healthy replacement instances. Autoscaling cannot fix a downstream database bottleneck.

```bash
gcloud compute instance-groups managed delete mig-lab --region="$REGION"
gcloud compute health-checks delete mig-lab-check
gcloud compute instance-templates delete mig-lab-v1 mig-lab-v2
gcloud compute firewall-rules delete mig-lab-health
gcloud compute networks subnets delete mig-lab-subnet --region="$REGION"
gcloud compute networks delete mig-lab-net
```

Exercise: draw the load-balancer path you would add, choose a stricter readiness check than `/`, and calculate whether the remaining zones could carry peak traffic after one zone fails. Explain why a deployment and an autoscaling event can compete for quota.

## Official references

- [Regional MIG distribution](https://docs.cloud.google.com/compute/docs/instance-groups/regional-migs)
- [Autoscaling groups](https://docs.cloud.google.com/compute/docs/autoscaler)
- [Autohealing](https://docs.cloud.google.com/compute/docs/instance-groups/autohealing-instances-in-migs)

