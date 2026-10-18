# Spanner: distributed relational data and transaction design

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Database roadmap](../../roadmaps/07-databases.md)

## Objectives and lab boundary

Learn how keys, geography, transactions, and indexes affect Spanner, then practice with its emulator. Allow 90–120 minutes. The emulator is local and has no Spanner service charge; it does not reproduce production performance, availability, every feature, or IAM enforcement. Complete [lab setup](../../LAB-SETUP.md), understand SQL and transactions, and use Cloud Shell Bash with Docker. An optional real deployment needs `spanner.googleapis.com`, billing, provisioning permissions, and data-plane roles on the chosen database.

## Why distributed SQL changes design

Spanner provides a relational database with distributed transactions and configurable instance topology. An instance determines compute allocation, edition, and configuration; a database contains schema and data. Choose supported regional, dual-region, or multi-region configurations according to latency, availability, residency, and price. More geographic replication can improve resilience while increasing some coordination and access latencies. Do not substitute a marketing availability claim for a measured application SLO. [Spanner documentation](https://docs.cloud.google.com/spanner/docs)

Primary keys determine data ordering and distribution. A monotonically increasing first key component can funnel inserts into a narrow range. Random or hashed identifiers distribute load but can make range scans less convenient. Secondary indexes provide additional access paths at the cost of writes, storage, and maintenance. Parent-child interleaving can colocate related rows where supported and appropriate; it should follow actual access patterns rather than blindly copying an entity diagram. [Schema design](https://docs.cloud.google.com/spanner/docs/schema-design)

Read-only transactions provide consistent snapshots; read-write transactions coordinate changes. Contention can cause an aborted transaction, so clients need retry logic around the complete transaction. Never send an email or charge a card inside a retryable transaction callback. Record an outbox event with the transaction, then process the external action idempotently. Stale reads can be useful for latency-sensitive reporting when the application explicitly tolerates their freshness contract. GoogleSQL and PostgreSQL dialect databases are alternatives with different compatibility details; choose deliberately at database creation. [Transactions](https://docs.cloud.google.com/spanner/docs/transactions)

## Lab: create an isolated emulator configuration

Use a separate gcloud configuration so production endpoints are not accidentally replaced. Record your currently active configuration before proceeding.

```bash
export PRIOR_GCLOUD_CONFIG="$(gcloud config configurations list \
  --filter=is_active:true --format='value(name)')"
docker run --name roadmap-spanner --rm -d \
  -p 127.0.0.1:9010:9010 -p 127.0.0.1:9020:9020 \
  gcr.io/cloud-spanner-emulator/emulator
gcloud config configurations create roadmap-spanner-emulator
gcloud config set auth/disable_credentials true
gcloud config set project emulator-project
gcloud config set api_endpoint_overrides/spanner http://localhost:9020/
gcloud spanner instances create lab-instance \
  --config=emulator-config --description="Local emulator" --nodes=1
gcloud spanner databases create shop --instance=lab-instance \
  --ddl='CREATE TABLE Orders (OrderId STRING(36) NOT NULL, CustomerId STRING(36) NOT NULL, TotalMinor INT64 NOT NULL) PRIMARY KEY (OrderId)'
```

If the emulator is still starting, inspect `docker logs roadmap-spanner` and retry the instance command after it is ready. A fixed local emulator project ID avoids suggesting it is a deployed resource in `PROJECT_ID`.

```bash
gcloud spanner databases execute-sql shop --instance=lab-instance \
  --sql="INSERT INTO Orders (OrderId, CustomerId, TotalMinor) VALUES ('order-a','customer-1',3300), ('order-b','customer-1',500)"
gcloud spanner databases execute-sql shop --instance=lab-instance \
  --sql="SELECT CustomerId, SUM(TotalMinor) AS Total FROM Orders GROUP BY CustomerId"
gcloud spanner databases ddl update shop --instance=lab-instance \
  --ddl='CREATE INDEX OrdersByCustomer ON Orders(CustomerId)'
gcloud spanner databases execute-sql shop --instance=lab-instance \
  --sql="SELECT OrderId, TotalMinor FROM Orders WHERE CustomerId='customer-1'"
```

1. Confirm the aggregate is `3800` and two orders are returned. The index changes an access path, not the business result.
2. Propose a production UUID-style order key. Explain why these two fixed sample keys are teaching fixtures rather than a load-distribution strategy.
3. Add a customer table and an invariant such as a bounded credit balance. Describe the rows read and written in one transaction, the possible contention point, and how an idempotency key handles a retried request.
4. Write a locality decision for users in one region versus users on three continents. Include where writers run and which requests can tolerate stale reads.

## Optional production experiment

In Spanner → Create instance, compare supported configurations, edition, capacity options, and the pricing estimate. Stop before creation for the default lab. A funded trial should use a small synthetic dataset and the intended client region. Measure latency at increasing concurrency; inspect query plans, lock statistics, CPU by priority, and Key Visualizer where supported. Verify backup and restore into a different database, then test application validation queries. Autoscaling does not remove the need for efficient queries or evenly distributed keys.

## Failure modes and security

High latency can be a distant client, cross-partition work, hot keys, lock contention, or insufficient compute. A fast emulator test rules out none of those. Permission denied in production can involve instance/database IAM or fine-grained database roles; the emulator cannot validate those boundaries. Use appropriate database user roles, parameterized SQL, encryption policy, audit logging, and explicit backup retention. Schema changes can affect production traffic; review and monitor them as migrations.

## Cleanup and assessment

```bash
gcloud config configurations activate "$PRIOR_GCLOUD_CONFIG"
gcloud config configurations delete roadmap-spanner-emulator --quiet
docker stop roadmap-spanner
unset PRIOR_GCLOUD_CONFIG
```

Verify `gcloud config get-value project` again before further cloud work. Delete any optional real databases, instances, and retained backups separately. Exercise: timestamps are convenient for chronological order lookup but poor as the leading key for a heavy write stream. A worked design uses a distributed primary identifier and a purposeful secondary access path, then benchmarks the index's own write distribution. You pass when you can explain the tradeoff rather than merely replacing every timestamp with a random value.
