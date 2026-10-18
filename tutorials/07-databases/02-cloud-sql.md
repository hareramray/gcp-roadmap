# Cloud SQL: relational operations, connectivity, and recovery

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Database roadmap](../../roadmaps/07-databases.md)

## What you will build

Practice a transactional order update on local PostgreSQL, then produce a concrete Cloud SQL configuration and restore checklist. Allow 90–120 minutes. The default lab uses Docker in Cloud Shell, not a paid Cloud SQL instance. An optional managed extension requires billing, `sqladmin.googleapis.com`, Cloud SQL provisioning permissions, and permission to use the chosen network. Connection users separately need Cloud SQL Client plus database credentials or the supported IAM database authentication setup.

## Service model

Cloud SQL manages supported MySQL, PostgreSQL, and SQL Server engines. The engine, version, edition, machine size, storage, and availability settings determine features and price. It handles service infrastructure, but you still own schema design, indexes, SQL privileges, connection management, and application recovery. Do not assume every extension, superuser operation, flag, or operating-system integration from a self-managed database is supported. [Cloud SQL PostgreSQL documentation](https://docs.cloud.google.com/sql/docs/postgres)

A high-availability configuration uses a standby for recovery from specified infrastructure failures. A read replica serves read traffic and has its own lag and failover considerations. A backup preserves a recovery point. These mechanisms are different: a replica is not a historical backup, and an HA standby is not your reporting replica. Point-in-time recovery depends on configured backups/log retention and supported engine behavior. Restore into a separate instance and validate before traffic cutover. [High availability](https://docs.cloud.google.com/sql/docs/postgres/high-availability) · [Point-in-time recovery](https://docs.cloud.google.com/sql/docs/postgres/backup-recovery/pitr)

Connectivity has two independent dimensions: network reachability and authentication. Private IP requires an approved network path; the Cloud SQL Auth Proxy does not create routing into a private VPC. Connectors and the proxy help secure and authorize connections, but SQL users still require database privileges. Avoid broad authorized-network entries and never expose a password in a repository. [Connection options](https://docs.cloud.google.com/sql/docs/postgres/connect-overview)

## Lab: transactional behavior before provisioning

Prerequisites are [lab setup](../../LAB-SETUP.md), Cloud Shell Bash, available Docker, and a small amount of local disk. This teaching example pins PostgreSQL 16 to keep the local SQL behavior predictable; choose a currently supported Cloud SQL version independently for deployment.

```bash
export SQL_LAB_PASSWORD="$(openssl rand -hex 24)"
docker run --name roadmap-pg --rm -d \
  -e POSTGRES_PASSWORD="$SQL_LAB_PASSWORD" \
  -e POSTGRES_DB=shop postgres:16
```

Check readiness using `docker exec roadmap-pg pg_isready -U postgres -d shop` and continue only when it reports accepting connections.

```bash
docker exec -i roadmap-pg psql -U postgres -d shop -v ON_ERROR_STOP=1 <<'SQL'
CREATE TABLE inventory(sku text PRIMARY KEY, stock integer CHECK(stock >= 0));
CREATE TABLE orders(id text PRIMARY KEY, sku text NOT NULL, quantity integer NOT NULL);
INSERT INTO inventory VALUES ('book', 5);
BEGIN;
UPDATE inventory SET stock=stock-2 WHERE sku='book' AND stock >= 2;
INSERT INTO orders VALUES ('order-1','book',2);
COMMIT;
SELECT * FROM inventory;
SELECT * FROM orders;
SQL
```

1. Verify stock is `3` and exactly one order exists. The update's affected-row count matters: a real application must abort if insufficient stock means zero rows were updated. Extend the application or stored procedure to check that count before inserting the order.
2. Retry the same order ID. The primary-key constraint prevents a second identical order record; the entire transaction must roll back if the insert fails, so stock is not decremented twice.
3. Create a logical backup and restore it into a separate local database:

```bash
docker exec roadmap-pg pg_dump -U postgres -d shop -Fc > cloud-sql-lab.dump
docker exec roadmap-pg createdb -U postgres shop_restore
docker exec -i roadmap-pg pg_restore -U postgres -d shop_restore \
  --exit-on-error < cloud-sql-lab.dump
docker exec roadmap-pg psql -U postgres -d shop_restore \
  -c 'SELECT COUNT(*) FROM orders;'
```

The restored count should be one. A logical dump teaches restoration but is not equivalent to Cloud SQL's managed backup and PITR mechanisms.

## Optional managed deployment plan

Open Cloud SQL → Create instance → PostgreSQL. Record `REGION`, edition, engine version, CPU/RAM, storage type/capacity, growth limits, and the displayed estimate. Choose a private connectivity design supported by your organization, configure maintenance preferences, enable backups/PITR as appropriate, and use a least-privilege application user. In a design-only session, stop before Create.

For an intentionally funded deployment, use the documented connection workflow from a VM or service with the required network route. Run the same SQL, configure a bounded pool, and capture a query latency baseline. In Monitoring/Query Insights, find CPU, memory pressure, connections, storage utilization, replica lag, and slow statements. Create a managed backup, restore to a different lab instance, verify the order count and stock total, and time the entire procedure. Test failover only on disposable resources with application retry behavior ready.

## Troubleshooting and production concerns

Connection refusal can mean wrong address/port, unreachable private network, proxy failure, or exhausted connections. Permission denied after connecting is usually SQL privilege or IAM database-user configuration. Slow queries need execution plans and index analysis before a larger machine. Repeated short-lived connections can overwhelm the database even when individual queries are cheap. Use retries with jitter for transient errors, but retry a transaction as a unit and protect non-database side effects with an outbox or idempotency record.

Separate maintenance availability, zone failure, region failure, and logical corruption in the runbook. Back up configuration and schema migration history as well as data. Check restore compatibility, retention, encryption keys, and application version before declaring a drill successful.

## Cleanup and exercise

```bash
docker stop roadmap-pg
unset SQL_LAB_PASSWORD
rm -f cloud-sql-lab.dump
```

If you created cloud instances, delete the disposable restore instance, replicas, and primary after checking names; inspect retained/final backups and network resources separately. Exercise: a reporting query saturates the primary every morning. A worked answer first fixes query plans and schedules, then considers a read replica if replication lag is acceptable, or an analytical export to BigQuery. Turning on HA alone does not solve reporting contention.
