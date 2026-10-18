# Data transfer, backup, and restore drills

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Storage roadmap](../../roadmaps/06-storage.md)

## Goals and prerequisites

Plan an initial migration, perform a small verified copy, and write a recovery runbook that measures restored application behavior. Allow 90 minutes. Complete [lab setup](../../LAB-SETUP.md) and the Cloud Storage tutorial first. Use Cloud Shell Bash with `PROJECT_ID`, `REGION`, and `ZONE`. The practical exercise transfers tiny synthetic files using your existing disposable bucket or two new same-region lab buckets. Even small transfers can incur operations and storage charges. No large transfer, appliance order, or managed backup deployment is performed automatically.

## Choose the movement mechanism

`gcloud storage cp` and `rsync` suit small interactive transfers and controlled automation. `rsync` compares source and destination; deletion flags can remove destination-only objects, so review a dry run before adding them. Object metadata, ACL handling, checksums, symbolic links, and filename interpretation deserve testing before migration.

Storage Transfer Service manages scheduled or event-driven transfers across supported object and file sources. Some transfers are agentless; filesystem routes use agents and require network, permissions, and available host resources. Transfer service accounts need explicit source read and destination write rights. Listing permission is often as important as reading object contents. Source-provider egress charges can dominate the service's own fees. [Transfer overview](https://docs.cloud.google.com/storage-transfer/docs/overview) · [Create transfers](https://docs.cloud.google.com/storage-transfer/docs/create-transfers)

Transfer Appliance addresses large offline transfers when available connectivity cannot meet the deadline. Plan ordering eligibility, appliance capacity, physical security, encryption, shipping, ingestion, and final delta synchronization. It is not a continuous replication system. Transfer time has a lower bound: 10 TiB over 100 Mbit/s takes roughly ten days at perfect utilization, before protocol overhead, retries, and competing traffic. An appliance can shorten the bulk stage while an online incremental transfer brings the destination current. [Transfer Appliance](https://docs.cloud.google.com/transfer-appliance/docs/4.0/overview)

Database migrations need engine-aware consistency and change capture; file copying a live database directory is usually insufficient. Use native backups, replication, Database Migration Service, or a supported application-aware backup workflow. BigQuery Data Transfer Service moves supported analytical sources into BigQuery and is a different service from Storage Transfer Service.

## Backup is a recovery capability

Replication helps availability but can reproduce a bad deletion or corrupted write. A backup must preserve a useful earlier state with a recoverable encryption key and sufficient configuration to restart the application. RPO is acceptable data loss measured in time; RTO is the acceptable time to restore service. A nightly backup cannot by itself meet a five-minute RPO.

Backup and DR provides centralized policies and supported recovery workflows, including backup vault capabilities. The supported resource types, retention rules, backup locations, and protection mechanisms vary. A vault's enforced retention may intentionally prevent early deletion, including during cleanup. Do not enable a long retention period in an experimental project unless you accept the ongoing storage commitment. [Backup and DR overview](https://docs.cloud.google.com/backup-disaster-recovery/docs/concepts/backup-dr) · [Backup vaults](https://docs.cloud.google.com/backup-disaster-recovery/docs/concepts/backup-vault)

## Lab: copy, corrupt, and recover a tiny dataset

You need Storage permissions for two disposable buckets. Keep both in `REGION` to simplify placement; consult current transfer pricing before crossing regions.

```bash
export TRANSFER_SUFFIX="$(date +%s)"
export SOURCE_BUCKET="${PROJECT_ID}-source-${TRANSFER_SUFFIX}"
export BACKUP_BUCKET="${PROJECT_ID}-backup-${TRANSFER_SUFFIX}"
for b in "$SOURCE_BUCKET" "$BACKUP_BUCKET"; do
  gcloud storage buckets create "gs://$b" --project="$PROJECT_ID" \
    --location="$REGION" --uniform-bucket-level-access \
    --public-access-prevention
  gcloud storage buckets update "gs://$b" --clear-soft-delete
done
mkdir -p transfer-lab/original transfer-lab/restored
printf '%s\n' 'order_id,total' '101,250' '102,300' \
  > transfer-lab/original/orders.csv
sha256sum transfer-lab/original/orders.csv > transfer-lab/original.sha256
gcloud storage cp transfer-lab/original/orders.csv "gs://$SOURCE_BUCKET/"
gcloud storage rsync "gs://$SOURCE_BUCKET" "gs://$BACKUP_BUCKET" --dry-run
gcloud storage rsync "gs://$SOURCE_BUCKET" "gs://$BACKUP_BUCKET"
```

The dry run should propose one copy. Inspect both buckets, then replace only the source object with a deliberately bad file:

```bash
printf '%s\n' 'corrupted training example' > transfer-lab/bad.csv
gcloud storage cp transfer-lab/bad.csv "gs://$SOURCE_BUCKET/orders.csv"
export RESTORE_STARTED="$(date +%s)"
gcloud storage cp "gs://$BACKUP_BUCKET/orders.csv" \
  transfer-lab/restored/orders.csv
cmp transfer-lab/original/orders.csv transfer-lab/restored/orders.csv
python3 - <<'PY'
import csv
with open('transfer-lab/restored/orders.csv', newline='') as f:
    rows = list(csv.DictReader(f))
assert len(rows) == 2
assert sum(int(r['total']) for r in rows) == 550
print('Recovery checks passed: 2 orders, total 550')
PY
printf 'Restore verification duration: %s seconds\n' \
  "$(( $(date +%s) - RESTORE_STARTED ))"
```

The checksum/content comparison validates bytes; the row-count and total assertions validate a small business invariant. Your production drill should add schema version, application startup, authentication, dependencies, and a user-visible request. Do not run another synchronization from corrupted source to backup before recovery: that would demonstrate why synchronization alone does not preserve history.

## Design a managed transfer and recovery policy

In Storage Transfer → Create transfer, choose Cloud Storage as source and destination, restrict the object prefix, choose a one-time schedule, and inspect overwrite/deletion options. Record the service account and proposed IAM grants, then cancel if you only want the design lab. For a funded exercise, run the tiny transfer and inspect operation counters, failures, and logs.

Write a runbook containing detection trigger, incident owner, recovery point selection, isolated restore destination, required keys/secrets, validation queries, traffic cutover, rollback, and evidence retention. Include a drill in which the latest backup is unavailable. Review whether a different project or administrative boundary reduces accidental or malicious deletion risk.

## Troubleshooting and cleanup

Investigate missing objects with transfer filters, source listing rights, unsupported metadata, and timestamp conditions. Low throughput can be agent CPU/disk, many small files, source rate limits, or shared bandwidth. A successful transfer operation with fewer objects than expected still requires a manifest comparison. Avoid exposing source credentials in command history; use supported service identity or secret mechanisms.

```bash
gcloud storage rm --recursive --all-versions "gs://$SOURCE_BUCKET"
gcloud storage rm --recursive --all-versions "gs://$BACKUP_BUCKET"
rm -rf transfer-lab
```

Remove only this exercise's transfer jobs and agents if created; check retained backup data separately. Exercise: design a 2 TiB migration with a two-hour cutover window. A worked approach bulk-copies ahead of time, captures deltas, stops writes briefly, validates counts and checksums, switches readers, and keeps the source read-only until rollback expires. The two-hour window covers final synchronization and validation, not the entire initial copy.
