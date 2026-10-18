# Cloud Logging: ingestion, queries, routing, and retention

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Build a useful log schema, query an existing project, and design a central log route without enabling an expensive stream. Use Bash in Cloud Shell with `PROJECT_ID`, `REGION`, and `ZONE` from the setup guide. Read queries require the Logging API and Logs Viewer; private audit logs need additional permission. Inspecting sinks requires corresponding logging configuration permissions. If the project has no logs, use the synthetic local dataset. No cloud sink, bucket, metric, or retention lock is created.

## What happens to a log entry

A log entry has a log name, timestamp, severity, monitored resource, labels, and a payload such as `textPayload` or `jsonPayload`. Structured JSON lets a query select an exact status or duration instead of matching ambiguous text. Include a service name, release identifier, operation, outcome, and correlation identifier. Avoid tokens, passwords, full request bodies, and unnecessary personal identifiers. [Structured logging](https://docs.cloud.google.com/logging/docs/structured-logging).

Cloud Logging receives entries from supported services, agents, and applications. On VMs, the Ops Agent can collect configured logs and metrics; an application client library is another path. Collection configuration, agent health, permissions, buffering, and API quotas affect completeness. A successful application request does not prove its log was ingested. [Cloud Logging overview](https://docs.cloud.google.com/logging/docs/overview).

Log Router sinks select entries and route them to supported destinations such as log buckets, Cloud Storage, BigQuery, or Pub/Sub. A sink is routing configuration, not a historical backfill operation. The destination must authorize the sink's writer identity. Aggregated sinks at organization or folder scope introduce inheritance and routing behavior that must be tested carefully. Exclusions reduce selected routed volume; they do not necessarily eliminate every charge associated with collecting or exporting the same event elsewhere. [Log routing](https://docs.cloud.google.com/logging/docs/routing/overview).

Retention, bucket location, log views, and field-level access controls answer different questions. Retention defines how long entries remain; a view restricts which entries a reader sees. A locked retention configuration can be difficult or impossible to shorten. Security, operations, and application teams may need different views over the same centrally retained data.

## Lab: query and route deliberately

1. Read a bounded set of recent errors:

   ```bash
   gcloud logging read 'severity>=ERROR' --project="$PROJECT_ID" \
     --freshness=1d --limit=20 --format=json > recent-errors.json
   jq 'length' recent-errors.json
   ```

   Empty results are normal in a quiet project. Record project scope and window before concluding the application has no errors.

2. Create a local example of the schema you want applications to emit:

   ```bash
   cat > sample-logs.jsonl <<'EOF'
   {"severity":"INFO","service":"orders","release":"r1","request_id":"a1","status":200,"latency_ms":90}
   {"severity":"ERROR","service":"orders","release":"r2","request_id":"a2","status":503,"latency_ms":1700}
   {"severity":"INFO","service":"orders","release":"r2","request_id":"a3","status":200,"latency_ms":120}
   EOF
   jq -s '[.[] | select(.status >= 500)] | length' sample-logs.jsonl
   ```

   Expected count: `1`. This local JSON is training data, not evidence that anything was ingested into Cloud Logging.

3. Write a Logs Explorer query for a deployed version of the schema: `jsonPayload.service="orders" AND jsonPayload.release="r2" AND severity>=ERROR`. Add the appropriate monitored-resource type once you know the hosting platform. Do not assume every platform records custom fields under the same path.

4. Inspect existing sinks if authorized:

   ```bash
   gcloud logging sinks list --project="$PROJECT_ID" \
     --format='table(name,destination,filter)'
   ```

5. Design a central route for security audit events and an application route for operational logs. Specify filter, destination project, location, writer permission, retention, readers, estimated daily bytes, and an alert on delivery failures. Include a test event that should match and another that should not.

6. Define a logs-based counter for server errors conceptually. Explain why it measures emitted log events rather than guaranteed user requests: retries, duplicated logs, sampling, and missing emissions can change the count. Use request metrics for an SLO when they provide a stronger denominator.

## Verification, cleanup, cost, and exercises

Acceptance requires a schema, reproducible query, routing test matrix, and access/retention design. Diagnose missing records by checking source emission, resource/project scope, timestamp, severity mapping, exclusions, permissions, and destination delivery. Investigate delay before rerunning bulk ingestion.

Delete local example and export files after review. Real ingestion, retention beyond included allowances, analytics, and destination services can incur charges. Estimate volume from events per second × average bytes × retention, then measure actual billing. Extend the schema with trace correlation and prove that it supports troubleshooting without logging a customer email or credential.

