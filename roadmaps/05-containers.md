# Containers and GKE roadmap

[Curriculum home](../README.md) · [Shared lab setup](../LAB-SETUP.md)

## Goal and prerequisites

Learn how an application becomes an immutable image, how Kubernetes reconciles application state, and how GKE supplies managed cluster infrastructure. Prerequisites are Linux process/network basics, HTTP, IAM, VPC addressing, and the compute roadmap's identity and lifecycle concepts. Use Google Cloud Shell Bash for the examples, including when your local workstation runs Windows.

Suggested pace: 15–22 focused hours. Read Kubernetes fundamentals before creating a cluster, then create **one** GKE lab cluster and reuse it for the fundamentals, security, and operations exercises. Delete it when the track is complete. The ordering below is conceptual; the GKE creation tutorial supplies the cluster prerequisite for hands-on Kubernetes work.

## Topic-to-tutorial map

| Order | Tutorial | Detailed coverage | Evidence to produce |
| --- | --- | --- | --- |
| 1 | [Docker and Artifact Registry](../tutorials/05-containers/01-docker-and-artifact-registry.md) | Container/image distinction; OCI; Dockerfiles; build context; non-root execution; tags and digests; registry authentication; caching; repository policy; cleanup | Local HTTP image, successful registry push, recorded immutable digest, and reviewed cleanup policy |
| 2 | [Kubernetes fundamentals](../tutorials/05-containers/02-kubernetes-fundamentals.md) | API/controllers/scheduler; Pods; Deployments and ReplicaSets; Services and DNS; ConfigMaps and Secrets; requests/limits; placement; storage; Jobs/DaemonSets/StatefulSets | Ready replicas, Service discovery, observed reconciliation, and diagnosis of an intentional selector error |
| 3 | [GKE Autopilot and Standard](../tutorials/05-containers/03-gke-autopilot-and-standard.md) | Operating-model tradeoffs; cluster creation; regional/zonal behavior; IP ranges; credentials; release channels; upgrades; node identity; cost and cleanup | One bounded learning cluster, inspected configuration, IP-capacity estimate, and operating-model decision |
| 4 | [GKE security and workload identity](../tutorials/05-containers/04-gke-security-and-workload-identity.md) | IAM versus RBAC; Kubernetes accounts; direct federation and impersonation; least privilege; NetworkPolicy; Pod security; Secret Manager CSI; trust-domain boundaries | Keyless bucket read, denied write, scoped Pod-reading RBAC, and a documented network-policy design |
| 5 | [GKE operations and multicluster](../tutorials/05-containers/05-gke-operations-and-multicluster.md) | Readiness/liveness/startup probes; PDBs; HPA/VPA/node scaling; topology; Ingress and Gateway; fleets; multicluster discovery; service mesh; rollout and incident diagnosis | Probe/PDB/HPA observations, a traffic-routing design, and a two-region failure/runbook exercise |

## Learning sequence in practice

Build and run the local image first. This makes later Kubernetes failures easier to isolate: you already know the container starts and listens correctly. Next read the Kubernetes object model, create one GKE cluster, and apply the fundamentals manifest. Confirm Pod readiness, Service endpoints, and a local port-forward before adding public traffic components.

Then separate application identity from node identity and test permission boundaries. Finally, add operating controls and explain their limits. Do not introduce multicluster routing or mesh simply to compensate for an application that does not yet handle retries, timeouts, readiness, or graceful termination.

## Completion gates

- Trace an image from source through a registry digest to a running container.
- Explain why deleting a Pod and deleting a Deployment produce different outcomes.
- Diagnose `Pending`, `ImagePullBackOff`, `CrashLoopBackOff`, failed readiness, and missing Service endpoints using evidence.
- Explain requests, limits, HPA calculations, and why adding Pods may require node capacity or additional IP addresses.
- Demonstrate Google API access without a service-account key, and explain why RBAC does not grant Cloud Storage access.
- State what a PDB protects, what it does not protect, and how a rolling deployment's availability is controlled.
- Separate traffic failover from data replication when proposing a multiregion system.

## Portfolio deliverable

Package a small service with a Dockerfile, pinned image digest, Kubernetes manifests, scoped identity configuration, operational dashboard sketch, and incident runbook. Include resource requests, probes, scaling limits, cleanup commands, and evidence from an intentional failure. Keep real secrets out of the repository. Label enterprise network, CSI, Gateway, or mesh configurations as planned when they have not been executed in an authorized environment.

The optional multicluster exercise should specify failure domains, identity trust, routing, data consistency, and recovery tests before selecting more tooling. Two clusters can duplicate a misconfiguration just as efficiently as one cluster.

## Maintenance references

Check [GKE release notes](https://docs.cloud.google.com/kubernetes-engine/docs/release-notes), [GKE documentation](https://docs.cloud.google.com/kubernetes-engine/docs), [Kubernetes documentation](https://kubernetes.io/docs/), and [Artifact Registry documentation](https://docs.cloud.google.com/artifact-registry/docs) before reusing version-sensitive manifests or cluster flags. Follow the official references in each tutorial for details and supported feature combinations.

