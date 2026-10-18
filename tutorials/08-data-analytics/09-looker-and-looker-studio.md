# Looker and Data Studio: semantic models and trustworthy dashboards

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Analytics roadmap](../../roadmaps/08-data-analytics.md)

## Goal, names, and prerequisites

Define a reliable metric, prepare a clean dataset, and build a dashboard with explicit identity and freshness behavior. Allow 90 minutes. The filename keeps the familiar Looker Studio search term; current documentation states that Looker Studio is now called **Data Studio**. Looker remains a separate product with LookML modeling and governed exploration. [Data Studio naming and introduction](https://docs.cloud.google.com/data-studio/welcome) · [Looker introduction](https://docs.cloud.google.com/looker/docs/intro)

Complete BigQuery fundamentals and [lab setup](../../LAB-SETUP.md). The default local fixture uses Python only. A Data Studio report requires a connected account and a supported connector; connecting BigQuery can incur query charges. A Looker lab requires access to an existing licensed/training instance and development permissions. Do not create a new paid Looker instance merely to inspect a small tutorial.

## Separate data meaning from chart appearance

A semantic model defines dimensions, measures, joins, access rules, and reusable business logic. A dashboard arranges views of those metrics for a decision. A beautiful chart cannot repair a duplicated join or an ambiguous definition of revenue. Define table grain, currency, timezone, refunds, cancellations, and data freshness before choosing colors.

LookML views describe fields and measures, models expose Explores and joins, and dashboards consume the governed model. Primary keys and relationship declarations matter for correct aggregations. Joining one order to several line items can multiply an order-level revenue measure if the model does not account for fanout. Symmetric aggregates and other modeling features help supported patterns, but they depend on correct keys and relationships. [LookML concepts](https://docs.cloud.google.com/looker/docs/what-is-lookml)

Data Studio connects to data sources and offers report-level visualization and calculated fields. Decide whether a metric belongs in the warehouse, a governed Looker model, or a report calculation. If ten reports independently define net revenue, they can drift. Reuse a curated source or semantic definition for important metrics.

## Lab: validate a dashboard fixture

```bash
mkdir -p bi-lab
cat > bi-lab/orders.csv <<'CSV'
order_id,order_date,tenant_id,status,total_minor
101,2026-10-01,a,paid,2500
102,2026-10-01,a,paid,1500
103,2026-10-02,b,cancelled,500
104,2026-10-02,b,paid,2000
CSV
python3 - <<'PY'
import csv
from collections import defaultdict
with open('bi-lab/orders.csv',newline='') as f: rows=list(csv.DictReader(f))
paid=[r for r in rows if r['status']=='paid']
daily=defaultdict(int)
for r in paid: daily[r['order_date']]+=int(r['total_minor'])
assert len(paid)==3
assert sum(daily.values())==6000
with open('bi-lab/daily.csv','w',newline='') as f:
    writer=csv.writer(f)
    writer.writerow(['order_date','revenue_minor'])
    writer.writerows(sorted(daily.items()))
print('Expected: 3 paid orders, revenue 6000 minor units; daily:',dict(daily))
PY
```

1. Write a metric contract: paid revenue equals the sum of `total_minor` for `status='paid'`, with one row per order. This training fixture has a single assumed currency; a real multi-currency dataset needs currency-specific totals or documented conversion.
2. Load `orders.csv` into a disposable BigQuery table using the fundamentals tutorial, or use an approved small-file/Sheets connector. Preserve date and numeric types. Keep this synthetic source private.
3. In Data Studio, create a blank report and connect the source. Add a scorecard for paid revenue, a paid-order count, a daily time series, a status filter, and a source-freshness note. Ensure the scorecard's status condition matches the metric contract rather than relying on a user to set a filter correctly.
4. Verify totals against the Python output: paid revenue `6000`, three paid orders, daily values `4000` and `2000`. Change a date filter and check the scorecard and chart remain consistent.
5. Review credentials and sharing before granting access. Owner credentials, viewer credentials, and supported service-account options have different effects; a report viewer can sometimes see data through delegated credentials even without direct source access. Choose deliberately and test with a restricted viewer. [Data source credentials](https://docs.cloud.google.com/data-studio/data-credentials)

## Looker modeling extension

In an existing training Looker instance, create a development branch and a view pointing to the disposable table. Replace the table reference with your actual project/dataset/table before validation:

```lookml
view: orders {
  sql_table_name: `PROJECT.DATASET.orders` ;;
  dimension: order_id { primary_key: yes type: number sql: ${TABLE}.order_id ;; }
  dimension: tenant_id { type: string sql: ${TABLE}.tenant_id ;; }
  dimension: status { type: string sql: ${TABLE}.status ;; }
  measure: paid_orders { type: count filters: [status: "paid"] }
  measure: paid_revenue_minor {
    type: sum
    sql: ${TABLE}.total_minor ;;
    filters: [status: "paid"]
  }
}
```

Expose the view in a training Explore, validate LookML, run the two measures, and compare with the fixture. Add joins only after stating their cardinality and proving the primary key is unique. Add tenant restrictions through supported access filters/user attributes or database row policies as appropriate; dashboard filter widgets are not authorization. Test with two actual restricted identities and inspect generated SQL. [Access filters](https://docs.cloud.google.com/looker/docs/reference/param-explore-access-filter)

## Performance, failures, and cleanup

Report refresh frequency, caching, query concurrency, and source scans all affect cost and freshness. Use pre-aggregated tables or suitable materialized/derived tables when many viewers repeat the same expensive computation. A cached dashboard must display a useful freshness expectation. A chart that suddenly becomes empty may have changed credentials, field types, schema, date parsing, or source policies.

Watch for averages of averages, blended-source join duplication, null categories, timezone shifts near midnight, and filters applied to only some components. Verify a downloaded/exported report obeys the same intended access rules. Review scheduled deliveries carefully because they distribute data outside the interactive access path.

Delete the disposable report/data source and BigQuery dataset, stop any schedules you created, and discard the Looker development branch if it was only a lab. Remove `bi-lab` locally when finished. Exercise: finance and marketing report different revenue from the same orders. A worked investigation compares grain, cancelled/refunded treatment, timezone, currency, and joins before changing charts. You pass when the dashboard reconciles to a known fixture and the restricted viewer sees only the intended data.
