# Reliability, backups, and disaster recovery

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Design a recoverable application and prove a local restore, separating availability from data protection. Use Cloud Shell Bash with Python 3 and the setup guide's `PROJECT_ID`, `REGION`, and `ZONE` for the proposed architecture. The local exercise needs no cloud API. A real Backup and DR deployment needs its API, supported workloads, backup administration/service-agent permissions, reviewed retention, and billing. Do not provision a vault or lock retention as part of this design exercise.

## Define the failure before choosing redundancy

Availability concerns serving requests despite failures. Durability concerns retaining data. A replica can improve availability while rapidly replicating an accidental deletion. A backup protects an earlier state, but restoration may take time. A snapshot can be crash-consistent rather than application-consistent; databases may need transaction-log or application-aware procedures. Treat backups, high availability, replication, and disaster recovery as complementary mechanisms.

Recovery point objective (RPO) is the acceptable data-loss interval; recovery time objective (RTO) is the acceptable restoration interval. Include detection, decision, provisioning, data restoration, validation, traffic changes, and business reconciliation in RTO. A ten-minute restore operation does not establish a ten-minute end-to-end recovery. [Disaster recovery planning](https://docs.cloud.google.com/architecture/dr-scenarios-planning-guide).

Choose failure domains intentionally: process, instance, zone, region, project, credentials, and data corruption. Multi-region architecture adds replication, consistency, networking, residency, and operational tradeoffs. Active-active writes require conflict and partition handling; warm standby requires maintained capacity and tested activation. Avoid assuming a backup in another region can be restored if its encryption key or administrator identity is unavailable.

Backup and DR uses backup plans, rules, protected resources, and vaults for supported workloads. Vault-enforced retention can protect backups from early deletion but also creates obligations and costs. Workload compatibility, location, and recovery features must be checked individually. As reviewed on 18 October 2026, documentation deprecates the legacy appliance management console from 30 September 2026; new-backup support on that legacy stack ends 30 September 2027 and standard restores continue until 31 March 2028. Prefer current workflows and verify migration guidance. [Backup and DR overview](https://docs.cloud.google.com/backup-disaster-recovery/docs/concepts/backup-dr).

## Lab: restore data and design the whole recovery

1. Create a local synthetic application state and backup:

   ```bash
   mkdir -p dr-lab/live dr-lab/backup dr-lab/restored
   printf 'order_id,total\nO001,1250\nO002,750\n' > dr-lab/live/orders.csv
   cp dr-lab/live/orders.csv dr-lab/backup/orders.csv
   sha256sum dr-lab/backup/orders.csv
   ```

2. Simulate corruption in the lab copy only and restore into a separate path:

   ```bash
   printf 'corrupted-training-data\n' > dr-lab/live/orders.csv
   cp dr-lab/backup/orders.csv dr-lab/restored/orders.csv
   cmp dr-lab/backup/orders.csv dr-lab/restored/orders.csv
   ```

   `cmp` should exit successfully with no output. This proves byte restoration for the toy file, not application correctness or a production DR capability.

3. Validate the business invariant: two rows and total 2,000. Record restore start, completion, validation completion, and the backup's age. An intact file with the wrong schema or missing related tables is not a successful application recovery.

4. Design an orders service with RPO 15 minutes and RTO two hours. List the database, object storage, container image, configuration, secrets, DNS, encryption keys, IAM, quotas, and deployment pipeline needed to recover. Assign an owner and an independent recovery path to each critical dependency.

5. Write the failover sequence: declare disaster, stop or fence conflicting writers, select the recovery point, restore infrastructure and data, validate integrity and authentication, shift traffic, monitor, and reconcile lost or duplicate transactions. Add a failback sequence; returning to the original region is another migration, not simply switching DNS back.

6. Define a quarterly drill in an isolated environment. Use synthetic data, verify restore permissions before the drill, and record measured RPO/RTO. Include a compromised-administrator scenario to test whether the recovery copy shares the same destructive permissions as production.

## Verification, cleanup, costs, and exercises

Acceptance requires both the local integrity check and a dependency-complete recovery runbook. Common failures include untested backups, missing keys, inaccessible images, insufficient recovery-region quotas, unreplicated secrets, expired certificates, and DNS caching assumptions. [Backup operations](https://docs.cloud.google.com/backup-disaster-recovery/docs/backup/overview-of-backup-operations).

Remove only the local `dr-lab` directory after inspecting its path. Real backup storage, cross-region transfer, standby compute, restore tests, and enforced retention can incur continuing charges. Extend the plan with ransomware detection and a point-in-time restore before corruption began; explain how you determine the safe recovery point and validate it without reintroducing the compromised workload.

