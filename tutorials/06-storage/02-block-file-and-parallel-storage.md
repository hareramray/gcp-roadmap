# Block, file, and parallel storage

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Storage roadmap](../../roadmaps/06-storage.md)

## Learning objectives and cost boundary

Choose among Persistent Disk, Hyperdisk, Local SSD, Filestore, NetApp Volumes, and Managed Lustre by application semantics and measurable performance requirements. Allow 90 minutes for the design lab and additional time for an optional provisioned lab. The default lab creates local planning files and reads service information only. File services can have substantial minimum provisioned capacity; estimate costs before creating them.

## Start with access semantics

Block storage presents a device to a VM. The operating system creates a filesystem or gives the device directly to a database. You own formatting, mounting, capacity planning, and application consistency. Shared attachment does not make an ordinary filesystem safe for concurrent writers; verify both the disk's supported access modes and the application's cluster coordination.

Persistent Disk is durable network-attached storage. Disk class, size, VM limits, and attachment topology affect throughput and IOPS. Hyperdisk offers performance-oriented volume types with supported combinations of separately provisioned capacity, throughput, and IOPS. It is not supported on every machine family, zone, or attachment mode. Local SSD is host-local scratch storage: design for loss when the underlying host or lifecycle event requires it. Replicate durable business data elsewhere. [Disk options](https://docs.cloud.google.com/compute/docs/disks) · [Hyperdisk](https://docs.cloud.google.com/compute/docs/disks/hyperdisks) · [Local SSD](https://docs.cloud.google.com/compute/docs/disks/local-ssd)

File storage exposes files and directories over network protocols. Filestore provides managed NFS, useful for existing Linux applications and shared content. The tier determines capacity, performance, availability, and supported features. NetApp Volumes is suited to enterprise file workloads needing supported NFS or SMB configurations, directory integration, snapshots, replication, and service-level choices. Protocol and feature support vary by service level; an SMB design must include identity integration, DNS, and client routing. [Filestore overview](https://docs.cloud.google.com/filestore/docs/overview) · [NetApp Volumes overview](https://docs.cloud.google.com/netapp/volumes/docs/discover/overview)

Managed Lustre provides a managed parallel filesystem for workloads such as HPC and AI training. Parallel clients and metadata-heavy workloads have different needs from a single database VM. Treat client compatibility, network topology, data import/export, and checkpoint recovery as part of the architecture. A parallel filesystem is not automatically a backup of its upstream dataset. [Managed Lustre overview](https://docs.cloud.google.com/managed-lustre/docs/overview)

## Turn application behavior into requirements

Write five numbers before comparing products: dataset size, working-set size, average I/O size, required IOPS, and sustained throughput. For example, 10,000 operations per second at 16 KiB each is about 156 MiB/s before overhead. A workload can be IOPS-limited while consuming modest bandwidth. A 4 GiB sequential checkpoint every 20 seconds averages about 205 MiB/s, but the required burst throughput is larger if each checkpoint must finish in five seconds.

Also record p95/p99 latency, concurrent clients, read/write ratio, durability, recovery point objective (RPO), recovery time objective (RTO), zone failure requirements, and whether applications require file locks or atomic renames. Benchmark with the actual access pattern. A large sequential synthetic read cannot validate a small-random-write database design.

## Lab: make a storage architecture decision

Prerequisites: [lab setup](../../LAB-SETUP.md), Cloud Shell Bash, compute read access if listing existing resources, and an empty working directory. The commands use `PROJECT_ID`, `REGION`, and `ZONE`. No new cloud service is provisioned in this default path.

```bash
mkdir -p storage-design-lab
cat > storage-design-lab/requirements.csv <<'CSV'
workload,capacity,pattern,sharing,recovery
orders-db,200GiB,16KiB random writes,single writer,zone failure recovery
web-content,2TiB,many small files,20 NFS clients,restore deleted directory
model-training,20TiB,parallel reads and checkpoints,64 Linux workers,reload source and checkpoints
sort-scratch,500GiB,temporary sequential writes,single worker,recompute everything
CSV
gcloud compute disk-types list --project="$PROJECT_ID" \
  --filter="zone:($ZONE)" --format="table(name,zone.basename())"
cat storage-design-lab/requirements.csv
```

1. For `orders-db`, first ask whether Cloud SQL or AlloyDB would reduce operational work. If self-managed storage is necessary, shortlist a supported durable block device, then choose zonal/regional topology and test database-consistent recovery. Do not select Local SSD as the only copy.
2. For `web-content`, shortlist Filestore for NFS. If the actual clients are Windows and require SMB plus enterprise directory integration, evaluate NetApp Volumes instead. Calculate minimum capacity and availability requirements using the current tier tables.
3. For `model-training`, compare Managed Lustre against Cloud Storage/FUSE and durable block caches using metadata rate, parallel client behavior, GPU idle time, and data staging time. The cheapest storage bill may produce the highest overall cost if expensive accelerators wait for data.
4. For `sort-scratch`, Local SSD is a candidate if the VM supports it and the job can replay after losing all scratch data. State exactly where the source and final output remain durable.
5. Open each selected service's console Create page, choose the intended location and service level, record the estimate, and cancel before creation. Record required network, subnet, private connectivity, firewall, and identity settings in `storage-design-lab/decision.md`.

## Optional provisioned verification

Only in a budgeted sandbox, create a small supported block disk through Compute Engine → Disks, attach it to a disposable VM, and verify it with `lsblk -f`. Identify the new empty device by disk ID before formatting; never format a guessed `/dev/sdX` path. Mount it by filesystem UUID, write a checksum-marked test file, unmount cleanly, detach, reattach, and verify the checksum. For snapshots, quiesce the application or use its backup mechanism when application-consistent recovery is required.

For a file-service trial, use a client on the documented private network, mount the export with the service's documented options, test two-client reads and writes, and restore a deliberately deleted disposable file from the selected protection mechanism. Do not interpret successful mounting as proof of performance or failover behavior.

## Failures, security, cleanup, and assessment

A mount timeout usually requires checking routes, firewall rules, authorized client networks, DNS, or export policy before filesystem permissions. Permission denied after mounting can be UID/GID mapping, root squashing, or directory ACLs. Poor IOPS can come from VM caps, queue depth, undersized volumes, or nonrepresentative benchmarks. Protect disks with IAM, restrict exports to intended clients, and give encryption-key access only to required service identities.

The default lab has no cloud cleanup; remove `storage-design-lab` only after saving your decision. If you provisioned anything, unmount and stop writers, remove lab instances/volumes/disks, then separately inspect snapshots, backups, replication copies, and reserved addresses for remaining charges. Submit a comparison table with one chosen option and one rejected option per workload. Pass when another engineer can reproduce your reasoning, estimates, verification plan, and loss/recovery assumptions.
