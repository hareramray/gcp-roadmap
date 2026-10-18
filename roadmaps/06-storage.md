# Storage roadmap

[Home](../README.md) · [Lab setup](../LAB-SETUP.md)

## Prerequisites and sequence

Learn projects, IAM, locations, VPC basics, Linux filesystems, and billing before deploying storage. Work through the three tutorials in order; plan approximately 5–8 hours for the core labs plus optional provisioned experiments. Every topic below links to its teaching and exercise. The goal is a storage decision you can defend with semantics, measurements, recovery evidence, and cost.

| Step | Topics to master | Tutorial and evidence |
|---|---|---|
| 1 | Buckets, objects, generations, prefixes and hierarchical namespace, locations, consistency, atomicity, generation preconditions, metadata, storage classes, Autoclass, FUSE, IAM, uniform bucket access, public access prevention, signed URLs, encryption, versioning, soft delete, lifecycle, holds and retention locks | [Cloud Storage](../tutorials/06-storage/01-cloud-storage.md): recover an older generation and explain every protection mechanism |
| 2 | Block versus file semantics; Persistent Disk, Hyperdisk, Local SSD; IOPS versus throughput; VM limits; snapshots and application consistency; Filestore NFS; NetApp Volumes enterprise protocols; Managed Lustre parallel workloads; mounts, client identity and network design | [Block, file, and parallel storage](../tutorials/06-storage/02-block-file-and-parallel-storage.md): select storage for four contrasting workloads |
| 3 | CLI copies and synchronization, manifests/checksums, Storage Transfer Service, agents, Transfer Appliance, bandwidth estimates, egress, backup versus replication, Backup and DR, vaults, RPO/RTO, retention and restore drills | [Transfer and backup](../tutorials/06-storage/03-data-transfer-and-backup.md): corrupt a source and restore validated business data |

## Practice progression

Start with tiny private objects. Add generation-aware recovery and lifecycle rules, then compare block/file/parallel choices using an explicit access pattern. Finish with a backup runbook that includes source-of-truth validation and a timed restore into an isolated destination. High-capacity file services and retention locks are design exercises until their costs and lifecycle commitments are understood.

For a capstone, design storage for an application with images, a transactional database, shared report files, and machine-learning checkpoints. Produce a table of location, protocol, availability, IAM identity, retention, expected monthly units, and recovery procedure for each dataset. State which storage survives a VM loss, a zone loss, a region outage, a mistaken overwrite, and a malicious deletion.

## Completion criteria

- Explain why object storage, block devices, and shared filesystems are not interchangeable.
- Estimate transfer time and separate storage, request, retrieval, early-deletion, and egress costs.
- Demonstrate a restore with content checks and a business-level invariant.
- Prove private access with the intended principal and identify every retained billable artifact after cleanup.
- Recheck current service tiers, limits, supported regions, and pricing before provisioning a production design.

Use the official references embedded in each tutorial. Product availability and performance limits are deliberately linked to live documentation instead of frozen as universal numbers.
