# AlloyDB for PostgreSQL: architecture and workload evaluation

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Database roadmap](../../roadmaps/07-databases.md)

## Goal, prerequisites, and cost

Evaluate AlloyDB using a PostgreSQL workload, understand its cluster structure, and prepare a migration and recovery experiment. Allow 90 minutes for the design/local lab. Production-shaped AlloyDB instances and read pools can be expensive; this tutorial defaults to no cloud creation. An optional cloud lab requires billing, the AlloyDB API (`alloydb.googleapis.com`), supported private connectivity, and narrowly scoped AlloyDB and network provisioning access. Complete [lab setup](../../LAB-SETUP.md) and the Cloud SQL tutorial first.

## Understand what is managed

An AlloyDB cluster groups database storage and compute instances. The primary serves writes and reads; read pool instances add read-serving capacity. Storage and compute are separated so their management differs from running PostgreSQL on one VM's disks. High availability, backups, continuous recovery capabilities, and maintenance settings must still be selected and tested for your chosen configuration. PostgreSQL compatibility is valuable, but it does not mean every extension, privilege, or operational procedure is identical to a self-managed installation. [AlloyDB overview](https://docs.cloud.google.com/alloydb/docs/overview)

The columnar engine accelerates eligible analytical queries over selected data while preserving the relational application model. It does not eliminate the need for row-oriented indexes, query planning, or a separate warehouse when analytics is broad and heavily historical. Read pools can isolate reporting compute, but stale reads, connection routing, and read-after-write expectations must be understood. Check actual eligibility and execution plans instead of assuming every aggregate uses columnar execution. [Columnar engine overview](https://docs.cloud.google.com/alloydb/docs/columnar-engine/about)

AlloyDB Omni is a separate deployment option for running AlloyDB-compatible technology outside the fully managed service. It changes infrastructure and operational responsibilities. A local PostgreSQL lab is useful for SQL fundamentals but does not benchmark AlloyDB, Omni, or the managed service's recovery behavior. [AlloyDB Omni overview](https://docs.cloud.google.com/alloydb/omni/docs/overview)

## Choose an evaluation workload

Use an anonymized query mix with known correctness results. Include an indexed point lookup, a multi-row transaction, an aggregate over recent events, and a reporting join. Measure p50/p95 latency, throughput at a fixed concurrency, CPU, memory, connection count, and total cost. Run both cold and warmed-cache cases and report which one you measured. A benchmark that changes hardware, schema, indexes, and cache state simultaneously cannot isolate the cause of an improvement.

For a shop, imagine 90% order lookups, 8% inventory transactions, and 2% analytical summaries. A read pool may protect transaction latency from summaries, but a consistent inventory reservation still belongs on the writer. An application that randomly sends reads to replicas can read stale state immediately after an update unless its routing or consistency design addresses that requirement.

## Lab: inspect query plans locally

Use the local PostgreSQL container from the Cloud SQL tutorial, or recreate it there. The following commands require no Google Cloud API call:

```bash
docker exec -i roadmap-pg psql -U postgres -d shop -v ON_ERROR_STOP=1 <<'SQL'
CREATE TABLE IF NOT EXISTS sales_lab(
  id bigint PRIMARY KEY,
  customer_id integer NOT NULL,
  created_on date NOT NULL,
  total_minor integer NOT NULL);
TRUNCATE sales_lab;
INSERT INTO sales_lab
SELECT n, n % 1000, DATE '2026-01-01' + (n % 90), 100 + n % 10000
FROM generate_series(1,100000) n;
ANALYZE sales_lab;
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM sales_lab WHERE customer_id=42;
CREATE INDEX IF NOT EXISTS sales_lab_customer ON sales_lab(customer_id);
ANALYZE sales_lab;
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM sales_lab WHERE customer_id=42;
SELECT COUNT(*), SUM(total_minor) FROM sales_lab WHERE customer_id=42;
SQL
```

1. Record scan type, rows examined, execution time, and buffers before and after the index. Expect 100 matching rows; timing varies with the local environment.
2. Run an aggregate grouped by date. Explain why an index helping customer lookup may not improve a query that reads nearly every row.
3. Save query text and expected counts as a portable acceptance suite. Keep parameter values and data distribution consistent when moving to AlloyDB.
4. Write an instance-routing table: writes and read-after-write requests to primary; eligible tolerant reads to read pool; historical enterprise reporting to the warehouse if that best fits the workload.

## Gated cloud evaluation

Open AlloyDB → Clusters → Create cluster. Select `REGION`, the approved VPC/private connectivity option, a primary configuration, backups, and an encryption policy. Record the estimate and cancel for the design-only path. Before a funded test, verify service networking or Private Service Connect requirements for the chosen setup, IP capacity, DNS, and client reachability.

Create a restricted application user and connect from the documented client environment. Load only synthetic data. Run the acceptance suite on the primary, add a read pool only if required by the experiment, and compare the same workload with an explicit connection target. Enable/configure the columnar engine according to current instructions, then verify qualifying plans. Do not infer activation from a changed latency alone.

Create a backup, restore into an isolated cluster, verify SQL invariants, and record recovery time. A cross-region recovery design also needs a documented location, dependency restoration, DNS/routing change, and recovery-point selection. [Back up and restore](https://docs.cloud.google.com/alloydb/docs/backup/overview) · [Connection overview](https://docs.cloud.google.com/alloydb/docs/connection-overview)

## Troubleshooting, security, and cleanup

If a connection hangs, inspect network reachability before credentials. If reads differ between endpoints, examine transaction timing and replica behavior. If analytical performance fails to improve, inspect columnar eligibility, selected columns, query shape, and memory rather than assuming a service defect. Monitor database connections and avoid unbounded application pools. Keep credentials in supported secret storage, use TLS/connectors as documented, and grant SQL permissions separately from cloud administration rights.

Drop `sales_lab` from the local lab when finished, or stop its disposable Docker container. For an optional cloud deployment, remove read pool instances and lab clusters using the console, then review backups and other retained resources; deleting compute may not delete every billable recovery artifact. Exercise: justify AlloyDB versus Cloud SQL for an existing moderate PostgreSQL service. A sound answer requires measured latency/cost or operational evidence, not only a claim that one product is faster.
