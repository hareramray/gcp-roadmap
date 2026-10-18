# GKE Autopilot and Standard: cluster decisions

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## What you will decide

Choose a cluster operating model, create one bounded learning cluster, obtain credentials, and inspect version and networking settings. Use Cloud Shell Bash and the shared setup. This is a paid lab; create **one** option, not both. Keep the cluster only while completing the Kubernetes tutorials, then delete it. Budget for cluster management, compute, disks, logging, network traffic, and any load balancers created by workloads.

Autopilot manages more node provisioning, scaling, and security configuration for you. Standard exposes node-pool configuration and operational choices needed by some specialized workloads. Autopilot is not merely Standard with one checkbox, and Standard is not inherently cheaper. Cost depends on resource requests, supported workload classes, utilization, and the applicable billing model. Some specialized Autopilot workloads use node-based billing; consult the current pricing model rather than assuming all Pods are priced identically. [Autopilot overview](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/autopilot-overview)

Regional clusters replicate the control plane across zones. This improves control-plane availability but does not guarantee that your application replicas span zones. A regional Standard node pool can create nodes in several zones; `--num-nodes` is commonly per zone, which surprises learners expecting a single small VM. A zonal learning cluster limits cost and availability together. Production cluster topology should follow recovery requirements.

## Before cluster creation

Choose nonoverlapping ranges for node, Pod, and Service addresses. VPC-native clusters use alias IPs for Pods. Check secondary-range sizing against maximum Pods per node and maximum node count; IP exhaustion can block scaling even when CPU quota remains. Decide how administrators reach the control plane, how private nodes access Google APIs and public package repositories, and whether egress requires Cloud NAT.

This tutorial creates a dedicated network and subnet. The basic lab leaves ordinary outbound connectivity available and does not implement an enterprise private-control-plane design. Do not put sensitive production workloads in it. Use the security tutorial to evaluate private access, authorized networks, DNS endpoints, and identity controls.

```bash
gcloud services enable container.googleapis.com compute.googleapis.com
gcloud compute networks create gke-lab-net --subnet-mode=custom
gcloud compute networks subnets create gke-lab-subnet \
  --network=gke-lab-net --region="$REGION" --range=10.62.0.0/24 \
  --secondary-range=gke-pods=10.64.0.0/16,gke-services=10.65.0.0/20
```

## Option A: Autopilot

```bash
gcloud container clusters create-auto gke-lab-auto \
  --region="$REGION" --release-channel=regular \
  --network=gke-lab-net --subnetwork=gke-lab-subnet \
  --cluster-secondary-range-name=gke-pods \
  --services-secondary-range-name=gke-services
gcloud container clusters get-credentials gke-lab-auto --region="$REGION"
```

Expect regional control-plane configuration and Workload Identity Federation for GKE enabled. Nodes may provision as workloads arrive; no immediately visible application nodes is not necessarily an error. Admission can adjust resource requests or reject unsupported privileged settings. Inspect the resulting Pod specification rather than assuming your submitted values were unchanged.

## Option B: a small Standard learning cluster

```bash
gcloud container clusters create gke-lab-standard \
  --zone="$ZONE" --release-channel=regular \
  --machine-type=e2-standard-2 --num-nodes=1 \
  --network=gke-lab-net --subnetwork=gke-lab-subnet \
  --enable-ip-alias --cluster-secondary-range-name=gke-pods \
  --services-secondary-range-name=gke-services \
  --workload-pool="${PROJECT_ID}.svc.id.goog" \
  --enable-dataplane-v2
gcloud container clusters get-credentials gke-lab-standard --zone="$ZONE"
```

For production Standard clusters, create an explicitly scoped node service account following GKE's node-account guidance instead of relying on a broadly privileged default. Node identity is different from application identity. This small cluster is intentionally a single failure domain and can experience disruption during maintenance; it is not an HA reference architecture.

## Verify and plan upgrades

```bash
kubectl config current-context
kubectl cluster-info
kubectl get nodes -o wide
gcloud container get-server-config --region="$REGION" \
  --format='yaml(channels)'
```

Deploy the fundamentals tutorial's workload and confirm it becomes ready. Use `gcloud container clusters describe` with the appropriate location to inspect release channel, current version, workload pool, IP allocation, and maintenance policy. Release channels balance feature arrival and stability; maintenance windows and exclusions influence upgrade timing within supported limits. They do not authorize running an unsupported version indefinitely. Test API removals and workload compatibility before upgrades. [Release channels](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/release-channels)

For Standard node upgrades, understand surge and blue-green strategies, quota headroom, PodDisruptionBudgets, and graceful termination. Control-plane upgrades and node upgrades are related but separate operations. A PDB can constrain voluntary evictions but cannot prevent a node crash.

## Troubleshooting, cleanup, and exercises

Creation failures can result from missing API permissions, quota, organization policies, overlapping ranges, or regional capacity. Authentication failures after `get-credentials` can mean the GKE auth plugin is missing in a local environment; Cloud Shell normally provides it. A working `kubectl` connection does not imply authorization for every Kubernetes operation.

Delete application namespaces first, and wait for load balancers and disks to finish their intended lifecycle. Then delete only the cluster you created:

```bash
# Select the command matching your chosen option.
gcloud container clusters delete gke-lab-auto --region="$REGION"
# OR: gcloud container clusters delete gke-lab-standard --zone="$ZONE"
gcloud compute networks subnets delete gke-lab-subnet --region="$REGION"
gcloud compute networks delete gke-lab-net
```

Exercise: calculate Pod address capacity for a planned node count, then write a one-page choice between Autopilot and Standard for a web application and for a privileged node agent. Include operational staffing and upgrade ownership.

## Official references

- [Cluster choices](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/configuration-overview)
- [Regional clusters](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/regional-clusters)
- [VPC-native clusters](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/alias-ips)
- [GKE pricing](https://cloud.google.com/kubernetes-engine/pricing)

