# Compute roadmap

[Curriculum home](../README.md) · [Shared lab setup](../LAB-SETUP.md)

## Goal and prerequisites

Learn to select and operate Google Cloud compute by workload shape, failure model, security requirements, and cost per useful result. Start with project setup, IAM basics, Linux processes, HTTP, VPC concepts, and the difference between durable and ephemeral storage. All command examples use Google Cloud Shell Bash; Windows users can follow them without rewriting commands for PowerShell.

Suggested pace: 12–18 focused hours across one or two weeks, plus optional design exercises. Lab time depends on provisioning and troubleshooting. Reading and local exercises are useful without deployment; cloud labs can incur charges and must be cleaned up. GPU, TPU, and specialized HPC work is a planning exercise unless an explicitly budgeted accelerator environment is available.

## Ordered topic-to-tutorial map

| Order | Tutorial | Detailed coverage | Evidence to produce |
| --- | --- | --- | --- |
| 1 | [Compute Engine](../tutorials/04-compute/01-compute-engine.md) | VM lifecycle; machine families and architecture; images versus snapshots; disks; metadata and startup scripts; no-public-IP access; OS Login; IAP; runtime identity | Private VM login, boot-script proof, lifecycle observations, and a recovery sketch |
| 2 | [Managed instance groups](../tutorials/04-compute/02-managed-instance-groups.md) | Immutable templates; regional distribution; autoscaling signals; autohealing versus serving health; surge capacity; rolling updates; rollback; stateful considerations | Healthy regional group, verified template rollout, and a zone-failure capacity calculation |
| 3 | [Cloud Run](../tutorials/04-compute/03-cloud-run.md) | Services and jobs; container contract; concurrency; scaling bounds; billing choices; revisions; authentication; traffic migration; task completion | Private service response, recorded revision split, successful finite job, and downstream connection budget |
| 4 | [Cloud Run functions](../tutorials/04-compute/04-cloud-run-functions.md) | Current naming and legacy management paths; source builds; Functions Framework; HTTP handlers; CloudEvents; Eventarc routing; trigger identities; retries and idempotency | Local function tests, optional private deployment, and a duplicate-event handling design |
| 5 | [App Engine](../tutorials/04-compute/05-app-engine.md) | Application/service/version hierarchy; standard versus flexible; runtime and scaling contracts; location decisions; traffic splitting; existing-app dependencies; migration tradeoffs | Working local application, optional version deployment, and a migration dependency matrix |
| 6 | [Batch, HPC, GPU, and TPU](../tutorials/04-compute/06-batch-hpc-gpu-tpu.md) | Jobs/tasks/runnables; allocation and parallelism; Spot interruptions; checkpoints; tightly coupled workloads; accelerator compatibility; quota versus capacity; placement and economics | Bounded CPU job or reviewed specification, plus accelerator sizing and recovery worksheet |

## Decision practice

Work through three scenarios using only the services covered above. First, choose a home for a stateless authenticated HTTP API with intermittent demand. Second, design an existing OS-dependent application that needs predictable VM configuration and controlled fleet rollout. Third, design a parallel report-processing pipeline that can retry individual partitions. For each, record why the chosen service meets the requirements, what remains your responsibility, and which measured signal would make you reconsider.

Avoid selecting a product solely because it scales automatically. Scaling requires a correct application model, sufficient quota/capacity, and downstream services that can absorb demand. Compare a service's recovery behavior with the application's acceptable downtime and data-loss target. A regional control plane, replicated VM fleet, or managed runtime does not by itself solve database recovery.

## Completion gates

- Explain the difference between identity used to deploy, identity used by a workload, and identity allowed to invoke it.
- Demonstrate a successful path and an expected denied path without weakening IAM or opening broad firewall access.
- Distinguish readiness, liveness, autohealing, request retry, and task retry.
- Trace one release from configuration or source to the exact VM template, revision, or job specification that ran.
- Produce a rollback procedure that explicitly addresses database changes and external side effects.
- Verify cleanup by listing remaining compute, disks, addresses, artifact storage, and associated service resources.

## Portfolio deliverable

Create a short architecture decision record comparing a VM/MIG implementation, a Cloud Run implementation, and a Batch implementation of appropriate workloads. Include a diagram, identity table, failure scenario, cost assumptions, verification evidence, and cleanup inventory. Mark experiments that were designed but not executed; do not present a conceptual accelerator plan as a measured benchmark.

## Maintenance references

Use each tutorial's official sources for implementation details. Before repeating a cloud lab, recheck [Compute Engine documentation](https://docs.cloud.google.com/compute/docs), [Cloud Run documentation](https://docs.cloud.google.com/run/docs), [App Engine documentation](https://docs.cloud.google.com/appengine/docs), and [Batch documentation](https://docs.cloud.google.com/batch/docs) for runtime support, quotas, locations, and changed flags. This roadmap is a broad learning path, not a claim to enumerate every product feature.

