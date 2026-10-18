# Capstone: a governed batch and streaming data platform

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Goal and prerequisites

Build an analytics pipeline that ingests synthetic business events, handles duplicates/late data, creates trusted tables, and serves a documented metric. Complete [Cloud Storage](../06-storage/01-cloud-storage.md), [Pub/Sub](../08-data-analytics/03-pubsub.md), [Dataflow](../08-data-analytics/04-dataflow-and-apache-beam.md), [BigQuery](../08-data-analytics/01-bigquery-fundamentals.md), [warehouse governance](../08-data-analytics/02-bigquery-performance-and-governance.md), [Dataform](../08-data-analytics/07-dataform-and-data-quality.md), [catalog](../08-data-analytics/08-dataplex-biglake-and-catalog.md), and [BI](../08-data-analytics/09-looker-and-looker-studio.md).

Plan 16–30 hours and a budget for streaming workers, storage, queries, orchestration, and BI capacity where applicable. Start with local Beam/batch execution and a tiny bounded dataset. Running a streaming job overnight can materially change cost. Organization data-policy privileges may require a design-only substitute.

## Data contract and layers

Create events with `event_id`, `order_id`, `event_time`, `ingestion_time`, `amount_cents`, `currency`, `event_type`, and `schema_version`. Generate synthetic records with known totals. Include five duplicates, several delayed events, an invalid amount, and an unknown schema version. Decide whether cancellation is a new event or a mutable state update.

Separate raw immutable input, validated/normalized records, and curated reporting tables. A raw store preserves evidence for replay subject to retention policy. A curated table defines business meaning and ownership. More layers do not automatically improve governance; each should have a clear contract and reason to exist.

Define a metric such as “daily accepted order value in USD by event date.” Specify how cancellations, duplicates, late events, and currency are handled before writing a dashboard. Without that definition, two correct queries can report incompatible numbers.

## Build sequence

1. **Generator:** produce a small JSONL or CSV dataset with reproducible seed and expected totals. Add a manifest describing row count, schema version, and intentional bad records.
2. **Batch baseline:** load a bounded sample through the Storage and BigQuery tutorials. Verify schema, location compatibility, and exact row count. Use query previews/dry runs and explicit limits on scan cost where supported.
3. **Streaming path:** publish a small controlled event set to Pub/Sub. Use a Beam pipeline to parse, validate, classify errors, and write supported sinks. Document event-time windows, allowed lateness, deduplication scope, and late-record handling.
4. **Error channel:** retain rejected records with safe reason codes and a repair process. Avoid silently dropping malformed data or logging unrestricted sensitive payloads.
5. **Transformation:** create a versioned Dataform model for the metric with assertions for uniqueness, required fields, accepted currency, and reasonable amounts. Keep SQL transformations reviewable.
6. **Governance:** assign owners, classifications, lineage notes, access groups, and retention. Apply supported row/column controls if authorized, and verify them with two distinct personas.
7. **Presentation:** build a minimal Looker/Looker Studio report using the curated metric. State freshness, timezone, filters, and access mode. Compare its total with a direct warehouse query.
8. **Operation:** add pipeline lag/failure monitoring, a replay procedure, and a budget dashboard. Record schema-change ownership and how breaking changes are rolled out.

## Acceptance tests and worked expectations

The duplicate events should not inflate the chosen business metric. Late events should either update the documented reporting period or be surfaced according to policy. Bad records should appear in the error path with no silent count loss. The report total must reconcile to the generator's expected result after applying the defined business rules.

Stop a worker or inject a controlled parse failure in the test environment. Observe retry/replay behavior and verify correctness after recovery. Repeat a bounded input file and prove your loading strategy handles repeats intentionally. A pipeline claiming exactly-once processing must state the service, mode, sink, and boundary of that guarantee; business reconciliation remains necessary.

## Troubleshooting and cost controls

For incorrect totals, inspect input grain, join cardinality, duplicate keys, window boundaries, timezone, and late data before tuning compute. For slow queries, inspect bytes read, partition pruning, clustering, join structure, and execution plans. For streaming lag, examine source backlog, worker capacity, hot keys, sink throughput, and external dependencies.

Keep test volumes explicit. Review streaming worker uptime, retained messages, object versions, query scans, reservations, and dashboard refresh behavior. Different products can bill for the same pipeline at different stages.

## Cleanup and portfolio

Stop publishers and schedules, drain or cancel streaming jobs according to the test objective, remove subscriptions/topics, delete synthetic datasets/buckets and owned transformation/orchestration resources, and release unused capacity. Check retained artifacts and storage separately.

Deliver a data contract, lineage diagram, generator, transformation code, reconciliation report, access tests, dashboard image or specification, recovery runbook, and cost assumptions. Mark local-only and managed-service tests separately.

## References

- [Enterprise data management and analytics architecture](https://docs.cloud.google.com/architecture/blueprints/deploy_enterprise_data_mesh)
- [Dataflow documentation](https://docs.cloud.google.com/dataflow/docs)
- [BigQuery documentation](https://docs.cloud.google.com/bigquery/docs)
- [Dataform documentation](https://docs.cloud.google.com/dataform/docs)
