# Dataplex, Knowledge Catalog, BigLake, and the lakehouse

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Analytics roadmap](../../roadmaps/08-data-analytics.md)

## Naming and scope

As checked on 2026-10-18, Dataplex Universal Catalog is now **Knowledge Catalog**, and current BigLake overview links redirect to **Lakehouse** documentation. Older names remain in API identifiers, tutorials, configurations, and product-specific features. Data Catalog is a legacy predecessor with an explicit migration path; new governance design should follow the current catalog guidance rather than building around retired assumptions. [Knowledge Catalog overview](https://docs.cloud.google.com/dataplex/docs/introduction) · [Catalog transition](https://docs.cloud.google.com/knowledge-catalog/docs/transition-to-dataplex-catalog) · [Lakehouse overview](https://docs.cloud.google.com/lakehouse/docs/introduction)

This tutorial teaches the enduring layers: files/object storage, table formats and metadata, query engines, access controls, and business discovery/governance. A catalog is not the data itself. A table format is not a query engine. A metadata entry describing sensitive data does not automatically enforce access restrictions on the underlying files.

## Objectives and prerequisites

Create a small data contract and metadata inventory, design a governed external-table path, and define quality and lineage evidence. Allow 90 minutes. Complete Cloud Storage, BigQuery, IAM, and [lab setup](../../LAB-SETUP.md). The default lab writes local files only. A cloud extension may need BigQuery, the Dataplex API (`dataplex.googleapis.com`), and feature-specific APIs such as connection, metastore, or processing services. Enable only those needed by the selected workflow. Scan/query compute, storage, metadata services, and cross-location traffic can be billable.

## Understand the layers

Cloud Storage holds files such as Parquet or Avro. An external table maps a schema and location to files read by a query engine. Managed access delegation through supported BigLake/external-table features can separate query users from direct bucket access. The connection service identity still needs the correct underlying permissions. Apache Iceberg adds table metadata, snapshots, schema/partition evolution, and transactional table operations across compatible engines; a directory of Parquet files alone is not an Iceberg table. [BigLake external tables](https://docs.cloud.google.com/bigquery/docs/biglake-intro)

Catalog metadata describes ownership, definitions, schemas, business terms, classifications, quality, and lineage. Aspects attach structured metadata to entries. Lineage records how datasets are derived so teams can analyze impact and trace a suspicious metric back to its sources. Automatic discovery is useful, but humans still need to validate meaning and designate accountable owners. [Knowledge Catalog documentation](https://docs.cloud.google.com/knowledge-catalog/docs)

An open lakehouse design must choose a catalog/metastore, supported table format/version, writer concurrency model, and compatible engines. Multiple engines do not automatically share every feature or transaction guarantee. Avoid mixing unsupported writers or manually deleting files referenced by table metadata. Snapshot expiration and orphan-file cleanup belong to the table-management process, not an indiscriminate bucket lifecycle rule.

## Lab: define a discoverable data product

```bash
mkdir -p catalog-lab
cat > catalog-lab/orders.csv <<'CSV'
order_id,order_date,tenant_id,total_minor
101,2026-10-01,a,2500
102,2026-10-01,a,1500
103,2026-10-02,b,500
CSV
cat > catalog-lab/contract.json <<'JSON'
{
  "name": "orders_daily_source",
  "owner": "training-data-team",
  "grain": "one row per accepted order",
  "primary_key": ["order_id"],
  "freshness_target": "available by 06:00 Asia/Kolkata daily",
  "classification": "synthetic training data",
  "retention_days": 30,
  "quality_rules": ["order_id unique", "total_minor nonnegative", "order_date present"],
  "downstream": ["daily_revenue", "finance_dashboard"]
}
JSON
python3 - <<'PY'
import csv,json
from pathlib import Path
contract=json.loads(Path('catalog-lab/contract.json').read_text())
with open('catalog-lab/orders.csv',newline='') as f: rows=list(csv.DictReader(f))
assert len({r['order_id'] for r in rows}) == len(rows)
assert all(r['order_date'] and int(r['total_minor']) >= 0 for r in rows)
print(contract['name'], 'validated rows:',len(rows))
PY
```

1. Verify three rows pass. Add an owner contact process, allowed uses, source system, retention rationale, and a schema-change policy to the contract. Use role/team contacts, not real personal details in this public learning fixture.
2. Draw lineage from raw orders to a daily revenue transformation to a dashboard. Mark which edges the platform can collect automatically and which require a supported lineage integration or explicit documentation.
3. Define a business term for `revenue_minor`: include currency, cancelled orders, refunds, tax treatment, and date timezone. A column name alone is insufficient.
4. Write an access matrix: ingestion identity can write the raw prefix, transformation identity can read it and write curated tables, analysts can query approved tables, and catalog viewers can discover only permitted metadata. Explain why catalog visibility and data-read permission are separate.

## Optional console walkthrough

Create a private bucket and small BigQuery dataset in compatible locations. Load the synthetic file, then locate its table in Knowledge Catalog search. Inspect automatically available schema metadata and add supported descriptions/aspects for owner, grain, freshness, and classification. Configure a small data-quality scan with explicit sampling/schedule choices, review the estimate, and execute only if the training budget allows. Inspect failed-rule results and where they are stored.

For a BigLake-style external table, create the documented connection resource, identify its service account, grant read access only to the intended source prefix/bucket, and create an external table using the supported format and connection. Test with a principal allowed to query the table but not directly read the bucket. This is the key delegation verification; testing only as project owner misses it. For Iceberg, use the currently documented managed or external table workflow rather than pretending a CSV upload creates an Iceberg table.

## Troubleshooting, governance, and cleanup

Missing search results can reflect metadata ingestion delay, unsupported sources, wrong search scope, or missing catalog permissions. A discovered table can still fail at query time because the connection identity lacks bucket access or the file schema changed. A successful quality scan can miss errors outside its sampled scope; document sampling in the evidence.

Metadata itself can reveal sensitive business details. Restrict aspect edits and avoid placing secrets or raw sensitive examples in descriptions. Define who approves schema changes, who responds to failed quality checks, and how downstream owners learn about changes. VPC Service Controls and encryption policies must be validated across every service involved, not just the bucket.

Remove optional scans/schedules, connection resources, lab catalog entries/aspects, tables, and buckets in dependency order, preserving any shared catalog infrastructure. Delete `catalog-lab` locally after saving the contract. Exercise: a table is marked confidential but every analyst has direct bucket access. A worked correction enforces data permissions at the storage/query layer and verifies them with restricted identities; adding another catalog label alone does not close the gap.
