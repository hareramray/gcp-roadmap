# Database roadmap

[Home](../README.md) · [Lab setup](../LAB-SETUP.md)

## Prerequisites and learning order

Complete IAM, networking, storage, SQL basics, and the database selection exercise before provisioning managed databases. Plan 12–18 hours for these eight tutorials, with additional time for funded managed-service experiments. Local containers and emulators teach behavior economically; their limitations are explicit in each tutorial.

| Step | Topics | Tutorial and required artifact |
|---|---|---|
| 1 | Operational versus analytical access, relational/document/wide-column modeling, keys, constraints, transactions, consistency, indexes, tenant skew, idempotency, money types, growth and recovery requirements | [Database selection and modeling](../tutorials/07-databases/01-database-selection-and-modeling.md): evidence-based service decision and three model sketches |
| 2 | Cloud SQL PostgreSQL/MySQL/SQL Server choices, connectivity and Auth Proxy, private networking, SQL/IAM identity, HA versus replicas, pools, indexes, maintenance, managed backups and PITR | [Cloud SQL](../tutorials/07-databases/02-cloud-sql.md): transactional inventory and verified restore |
| 3 | AlloyDB clusters, primary/read pools, storage separation, PostgreSQL compatibility, columnar engine, AlloyDB Omni, workload benchmarks, migration and recovery | [AlloyDB](../tutorials/07-databases/03-alloydb.md): reproducible query-plan evaluation and routing design |
| 4 | Spanner instances/configurations/editions, regional and multi-region design, distributed keys, indexes, interleaving, dialects, transactions, contention/retries, stale reads, emulator limits and backup | [Spanner](../tutorials/07-databases/04-spanner.md): local schema plus hotspot/transaction analysis |
| 5 | Firestore editions and Native/Datastore/MongoDB-compatible modes, collections/documents, query/index design, transactions/batches, listeners, Rules versus server IAM, field validation and TTL/backups | [Firestore](../tutorials/07-databases/05-firestore.md): positive and negative authorization tests |
| 6 | Bigtable sorted keys, families/qualifiers/cell versions, ranges, hotspots/salting, garbage collection, clusters, replication, app profiles, consistency, capacity, monitoring and backup | [Bigtable](../tutorials/07-databases/06-bigtable.md): query-oriented key design and recovery plan |
| 7 | Memorystore Valkey, Redis and Redis Cluster, Memcached deprecation, cache-aside, TTL/eviction, stampedes, atomic rate limiting, cluster clients, private connectivity, failure recovery | [Memorystore](../tutorials/07-databases/07-memorystore.md): cache behavior and outage fallback |
| 8 | Database Migration Service paths, assessment, connection profiles, bulk load/change capture, source log retention, heterogeneous conversion, validation, cutover, promotion and rollback | [Database Migration Service](../tutorials/07-databases/08-database-migration-service.md): complete migration acceptance checklist |

## Depth and specialization

Application developers should perform the relational, Firestore, and cache exercises first after the selection tutorial. Platform engineers should add connection security, backup recovery, quotas, and failover experiments. Data engineers should focus on change capture and analytical exports while still understanding transaction boundaries. Distributed database specialists should deepen key design, contention, replication, and geographic latency with controlled workloads.

As checked on 2026-10-18, current Firestore edition/mode combinations and Memorystore Memcached deprecation are called out in their tutorials. Recheck live documentation before selecting a new product/version; historical diagrams can hide consequential product changes.

## Capstone and exit criteria

Design a retail service with inventory reservations, private customer notes, telemetry, cached product descriptions, and daily analytics. Assign a source of truth to each fact. Explain why every database is needed; remove one if its operational cost exceeds its value. Build an idempotent order flow and demonstrate a backup restore and a migration rehearsal.

You are ready to progress when you can trace a request through network reachability, cloud IAM, database authorization, transaction semantics, retries, and recovery; distinguish an HA replica from a backup; identify your hottest key and most expensive query; and clean up all optional instances, backups, and client resources without touching shared infrastructure.
