# Capstone: a reproducible GKE application platform

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Goal and prerequisites

Build a small platform that deploys an application reproducibly, isolates its identity, observes health, and survives a controlled rollout failure. Complete [Terraform](../10-devops/01-terraform.md), [Kubernetes](../05-containers/02-kubernetes-fundamentals.md), [GKE modes](../05-containers/03-gke-autopilot-and-standard.md), [workload security](../05-containers/04-gke-security-and-workload-identity.md), [GKE operations](../05-containers/05-gke-operations-and-multicluster.md), and [Cloud Deploy](../10-devops/04-cloud-deploy.md).

Plan 16–30 focused hours. Obtain a project with approved quotas and permissions and price the cluster, workloads, load balancing, disks, logs, and network egress. Autopilot and Standard have different responsibility/cost models. A design-only mode must retain the same artifacts and mark unexecuted acceptance tests honestly.

## Define the platform contract

The platform team owns network boundaries, cluster policy, deployment controls, and shared observability. The application team owns code, resource requests, health behavior, runtime permissions, and service objectives. A namespace is useful organization but is not by itself a hard security boundary between mutually untrusted tenants.

Choose one simple stateless application and one internal dependency mock. Use distinct Kubernetes service accounts and Workload Identity Federation for supported Google API access. Decide whether private nodes/control-plane access restrictions fit your available administration path before creating a cluster. A secure cluster that your authorized deployment system cannot reach is an incomplete design.

## Implementation stages

1. **Repository:** separate application source, Kubernetes manifests or chart, infrastructure code, and operational runbooks. Add a README with exact setup and teardown order. Choose a version-pinning and upgrade policy.
2. **Infrastructure plan:** define VPC/subnet/Pod address requirements, cluster mode, region, release channel, IAM, repository, and remote Terraform state. Run formatting, validation, and plan. Inspect the plan for unintended public access and replacement operations.
3. **Cluster:** encode the selected GKE tutorial settings in Terraform and create the cluster through the reviewed plan. Its standalone `gcloud ... create` commands are a reference for choices, not a second creation step for the same resource. If you intentionally reuse an existing lab cluster, import it into the intended Terraform state and reconcile a no-surprise plan before claiming reproducible ownership. Confirm cluster access and install no unnecessary privileged add-ons. Record the management responsibilities that differ between modes.
4. **Workload:** define resource requests/limits, readiness and liveness behavior, startup handling where needed, service account, non-root security context, and graceful shutdown. Use multiple replicas only when justified and budgeted.
5. **Networking:** expose the app through a supported test access path. Apply a deliberate network policy and test allowed and denied communication. Avoid a policy that blocks DNS or health checks unintentionally.
6. **Identity:** let the app read one synthetic cloud resource through its federated identity. Confirm a second application with no grant cannot read it. Avoid mounting a service-account JSON key.
7. **Delivery:** build/scans/signals as supported, publish an immutable image, deploy to a test namespace or target, and promote a verified release. The Cloud Deploy prerequisite demonstrates Cloud Run: replace its Cloud Run service manifests with Kubernetes Deployment/Service manifests, use Skaffold's Kubernetes deployer, and configure a GKE target identifying the actual cluster. Adapt execution IAM, Kubernetes authorization, and control-plane reachability for GKE instead of copying the Cloud Run roles unchanged. Require review for the appropriate production-like promotion step in the design.
8. **Operations:** collect application metrics/logs, define an SLO, configure a useful alert, and document how an operator finds the currently deployed digest and last release.

## Controlled failure drills

Deploy an image with a readiness failure and observe rollout behavior. Confirm healthy capacity remains according to your deployment strategy and available resources. Roll back and record the recovery time. Then simulate a worker pod termination and verify graceful termination and retry behavior. Do not perform destructive regional-failure experiments in shared infrastructure.

Test resource exhaustion in a narrowly bounded environment. A PodDisruptionBudget constrains supported voluntary evictions; it does not guarantee application availability during every failure. Horizontal autoscaling relies on metrics and resource definitions, while cluster capacity must still become available. Explain the interaction rather than assuming either autoscaler is unlimited.

## Acceptance and troubleshooting

Pass when a fresh environment can be planned and created from code, an authorized app can access only its intended cloud resource, an unauthorized app fails, a bad rollout is detected, rollback works, and operators can trace a request. Save outputs showing image digest, deployment revision, health checks, policy denial, and recovery measurement.

For Pending Pods inspect events, resource requests, scheduling constraints, quota, and capacity. For CrashLoopBackOff inspect current and previous container logs, startup configuration, and probes. For network failure separate DNS, Service selectors/endpoints, policies, ingress/gateway, and application listener. For IAM denial inspect Kubernetes identity mapping and target policy.

## Cleanup and portfolio

Delete application ingress/gateway and external serving resources, workloads and owned persistent volumes, then the cluster and remaining infrastructure through a reviewed destroy plan. Verify that load balancers, IPs, disks, artifact images, logs, and state buckets are intentionally handled. Do not delete state before destroying the resources it tracks.

Deliver source, manifests, architecture, responsibility model, CI/CD description, failure evidence, cost estimate, upgrade plan, and runbook. State which controls were implemented and which remain design proposals.

## References

- [GKE documentation](https://docs.cloud.google.com/kubernetes-engine/docs)
- [GKE security overview](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/security-overview)
- [Cloud Deploy](https://docs.cloud.google.com/deploy/docs)
- [Cloud Deploy GKE targets](https://docs.cloud.google.com/deploy/docs/gke-targets)
- [Terraform on Google Cloud](https://docs.cloud.google.com/docs/terraform)
