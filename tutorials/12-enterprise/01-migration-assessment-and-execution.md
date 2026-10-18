# Migration assessment, planning, and execution

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Create a migration wave plan with dependencies, a tested cutover, and an honest rollback boundary. This enterprise design lab uses synthetic inventory and Cloud Shell Bash. Use `PROJECT_ID`, `REGION`, and `ZONE` from the setup guide for the hypothetical target. No discovery agent is installed in a real network and no source system is scanned. A live assessment requires source-owner approval, scoped credentials, network access, relevant migration APIs, product-specific IAM, and review of collected metadata. Destination infrastructure and migration traffic may be billable.

## Assess before selecting a tool

Inventory applications, servers, databases, dependencies, data volumes, utilization, licenses, support status, owners, and recovery requirements. Peak and seasonal usage matter; a quiet afternoon snapshot can understate capacity. Discover both inbound and outbound dependencies, including DNS, identity, batch jobs, file shares, certificates, monitoring, and vendor allowlists. Validate automated observations with application owners.

Migration Center supports discovery and assessment using supported collection methods and manual imports. Choose collection based on available permissions, source platforms, acceptable intrusiveness, and the measurement period. Configuration and dependency metadata still require protection even when application payloads are not collected. [Migration Center discovery](https://docs.cloud.google.com/migration-center/docs/start-asset-discovery).

Choose an application strategy: retire unused software, retain where constraints dominate, replace with SaaS, rehost on VMs, replatform onto managed services or containers, or refactor architecture. These are decisions per workload, not a universal ranking. Migrate to Virtual Machines can support replication, test clones, and cutover for supported sources; compatibility and target sizing must be checked. [VM migration journey](https://docs.cloud.google.com/migrate/virtual-machines/docs/5.0/discover/migrating-vms-migrate-for-compute-engine-getting-started).

Migrate to Containers helps produce container artifacts from supported VM workloads. Containerization does not automatically make an application stateless, secure, or cloud-native. Database Migration Service supports documented source/destination combinations, initial load, and applicable ongoing replication; schema conversion and application compatibility remain work for the migration team. It is not a general dual-write conflict-resolution service. [Migrate to Containers](https://docs.cloud.google.com/migrate/containers/docs/getting-started), [Database Migration Service](https://docs.cloud.google.com/database-migration/docs/overview).

## Lab: migrate a fictional retail application

1. Create the inventory locally:

   ```bash
   cat > migration-inventory.csv <<'EOF'
   asset,role,depends_on,strategy
   web01,frontend,app01,replatform
   app01,orders-service,db01;idp01,rehost-first
   db01,postgres-database,backup01,managed-database-candidate
   idp01,identity,,retain
   backup01,backup-service,,replace-after-restore-test
   EOF
   column -s, -t migration-inventory.csv
   ```

2. Add measurements: peak CPU, memory, disk latency, daily changed bytes, network throughput, database extensions, connection count, and a maintenance window. Mark unknown values explicitly. Do not invent a small VM size merely to complete a cost estimate.

3. Group the orders application and database into a dependency-aware wave. Plan identity connectivity first. Define target networking, IP/DNS changes, service identities, secret delivery, logging, quota, and backup configuration before scheduling application cutover.

4. Specify an isolated test clone. Prevent it from sending real emails, charging payment methods, processing production queues, or writing to production systems. Validate startup, authentication, representative transactions, batch processing, performance, and backup restore. Capture observed differences from the source.

5. Design database cutover: complete initial load, monitor replication lag, resolve incompatible objects, pause source writes, drain transactions, confirm convergence, promote the target according to the selected product, switch application connection configuration, and validate business totals. Record the exact point after which simple rollback is no longer safe because the target accepts new writes.

6. Create rollback branches. Before target writes, restore the old endpoint if validation fails. After target writes, determine whether reverse replication, reconciliation, or a forward fix is possible; do not promise lossless rollback without a tested mechanism. Include a decision deadline and accountable approver.

7. Plan hypercare and decommissioning: compare SLOs, cost, backup success, security findings, and support incidents; then remove migration infrastructure and retire the source only after retention, licensing, and recovery gates are satisfied.

## Verification, cleanup, costs, and exercises

Acceptance requires a signed dependency map, measurable test results, a cutover checklist, explicit rollback boundary, and decommission criteria. Common failures include missed DNS dependencies, unsupported database features, insufficient bandwidth, duplicated scheduled jobs, timezone differences, and declaring success solely because a VM boots.

Delete the synthetic CSV after review or retain it as a portfolio artifact. Real parallel running, temporary disks, replication, egress, licenses, and consultants can dominate migration cost. Extend the plan to an application with a two-minute outage limit and explain which assumptions require a proof of concept before a date can be committed.

