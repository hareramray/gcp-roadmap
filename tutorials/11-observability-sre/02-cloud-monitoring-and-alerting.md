# Cloud Monitoring, dashboards, and actionable alerts

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Choose useful service signals, interpret metric types, and design an alert that reaches an accountable person. Use the setup guide's `PROJECT_ID`, `REGION`, and `ZONE` in Cloud Shell. Inspecting an existing project needs the Monitoring API and Monitoring Viewer. Creating dashboards or alert policies would require additional permissions, but this lab only inspects and designs. A notification destination must belong to the exercise owner; do not send test alerts to a real on-call team without arranging the test.

## Understand time series before charting them

A metric descriptor defines a metric's type, labels, value type, and kind. A time series combines metric labels with a monitored resource and its labels. Gauge, delta, and cumulative metrics need different interpretation; a cumulative request count is not a request rate until a rate calculation is applied. Alignment changes points within a series; reduction combines multiple series. Averaging averages can hide unequal request volumes. [Metrics and descriptors](https://docs.cloud.google.com/monitoring/api/metrics).

Start with user-facing latency, traffic, errors, and saturation, then add dependency and capacity signals. Use latency distributions and percentiles instead of only an average. Control label cardinality: customer IDs, request IDs, and arbitrary URLs can produce many time series and higher cost. Normalize paths such as `/orders/{id}` rather than labeling every order separately.

An alert policy has a condition, evaluation behavior, notification configuration, and operational documentation. Define a retest window to avoid reacting to one noisy sample, but account for the detection delay it creates. Missing data is a policy decision: no traffic, an absent exporter, and a healthy zero-error service are not equivalent. Attach a runbook and identify the owning service in the notification. [Alerting overview](https://docs.cloud.google.com/monitoring/alerts).

Uptime checks and synthetic monitors exercise behavior from outside or from supported private configurations. They can reveal failures that a healthy CPU graph misses. A successful homepage probe does not prove checkout works; a synthetic transaction should validate the business-critical path without producing unwanted real orders. [Synthetic monitoring](https://docs.cloud.google.com/monitoring/uptime-checks/introduction).

## Lab: evaluate a proposed page

1. Open Metrics Explorer in the lab project and select an existing service metric. Record the metric type, resource type, unit, sampling period, ingestion delay, labels, and whether values are gauge, delta, or cumulative. If the project is empty, use a metric descriptor from the official catalog and state that no live data was observed.

2. Build a local minute-by-minute dataset:

   ```bash
   cat > minutes.csv <<'EOF'
   minute,total,errors
   1,1000,2
   2,1000,3
   3,1000,80
   4,1000,90
   5,1000,70
   6,1000,1
   EOF
   python3 - <<'PY'
   import csv
   rows=list(csv.DictReader(open('minutes.csv')))
   for r in rows:
       print(r['minute'], f"{100*int(r['errors'])/int(r['total']):.1f}%")
   PY
   ```

   Expected rates are 0.2%, 0.3%, 8%, 9%, 7%, and 0.1%.

3. Draft an alert: error fraction above 5% for three consecutive minutes, with a minimum request volume to reduce low-traffic noise. In the toy data, the qualifying interval ends at minute 5. Production alignment and evaluation timing can shift notification time; describe that uncertainty explicitly.

4. Add a missing-data case by removing minute 4. Decide whether a separate telemetry-health alert or the main alert handles it. Write an explanation of why zero errors cannot be inferred from the absent point.

5. Design a dashboard with request volume, error ratio, p50/p95/p99 latency, dependency errors, and saturation. Use the same service and environment filters so charts describe the same population. Add deployment annotations or a release dimension suitable for troubleshooting without exploding cardinality.

6. Write the notification text: affected service, user impact, observed condition, first triage query, runbook link, dashboard link, escalation owner, and recovery criterion. Simulate the notification with a local document rather than sending it.

## Verification, cleanup, cost, and exercises

Success is an alert that detects the intended sustained failure, ignores the brief healthy variation, and has an explicit missing-data behavior. Common errors include treating cumulative counts as rates, mixing regions or environments, incorrect units, reducing across unrelated services, and an unverified notification channel.

Delete the local CSV when finished. Real custom metrics, managed Prometheus samples, synthetic monitors, and notification options can have usage-based costs; inspect current pricing and cardinality before rollout. Extend the example with unequal request counts across two regions and calculate the correct traffic-weighted global error fraction. Explain why a simple average of regional percentages can mislead the on-call engineer.

