# Database Migration Service: assessment, replication, and cutover

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Database roadmap](../../roadmaps/07-databases.md)

## Goal and prerequisites

Prepare an evidence-based migration plan, practice validation on a local source/target pair, and understand the Database Migration Service (DMS) workflow. Allow two hours. The default lab uses the local PostgreSQL container from the Cloud SQL tutorial and creates no cloud resources. A managed migration can involve source licensing, target databases, network egress, and migration-specific charges. A funded extension requires `datamigration.googleapis.com`, supported source/target versions, migration administration access, source replication privileges, target permissions, and network configuration rights. Use `PROJECT_ID` and `REGION` from [lab setup](../../LAB-SETUP.md).

## Inventory before migrating

DMS supports particular homogeneous and heterogeneous migration paths; verify the current matrix instead of assuming every engine can migrate to every Google database. Connection profiles represent source or destination connectivity. Migration jobs coordinate initial loading and, for supported continuous paths, replication of subsequent changes. Conversion workspaces and other conversion tooling can help supported heterogeneous migrations, but automatic conversion does not prove application equivalence. [DMS overview](https://docs.cloud.google.com/database-migration/docs/overview)

Inventory tables, row counts, primary keys, large objects, extensions, stored procedures, triggers, scheduled jobs, users/roles, collations, encodings, timezone assumptions, and application SQL. Record unsupported objects and which owner will remediate each one. A data copy can succeed while sequences, privileges, or an application's driver behavior still cause a production outage. [PostgreSQL migration limitations](https://docs.cloud.google.com/database-migration/docs/postgres/known-limitations)

Continuous migration uses a bulk snapshot plus change capture. The source must retain enough logs for the initial load and interruptions; replication slots or equivalent mechanisms can cause disk growth if consumers fall behind. Monitor both migration lag and source health. DDL handling and unsupported operations vary by migration path. Avoid making uncontrolled schema changes during the migration window. [PostgreSQL migration quickstart](https://docs.cloud.google.com/database-migration/docs/postgres/quickstart)

## Plan the cutover as a state transition

Define states: assessed, connected, initial load complete, replicating, writes frozen, final validation passed, promoted, application switched, and monitored. Each transition needs evidence and an owner. The rollback plan changes after the new target accepts writes: simply pointing the application back can lose or diverge those writes. Define reverse replication or a reconciliation process before cutover, or clearly set the point after which rollback becomes a forward recovery procedure.

RPO and RTO should guide the method. A small database with hours of downtime tolerance may use a tested dump/restore. A busy service with a short outage window benefits from continuous change capture followed by a brief write freeze. Heterogeneous migration also needs semantic tests: integer overflow, decimal precision, timestamp conversion, case sensitivity, null handling, and transaction behavior.

## Lab: create and validate a local migration

Start the `roadmap-pg` container as described in the Cloud SQL tutorial. Create independent source and target databases:

```bash
docker exec roadmap-pg createdb -U postgres migration_source
docker exec roadmap-pg createdb -U postgres migration_target
docker exec -i roadmap-pg psql -U postgres -d migration_source -v ON_ERROR_STOP=1 <<'SQL'
CREATE TABLE payments(id bigint PRIMARY KEY, customer_id text NOT NULL, amount_minor bigint NOT NULL);
INSERT INTO payments VALUES (1,'a',1000),(2,'a',2500),(3,'b',500);
SQL
docker exec roadmap-pg pg_dump -U postgres -d migration_source -Fc > migration-lab.dump
docker exec -i roadmap-pg pg_restore -U postgres -d migration_target \
  --exit-on-error < migration-lab.dump
for db in migration_source migration_target; do
  docker exec roadmap-pg psql -U postgres -d "$db" -At \
    -c "SELECT count(*), sum(amount_minor), min(id), max(id) FROM payments;"
done
```

Both results must be `3|4000|1|3`. Row count alone is insufficient: replace one target amount while preserving the count and rerun the totals to see the discrepancy. Restore the correct value afterward.

1. Compare grouped totals by customer and selected row hashes. Choose deterministic ordering and canonical encodings if generating whole-table checksums.
2. Insert another source row after the dump. Confirm the target does not receive it. This explicitly demonstrates why a one-time dump is not continuous replication.
3. Simulate write freeze by stopping your test writer, take a fresh dump, restore into a newly named target, and repeat the acceptance checks. Measure elapsed time and compare with your planned downtime window.
4. Write a cutover checklist covering application maintenance mode, in-flight requests, source write blocking, lag verification, validation, connection endpoint update, connection pool restart, smoke tests, and monitoring.

## Gated managed workflow

In Database Migration → Connection profiles, define the supported source type and documented connectivity method. Keep credentials in approved secret handling and scope source privileges to the migration's requirements. Test connectivity from the service's actual network path; a laptop connection is not equivalent.

Create a migration job for the supported target and review the destination database cost before starting. DMS validation checks are useful but do not replace application tests. For a funded synthetic trial, start the job, inspect initial load status, generate a small source change, and verify it arrives at the target. Observe lag and source log retention. Freeze writes, wait for convergence, run your acceptance suite, then promote only when the planned conditions hold. Promotion can be a consequential operation; perform it only in the disposable training environment or an explicitly scheduled migration.

## Troubleshooting, security, and cleanup

Connection failures commonly involve firewall routes, private connectivity, TLS trust, or insufficient source privileges. Stalled replication can reflect missing primary keys, unsupported changes, log retention gaps, or target capacity. Do not repeatedly restart a job without understanding whether it will repeat a full load. Track errors, rows copied, lag, disk growth, and application metrics.

Remove local databases with `docker exec roadmap-pg dropdb -U postgres DATABASE_NAME` for each exact lab name, then delete `migration-lab.dump`. For optional cloud work, stop/delete lab migration jobs and profiles, remove dedicated target instances, and explicitly clean up source replication artifacts according to the engine guide. A deleted migration job may not automatically undo every source setting or target resource.

Exercise: a migration matches all table counts but customer statements differ by one cent. A worked investigation checks decimal types, rounding stage, locale, and aggregation order before approving cutover. You pass when validation tests business meaning and your rollback plan explicitly accounts for writes on the new target.
