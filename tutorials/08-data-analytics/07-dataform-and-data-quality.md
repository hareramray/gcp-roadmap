# Dataform: SQL workflows, assertions, and data quality

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Analytics roadmap](../../roadmaps/08-data-analytics.md)

## Objectives and prerequisites

Build a small SQLX dependency graph, attach meaningful assertions, and plan a release workflow. Allow 90 minutes. Complete BigQuery fundamentals and [lab setup](../../LAB-SETUP.md). The default local steps write source files only; compiling and executing in the managed service are explicit follow-up steps. A real run needs `dataform.googleapis.com`, a repository/workspace, BigQuery access, and a dedicated execution service account. Current repository documentation requires a custom execution service account and strict act-as permissions; do not rely on the default Dataform service agent as the workflow runner. [Repository configuration](https://docs.cloud.google.com/dataform/docs/manage-repository)

Dataform compiles SQLX and JavaScript declarations into a dependency graph of BigQuery actions. A `ref` expresses both a dependency and a resolved relation name. Tables, views, incremental tables, assertions, declarations, and custom operations have different roles. The service orchestrates transformations; it is not a general replacement for ingesting every external data source. BigQuery query/storage charges still apply. [Dataform overview](https://docs.cloud.google.com/dataform/docs/overview)

## Define quality at the correct grain

An assertion is a testable statement about data: order IDs are unique, required fields are non-null, totals are nonnegative, or every order refers to a valid customer. A custom assertion query normally returns violating rows; zero returned rows means it passes. Tests need an owner and response policy. A failed uniqueness assertion should block publication of a metric whose totals would otherwise be doubled.

Freshness, completeness, validity, uniqueness, consistency, and distribution checks catch different failures. A table may have unique IDs but be missing today's entire source batch. A null rate may be normal for an optional field but unacceptable for a primary identifier. Design thresholds from business contracts and observed variation, not arbitrary percentages. [Data quality assertions](https://docs.cloud.google.com/dataform/docs/test-data)

## Lab: create a reproducible transformation graph

Use Cloud Shell Bash. Create a source directory to upload or copy into a new Dataform workspace:

```bash
mkdir -p dataform-lab/definitions
cat > dataform-lab/definitions/orders.sqlx <<'SQLX'
config {
  type: "table",
  assertions: {
    uniqueKey: ["order_id"],
    nonNull: ["order_id", "order_date", "total_minor"],
    rowConditions: ["total_minor >= 0"]
  }
}
SELECT 101 AS order_id, DATE '2026-10-01' AS order_date, 2500 AS total_minor
UNION ALL
SELECT 102, DATE '2026-10-01', 1500
UNION ALL
SELECT 103, DATE '2026-10-02', 500
SQLX
cat > dataform-lab/definitions/daily_revenue.sqlx <<'SQLX'
config {
  type: "table",
  assertions: { uniqueKey: ["order_date"], nonNull: ["order_date"] }
}
SELECT order_date, COUNT(*) AS orders, SUM(total_minor) AS revenue_minor
FROM ${ref("orders")}
GROUP BY order_date
SQLX
cat > dataform-lab/definitions/revenue_reconciles.sqlx <<'SQLX'
config { type: "assertion" }
SELECT 'total mismatch' AS problem
WHERE (SELECT SUM(total_minor) FROM ${ref("orders")})
   != (SELECT SUM(revenue_minor) FROM ${ref("daily_revenue")})
SQLX
```

The quoted heredocs preserve `${ref(...)}` for Dataform; Bash must not expand it. Expected output is two daily rows: October 1 revenue `4000` from two orders, and October 2 revenue `500` from one order.

1. Open Dataform → Repositories → Create repository in the intended region. Select a dedicated execution service account with BigQuery Job User on the execution project and scoped permissions on the disposable output datasets. Give only the documented act-as permissions to the relevant operator/service identity.
2. Create and initialize a workspace. Keep the generated, currently supported Dataform core version pinned. In `workflow_settings.yaml`, set `defaultProject` to `PROJECT_ID`, `defaultLocation` to the BigQuery dataset location, `defaultDataset` to a unique lab dataset, and `defaultAssertionDataset` to a separate unique assertion dataset.
3. Copy the three SQLX definitions into the workspace. Compile and inspect the graph. `daily_revenue` must depend on `orders`; the reconciliation assertion must depend on both tables. Compilation alone does not execute BigQuery jobs.
4. Review the compiled SQL and expected query cost. If proceeding with the tiny cloud exercise, run all actions and assertions, inspect the two output rows, and verify zero assertion violations.
5. Add a duplicate `order_id` or negative total. Rerun in the disposable workspace and observe the relevant assertion failure. Configure dependencies/publication policy so failed quality checks prevent downstream published output where required; do not assume every assertion automatically blocks every unrelated action.

## Incremental processing and releases

Incremental tables avoid rebuilding all history, but their filter and merge key define correctness. Late events may fall outside a naive `MAX(timestamp)` filter. A lookback window plus unique-key merge can accommodate bounded lateness; periodic reconciliation or full refresh handles other corrections. Partition updates must account for deletes and source retractions as well as inserts.

Separate developer workspaces, compilation/release configuration, and workflow execution configuration. Use per-developer schema overrides to prevent accidental overwrites of shared tables. Review source changes, inspect compilation output, run assertions against representative fixtures, and promote a known revision. Record the release commit, execution ID, source freshness, and output table versions for incident investigation. [Workflow lifecycle](https://docs.cloud.google.com/dataform/docs/managing-code-lifecycle)

## Troubleshooting and security

Compilation errors often mean an unresolved `ref`, malformed SQLX, or dependency mismatch. Execution errors can be missing BigQuery permissions, dataset location mismatch, unsupported SQL, or a service account different from the interactive user. A workflow may be technically green while serving stale data, so monitor upstream arrival and business freshness separately.

Treat SQL code deployment as access to the execution identity's data permissions. Do not put secrets in repository variables or SQL literals. Limit write access to development datasets and require review before production release. Preserve existing governance policies deliberately when replacing tables; current framework settings and supported behavior should be checked before running destructive rebuilds.

## Cleanup and assessment

Delete the disposable repository/workspace only after saving useful source. Remove the output and assertion datasets, schedules, and any dedicated execution identity you created. Disabling a schedule stops future runs but does not remove stored tables. Remove `dataform-lab` locally when finished.

Exercise: today's pipeline passes row-level validity checks but contains half the usual orders. A worked answer adds source-to-target reconciliation and freshness/completeness checks with an incident owner, while avoiding a rigid historical-volume threshold that blocks legitimate holidays. You pass when a deliberately bad fixture causes the intended publication gate to fail and the operator can locate the violating records.
