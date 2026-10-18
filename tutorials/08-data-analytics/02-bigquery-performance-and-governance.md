# BigQuery performance, reservations, and governance

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Analytics roadmap](../../roadmaps/08-data-analytics.md)

## Goals and cost boundary

Use partition pruning, understand clustering and compute capacity, and design access policies that preserve useful analysis. Allow 90 minutes. Complete the BigQuery fundamentals tutorial and [lab setup](../../LAB-SETUP.md). This lab creates a small dataset and real query jobs; do not create paid capacity commitments or reservations as part of the default exercise. Required access is BigQuery job creation and ownership/editing of your disposable dataset; policy administration requires additional permissions and is a separate optional exercise.

## Optimize the work before buying capacity

Partitioning divides a table by a supported date/time expression, ingestion time, or integer range. A qualifying predicate enables partition pruning. Clustering organizes data within storage blocks by chosen columns; it can reduce work for selective filters and grouping patterns. Column order matters, and benefits depend on actual data distribution and table size. Date-sharded table fleets usually add metadata and query complexity compared with a suitable partitioned table. [Partitioned tables](https://docs.cloud.google.com/bigquery/docs/partitioned-tables) · [Clustered tables](https://docs.cloud.google.com/bigquery/docs/clustered-tables)

Project only needed columns, filter early when semantically valid, reduce data before expensive joins, and inspect skew and shuffle. A small dimension joined to a large fact table behaves differently from a many-to-many join. Pre-aggregations and materialized views can reduce repeated work, but freshness, refresh cost, and supported SQL restrictions matter. Use the execution graph and job metadata to find bottlenecks instead of treating elapsed time as a complete diagnosis. [Compute optimization](https://docs.cloud.google.com/bigquery/docs/best-practices-performance-compute)

On-demand billing and capacity-based execution answer different cost questions. Reservations assign capacity to workloads; editions, autoscaling, assignments, idle capacity, and commitments determine behavior and price. A reservation is not an index or a way to make a bad query correct. Evaluate concurrency, queueing, latency SLOs, steady versus bursty usage, and isolation between teams before purchasing commitments. [Reservations](https://docs.cloud.google.com/bigquery/docs/reservations-intro)

## Lab: enforce a useful query contract

Use Cloud Shell Bash with `PROJECT_ID` and `REGION`:

```bash
export PERF_DATASET="roadmap_perf_$(date +%s)"
bq --project_id="$PROJECT_ID" --location="$REGION" mk --dataset \
  --default_table_expiration=86400 "$PROJECT_ID:$PERF_DATASET"
bq --project_id="$PROJECT_ID" --location="$REGION" query \
  --use_legacy_sql=false --dataset_id="$PROJECT_ID:$PERF_DATASET" \
  --maximum_bytes_billed=100000000 \
  'CREATE TABLE events
   PARTITION BY event_date CLUSTER BY tenant_id
   OPTIONS(require_partition_filter=true) AS
   SELECT DATE "2026-10-01" + MOD(n,14) AS event_date,
          CONCAT("tenant-",CAST(MOD(n,10) AS STRING)) AS tenant_id,
          n AS event_id, MOD(n,100) AS value
   FROM UNNEST(GENERATE_ARRAY(1,10000)) AS n'
```

Run an intentionally invalid query separately. Expect it to fail because the required partition filter is missing; this failure is the desired verification.

```bash
bq --project_id="$PROJECT_ID" --location="$REGION" query \
  --use_legacy_sql=false --dataset_id="$PROJECT_ID:$PERF_DATASET" \
  'SELECT COUNT(*) FROM events'
```

Now run a valid bounded query:

```bash
bq --project_id="$PROJECT_ID" --location="$REGION" query \
  --use_legacy_sql=false --dataset_id="$PROJECT_ID:$PERF_DATASET" \
  --maximum_bytes_billed=100000000 --use_cache=false \
  'SELECT tenant_id, COUNT(*) AS events FROM events
   WHERE event_date BETWEEN DATE "2026-10-01" AND DATE "2026-10-03"
   GROUP BY tenant_id ORDER BY tenant_id'
```

1. Dry-run one-day and fourteen-day versions of the query and record estimated bytes. On a tiny table, billing minimums and small storage blocks can obscure performance differences; do not claim benchmark improvements from this fixture.
2. Compare projected `event_id` against `SELECT *`. Explain which columns each query reads and why output row limits do not necessarily reduce scans.
3. Inspect job stages and write one hypothesis for high shuffle volume. Test it with a changed query rather than increasing capacity immediately.
4. Draw separate reservations for interactive dashboards and batch transformations, then specify assignment scope, maximum autoscaling, and how queued jobs are monitored. This is a design exercise; do not purchase capacity.

## Governance is more than hiding a dashboard

Dataset/table IAM controls broad access. Authorized views and authorized datasets can expose curated queries without granting raw-table access. Row access policies restrict rows; column policy tags and data policies can restrict or mask sensitive fields. These mechanisms have different permissions, edition/feature requirements, and query interactions. Evaluate them together with export, copy, snapshot, service-account, and BI credential paths. [Row-level security](https://docs.cloud.google.com/bigquery/docs/row-level-security-intro) · [Column-level security](https://docs.cloud.google.com/bigquery/docs/column-level-security-intro)

For a two-tenant reporting scenario, write a policy matrix: tenant A analyst can read A rows, tenant B analyst can read B rows, finance can read both, and only approved staff can see email addresses. Use separate test principals to prove both allowed and denied queries. Testing as the dataset owner is inadequate because privileged access can bypass the intended experience. Dashboard filter controls are presentation features, not data authorization.

Classify columns, assign owners, document retention, and register business definitions in the catalog. Sensitive Data Protection can help discover/classify sensitive fields, but automated classification requires validation. Use CMEK only with a complete key lifecycle and recovery plan. VPC Service Controls can reduce data-exfiltration paths but do not replace IAM or row policies.

## Failures, cleanup, and exercise

Location mismatch, missing partition filters, insufficient column permissions, or a service account's different identity can make a previously working dashboard fail. Inspect the actual job principal and SQL. If costs rise, separate storage growth, query bytes, slot capacity, transfers, and BI refresh frequency before choosing a remedy.

```bash
bq --project_id="$PROJECT_ID" rm --recursive --force --dataset \
  "$PROJECT_ID:$PERF_DATASET"
```

Also remove optional policies, test identities, reservations, and assignments you created; capacity commitments can have contractual terms and must not be treated as disposable lab resources. Exercise: a dashboard refreshes every minute but source data changes hourly. A worked answer aligns refresh and cache policy to the freshness need, pre-aggregates repeated metrics, and adds partition filters before considering reserved capacity. You pass when you can explain the security principal, scan boundaries, and cost model for each dashboard query.
