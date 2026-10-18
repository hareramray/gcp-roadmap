# Data and analytics roadmap

[Home](../README.md) · [Lab setup](../LAB-SETUP.md)

## Sequence and prerequisites

Learn SQL, Python, IAM, Cloud Storage, basic databases, and event-driven concepts. Plan 15–22 hours for the nine tutorials, then build the capstone. Follow the table in order; every named topic is developed in its linked tutorial with a practical exercise, verification, and cleanup.

| Step | Topics to cover | Tutorial and evidence |
|---|---|---|
| 1 | BigQuery projects/datasets/tables/jobs, location, GoogleSQL, types, grain, joins/windows/arrays, loading, streaming/Storage Write API, views, job metadata and byte limits | [BigQuery fundamentals](../tutorials/08-data-analytics/01-bigquery-fundamentals.md): reconciled order totals and job evidence |
| 2 | Partitioning, clustering, pruning, shuffle/skew, materialization, on-demand versus capacity pricing, slots/reservations/editions, row/column security, masking, authorized views and governance | [Performance and governance](../tutorials/08-data-analytics/02-bigquery-performance-and-governance.md): scan contract and tested identity matrix |
| 3 | Pub/Sub fan-out, pull/push, acknowledgment leases, retries, retention/backlog, idempotency, regional ordering, exactly-once limits, schemas, dead-letter permissions and replay | [Pub/Sub](../tutorials/08-data-analytics/03-pubsub.md): duplicate delivery and business deduplication design |
| 4 | Beam graphs/transforms, bounded/unbounded data, event versus processing time, watermarks/windows/triggers/lateness, error outputs, runner/sink guarantees, worker IAM and drain/cancel | [Dataflow and Apache Beam](../tutorials/08-data-analytics/04-dataflow-and-apache-beam.md): verified event-time aggregates |
| 5 | Spark driver/executors, lazy DataFrames, actions, shuffle, joins, partitions, caching, skew, files, managed clusters versus serverless, runtimes and ephemeral lifecycle | [Dataproc/Managed Spark](../tutorials/08-data-analytics/05-dataproc-and-managed-spark.md): validated transformation and deployment comparison |
| 6 | Airflow DAGs/tasks/XCom, logical dates/data intervals, retries, idempotency, catchup/backfills, pools/concurrency, sensors, runtime dependencies, service accounts and orchestration cost | [Composer/Managed Airflow](../tutorials/08-data-analytics/06-cloud-composer-and-airflow.md): tested logic and a small DAG |
| 7 | Dataform SQLX/ref graphs, tables/views/incremental processing, assertions, quality dimensions, late data, pinned dependencies, execution identities, development/release/workflow configuration | [Dataform and data quality](../tutorials/08-data-analytics/07-dataform-and-data-quality.md): a failed-data publication gate |
| 8 | Knowledge Catalog/Dataplex naming, Data Catalog transition, metadata/aspects/glossaries, discovery, quality and lineage, BigLake/external access delegation, Iceberg/metastore/lakehouse layers | [Catalog and lakehouse](../tutorials/08-data-analytics/08-dataplex-biglake-and-catalog.md): data contract, lineage, and access test |
| 9 | Looker semantic modeling, LookML dimensions/measures/joins, metric grain/fanout, Explores, Data Studio connectors/credentials, dashboards, freshness, caching, sharing and row security | [Looker and Data Studio](../tutorials/08-data-analytics/09-looker-and-looker-studio.md): dashboard totals reconciled to known fixtures |

## Current names

The tutorials preserve familiar filenames while noting current documentation labels verified on 2026-10-18: Dataplex Universal Catalog → Knowledge Catalog, Looker Studio → Data Studio, and managed Spark/Airflow/lakehouse documentation updates. API names and existing commands do not necessarily change with product branding. Follow the source links in the relevant tutorial for current supported behavior.

## Capstone: event-to-dashboard pipeline

Model synthetic order events with stable event IDs and timestamps. Publish them to Pub/Sub, transform/deduplicate with Beam or a justified alternative, store a raw/replayable layer and curated BigQuery tables, validate transformations with Dataform assertions, document them in the catalog, and expose a governed dashboard. Use Airflow only if the orchestration need justifies a persistent environment; explain your choice of Spark versus Beam versus SQL rather than deploying all tools automatically.

Inject duplicates, late events, malformed records, a missing daily batch, a schema change, and an unauthorized tenant request. Record what each layer does and how an operator repairs the data without double-counting. Include a cost estimate, runtime identities, retention, replay procedure, and resource cleanup inventory.

## Completion criteria

You should be able to define table grain and event-time semantics, reconcile business totals end to end, explain the limits of exactly-once claims, identify where query/worker capacity is spent, prove row/column authorization with restricted users, and recover a failed partition or event stream. Passing service quickstarts without proving correctness and recovery is only the first stage.
