# FinOps, billing, budgets, and cost optimization

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Explain a cloud bill, design useful budget notifications, and evaluate an optimization without purchasing anything. Use Bash in Cloud Shell with `PROJECT_ID`, `REGION`, and `ZONE` from the setup guide. The primary calculation is local and uses invented prices. Reading real billing data needs billing-account permissions; project Viewer does not automatically provide them. Billing export configuration, BigQuery queries, budget creation, and commitments require separate authorization and can incur charges or obligations. No commitment or billing change is made here.

## Understand the bill's dimensions

Costs depend on service, SKU, resource usage, location, pricing model, negotiated terms, credits, taxes, currency, and adjustments. Distinguish list cost, effective cost, amortized commitment cost, and invoice totals. Allocate costs to an accountable team using project structure, labels, supported tags, and billing-export fields. Unallocated shared networking, logs, and security spend still need an agreed allocation method.

A budget compares actual or forecast spend with thresholds and sends notifications. **A budget is not a hard spending cap and does not automatically stop resources.** Notifications and billing data can be delayed. Automated responses can restrict services or disable billing, but can also interrupt workloads and do not guarantee zero overshoot. Quotas limit particular resource dimensions or API rates; they are not a universal monetary cap. [Budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets), [Cloud Quotas](https://docs.cloud.google.com/docs/quotas/overview).

Cloud Billing export to BigQuery supports detailed analysis. Configure the desired export types and compatible dataset location before relying on them. Data availability, schema evolution, late adjustments, and historical backfill behavior must be understood. Partition-aware queries and maximum-bytes-billed settings help control analysis cost. A billing dashboard that silently omits credits or new SKUs can mislead stakeholders. [Billing export](https://docs.cloud.google.com/billing/docs/how-to/export-data-bigquery).

## Lab: choose the best cost action

1. Create an invented monthly estimate; these values are training inputs, not current Google Cloud prices:

   ```bash
   python3 - <<'PY'
   items={'compute':720.0,'database':400.0,'storage':100.0,
          'egress':180.0,'observability':100.0}
   total=sum(items.values())
   for name,cost in items.items():
       print(name, cost, round(100*cost/total,1),'percent')
   print('total',total)
   print('unit cost per 100000 orders',total/100000)
   PY
   ```

   Expected total is 1,500 units of currency and cost per order is 0.015. State which volume and service quality the denominator represents.

2. Compare three actions: remove 120 of idle compute; reduce 60 of egress by co-locating a chatty dependency; reduce 40 of logs by removing duplicate debug events. Record reliability, security, performance, and implementation impacts. Deleting audit evidence merely to lower the bill is not an acceptable unreviewed optimization.

3. Design budget thresholds at 50%, 80%, and 100%, plus a forecast warning. Assign finance and technical owners, define how they verify an anomaly, and specify escalation outside office hours. Include a test of delivery to approved recipients in a later controlled implementation.

4. Draft a billing-export query that groups by usage date, project, and service and includes credits correctly. Write it against the actual documented schema only after inspecting your table. Avoid pasting a guessed table name or running an unrestricted query over years of data. Keep invoice reconciliation distinct from daily operational reporting.

5. Evaluate a commitment using a toy example: a steady eligible baseline costs 100 per month on demand, while a proposed commitment would cost 75 per month for a fixed term. If demand falls to 40, unused commitment can outweigh the discount. Compare eligible usage, scope, term, utilization, coverage, sharing, and future architecture plans before buying. Resource-based and spend-based commitments differ; a discount is not necessarily a capacity reservation. [Compute commitments](https://docs.cloud.google.com/compute/docs/instances/signing-up-committed-use-discounts).

6. Build a weekly review: anomalous SKUs, idle resources, rightsizing, storage lifecycle, backup retention, data transfer, autoscaling limits, commitment utilization, and unit cost. Assign a named owner and a verification date to each action. Measure savings after implementation instead of treating a recommendation as realized money.

## Verification, cleanup, and exercises

Success is a cost model with stated assumptions, a notification plan that acknowledges delay, and an optimization justified by workload metrics. Common errors include ignoring egress, mistaking quota for budget, assuming stopped VMs have no attached-disk charges, forgetting retained backups, or purchasing commitments before eliminating idle usage.

The local calculation incurs no cloud resource charges. Do not delete shared resources or disable billing in this exercise. Extend the model with a peak sale event and a disaster recovery drill. Explain how you would preserve service quality, estimate temporary cost, monitor actual usage, and clean up temporary capacity after the event.

