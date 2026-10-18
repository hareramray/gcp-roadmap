# BigQuery fundamentals: datasets, SQL, and ingestion

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Analytics roadmap](../../roadmaps/08-data-analytics.md)

## Objectives and prerequisites

Create a small dataset, load typed data, run analytical SQL, inspect a job, and remove the resources. Allow 75 minutes. Complete [lab setup](../../LAB-SETUP.md), use Cloud Shell Bash, and export `PROJECT_ID` and `REGION`. You need permission to enable `bigquery.googleapis.com`, run query jobs, and create/manage the lab dataset. Typical separation is BigQuery Job User on the billing project and suitable data permissions on the dataset. Dataset creation additionally requires `bigquery.datasets.create`.

The dataset and queries below are tiny but use real Google Cloud resources if you run them. Billing, free allowances, and sandbox restrictions depend on your account; do not assume every operation is free. Set dataset expiration and query byte limits, and inspect current pricing before larger experiments.

## Learn the resource and execution model

A project contains datasets; a dataset contains tables, views, and routines and has a location. Query jobs execute in a project and location and can read authorized data from other projects. The job's billing project and the table's storage project need not be the same. Location compatibility matters for queries, external data, exports, and reservations. Choose it before building a pipeline rather than treating it as a cosmetic label.

BigQuery separates managed storage and compute. Columnar storage makes projecting only needed columns valuable. A table is a logical relation, not a promise that row order is stable. Use `ORDER BY` whenever ordering matters. GoogleSQL supports joins, arrays, structs, window functions, DDL, DML, and multi-statement workflows, but this does not make BigQuery the default database for every low-latency application request. [BigQuery overview](https://docs.cloud.google.com/bigquery/docs/introduction)

Use batch loads for periodic files, the Storage Write API for supported streaming use cases, transfer connectors for supported sources, and external/federated access when data should remain elsewhere. Streaming delivery guarantees depend on the API mode and client design; an event ID is still useful for business deduplication. Parquet/Avro preserve types better than ad hoc CSV; CSV requires careful delimiters, encodings, null representation, and schema handling. [Loading data](https://docs.cloud.google.com/bigquery/docs/loading-data) · [Storage Write API](https://docs.cloud.google.com/bigquery/docs/write-api)

## Lab: load and query a small order dataset

```bash
gcloud services enable bigquery.googleapis.com --project="$PROJECT_ID"
export BQ_DATASET="roadmap_bq_$(date +%s)"
bq --project_id="$PROJECT_ID" --location="$REGION" mk --dataset \
  --default_table_expiration=86400 "$PROJECT_ID:$BQ_DATASET"
cat > bq-orders.csv <<'CSV'
order_id,customer_id,order_date,total_minor,status
101,a,2026-10-01,2500,paid
102,a,2026-10-02,1500,paid
103,b,2026-10-02,500,cancelled
104,b,2026-10-03,2000,paid
CSV
bq --project_id="$PROJECT_ID" --location="$REGION" load \
  --source_format=CSV --skip_leading_rows=1 \
  "$PROJECT_ID:$BQ_DATASET.orders" bq-orders.csv \
  'order_id:INTEGER,customer_id:STRING,order_date:DATE,total_minor:INTEGER,status:STRING'
```

Use explicit types rather than schema autodetection for the teaching exercise. An identifier containing leading zeros should often be a string, even if the sample happens to be numeric.

```bash
bq --project_id="$PROJECT_ID" --location="$REGION" query \
  --use_legacy_sql=false --dataset_id="$PROJECT_ID:$BQ_DATASET" \
  --maximum_bytes_billed=100000000 \
  'SELECT customer_id, COUNT(*) AS paid_orders, SUM(total_minor) AS revenue_minor
   FROM orders WHERE status="paid" GROUP BY customer_id ORDER BY customer_id'
```

Expect customer `a` to have two paid orders and `4000`, and customer `b` one paid order and `2000`. The cancelled order is excluded by an explicit business rule.

```bash
bq --project_id="$PROJECT_ID" --location="$REGION" query \
  --use_legacy_sql=false --dataset_id="$PROJECT_ID:$BQ_DATASET" \
  --maximum_bytes_billed=100000000 \
  'SELECT order_id, customer_id, total_minor,
     SUM(total_minor) OVER(PARTITION BY customer_id ORDER BY order_date,order_id) AS running_total
   FROM orders WHERE status="paid" ORDER BY customer_id,order_date,order_id'
bq --project_id="$PROJECT_ID" --location="$REGION" query \
  --use_legacy_sql=false --dataset_id="$PROJECT_ID:$BQ_DATASET" --dry_run \
  'SELECT customer_id, SUM(total_minor) FROM orders GROUP BY customer_id'
```

1. Explain the difference between aggregation, which reduces rows, and a window function, which retains each selected row.
2. Inspect the load/query jobs in BigQuery → Job history. Record job ID, bytes processed/billed, cache hit, duration, and errors. A cached result is not a valid uncached performance benchmark.
3. Add a duplicate order row in a separate staging table. Use `ROW_NUMBER()` over the business key with an explicit latest-event ordering to deduplicate; explain why `SELECT DISTINCT` may not choose the correct version.
4. Create a view for paid orders. Confirm that a logical view stores a query definition rather than a standalone snapshot. Decide whether consumers need a live view, materialized view, table snapshot, or scheduled table.

## Modeling and operations

Learn star schemas for facts and dimensions, slowly changing dimension behavior, and nested/repeated fields for naturally hierarchical data. An order with an array of line items requires `UNNEST`; joining several repeated arrays without care can multiply rows and overstate revenue. Define a grain for every table: one row per order, item, event, or daily aggregate.

Use query parameters for user values instead of concatenating input. Protect datasets with IAM, and add row/column policies when users should see different slices. Avoid loading production identifiers into a learning project. Audit data access deliberately and retain query definitions with version control.

Load failures often reveal header/schema mismatch, malformed dates, or incorrect null handling. Location errors require aligning dataset and job locations, not repeated retries. Access denied can involve job creation in one project and data access in another. A `LIMIT` generally limits output rows, not bytes scanned on an ordinary table; use projection, filtering, partitioning, and dry runs to manage scans. [Query cost estimation](https://docs.cloud.google.com/bigquery/docs/estimate-costs)

## Cleanup and completion

```bash
# This removes only the unique dataset created above and all its lab tables.
bq --project_id="$PROJECT_ID" rm --recursive --force --dataset \
  "$PROJECT_ID:$BQ_DATASET"
rm -f bq-orders.csv
```

Verify the dataset is absent with `bq ls --project_id="$PROJECT_ID"`. Exercise: design a daily revenue pipeline with late refunds. A worked approach retains immutable source events, models refunds explicitly, recalculates affected dates, and publishes a clearly defined net-revenue metric. You pass when you can reproduce the totals, explain the table grain, and identify which project pays for a query.
