# Bigtable: row keys, wide columns, and operational scale

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Database roadmap](../../roadmaps/07-databases.md)

## Objectives and prerequisites

Design keys for a time-series workload, demonstrate efficient ranges, and plan a bounded Bigtable trial. Allow 90 minutes. The default exercise uses Python in Cloud Shell and creates no Bigtable instance. A real trial requires billing, `bigtable.googleapis.com` and `bigtableadmin.googleapis.com`, an instance administrator for provisioning, and appropriate data reader/writer roles for applications. Complete [lab setup](../../LAB-SETUP.md); `PROJECT_ID`, `REGION`, and `ZONE` describe the optional deployment.

## Understand the storage model

Bigtable stores rows sorted by row key. A row contains column families, column qualifiers, and timestamped cell versions. Families group related data and carry garbage-collection policies. Qualifiers can be sparse; every row need not contain the same set. A row key or a narrow key range is an efficient access path. A request that scans an entire large table and filters afterward is fundamentally different from an indexed relational lookup. [Bigtable overview](https://docs.cloud.google.com/bigtable/docs/overview)

Design the key from the actual reads. For device history, `device_id#time_bucket#timestamp` can group a device's events. A timestamp-first key makes chronological scans convenient but can concentrate all incoming writes at the newest edge. A hash prefix spreads writes but turns some scans into multiple range requests. A reversed timestamp can bring recent records together in sort order; encode it with a fixed width so lexical and numerical ordering agree. [Schema design](https://docs.cloud.google.com/bigtable/docs/schema-design)

Keep transaction expectations precise. Single-row mutations and conditional operations are central building blocks; do not assume arbitrary multi-row relational transactions. Replication and app-profile routing affect availability and read consistency. A multi-cluster routing policy is not interchangeable with a single-cluster profile when the application needs a particular read-your-writes behavior. Check feature-specific consistency and routing requirements. [Replication overview](https://docs.cloud.google.com/bigtable/docs/replication-overview) · [App profiles](https://docs.cloud.google.com/bigtable/docs/app-profiles)

Garbage collection removes old versions or expired cells asynchronously according to policy. It is not a precise application-level expiration guarantee. If readers must never show older data, filter by timestamps in the read path as well. Backups protect table recovery points; replication alone can propagate accidental deletes.

## Lab: observe key distribution and range reads

```bash
mkdir -p bigtable-key-lab
cat > bigtable-key-lab/keys.py <<'PY'
from bisect import bisect_left
from collections import Counter
from hashlib import sha256

events = [(f'device-{d:03}', 1760000000+t, t) for d in range(10) for t in range(100)]
rows = sorted((f'{device}#{ts:010}', value) for device, ts, value in events)
keys = [key for key, _ in rows]
prefix = 'device-003#'
start = bisect_left(keys, prefix)
end = bisect_left(keys, prefix + '\uffff')
selected = rows[start:end]
assert len(selected) == 100
assert all(key.startswith(prefix) for key, _ in selected)
print('Device range rows:', len(selected), 'of', len(rows))

def shard(device):
    return int(sha256(device.encode()).hexdigest()[:8],16) % 4
counts = Counter(shard(device) for device, _, _ in events)
print('Four hash buckets:', dict(sorted(counts.items())))
print('First key:', rows[0][0], 'Last key:', rows[-1][0])
PY
python3 bigtable-key-lab/keys.py
```

1. Verify that the range returns exactly 100 rows from 1,000. Explain why the key order makes this possible without testing every row.
2. Change the key to timestamp first. Show how device-history retrieval becomes a scan or requires a separate access path.
3. Add one device producing 100 times more events. A hash of device ID keeps that device on one shard; hashing a more variable event attribute spreads its writes but increases the number of ranges required for its history.
4. Propose two families: compact frequently read measurements and optional diagnostic payloads. Give each an explicit retention/version policy. Avoid creating one family per customer.
5. Write the required consistency behavior for a dashboard, a device command acknowledgment, and an audit export. Choose app profiles accordingly and document retries/timeouts.

This simulation demonstrates lexicographic design, not Bigtable's partitioning algorithm, performance, or consistency implementation. Do not quote its timings as a cloud benchmark.

## Optional managed verification

Open Bigtable → Create instance. Record location, capacity mode, storage choices, cluster count, and the estimate. Stop before Create for the default design lab. For a funded trial, choose the smallest configuration suitable for the current product constraints, create a `telemetry` table and the two families, and load only a bounded synthetic dataset with the supported client library or `cbt` tool.

Run known-key reads and device-range reads; compare scanned rows and latency. Configure an app profile explicitly rather than relying on an unexplained default. Inspect CPU, latency, storage, and Key Visualizer for hotspots. If testing replication, wait for the documented state and perform a planned failure/routing exercise in the sandbox. Create a backup, restore to another disposable table, and compare counts and selected values. The console's successful operation status is only one piece of evidence.

## Diagnose, secure, and control cost

High tail latency can come from a hot key, overloaded cluster, distant clients, too many tiny RPCs, or large filters/scans. Batch suitable operations and reuse clients; keep application deadlines and retry budgets bounded. Autoscaling cannot instantly fix a poor key distribution. Large cell values and unnecessary versions consume storage and network capacity. Monitor useful business operations per unit of capacity, not CPU alone.

Give applications table/data access without instance administration. Treat network controls, IAM, encryption, and audit logs as separate layers. Logs should identify failed requests without exposing full telemetry payloads or secrets. A backup's encryption key and retention settings must remain recoverable for the backup's lifetime.

## Cleanup and assessment

Remove the local `bigtable-key-lab` directory after saving your key-design notes. For optional cloud work, delete lab tables, backups, clusters/instance, and any dedicated client VM after verifying their names. Check for retained backups because table deletion alone may not remove every recovery artifact.

Exercise: a fleet wants latest readings per device and hourly totals across all devices. A worked answer uses device-oriented Bigtable keys for serving and a streaming/export path into an analytical store for fleet-wide aggregates. Trying to make one key layout optimize every access pattern often creates expensive scans. You pass when you can calculate your read ranges and identify the hottest likely key before loading data.
