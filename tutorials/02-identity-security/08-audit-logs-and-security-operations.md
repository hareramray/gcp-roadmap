# Audit logs, investigation, and Google Security Operations

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Build an evidence-based timeline from audit records and distinguish customer activity from Google personnel access. Cloud Shell uses the setup guide's `PROJECT_ID`, `REGION`, and `ZONE`. Read-only queries need the Logging API and Logs Viewer; Data Access audit records generally require Private Logs Viewer or equivalent permissions. Some logs must have been enabled before the event. Google Security Operations requires a separate configured instance and entitlement; its section is a design exercise if unavailable. No SIEM instance or export pipeline is deployed.

## Know what each log proves

Cloud Audit Logs includes Admin Activity, Data Access, System Event, and Policy Denied categories. Admin Activity records configuration changes; Data Access covers supported reads and writes of user data and configuration. Data Access logging is not universally enabled by default; BigQuery is a notable default-enabled case. Check the specific service's audited operations, configuration, exclusions, and permission requirements. Logs cannot reconstruct events that were never emitted or retained. [Audit Logs overview](https://docs.cloud.google.com/logging/docs/audit).

An investigation should correlate event time, ingestion time, principal, delegated identity, method, resource, request metadata, authorization information, status, and operation identifiers. Caller IP may represent a proxy or service, not a person's physical location. A service-account identity may have been impersonated; delegation evidence and identity-provider logs can matter. Preserve raw evidence with access control and a record of collection steps before transforming it for analysis.

Google Security Operations provides SIEM capabilities for ingestion, normalization, detection, search, and investigation, with related response workflows. Normalization into a common event model helps correlate multiple sources, but parser quality, timestamp handling, and source completeness remain operational responsibilities. A rule match is a lead to investigate, not automatic proof of malicious intent. [Google SecOps overview](https://docs.cloud.google.com/chronicle/docs/overview).

Access Transparency concerns supported Google personnel access. Access Approval provides an approval mechanism for eligible provider access, subject to documented service coverage and exceptions. Neither replaces audit logging for your own identities. Approval, actual access, and the business justification are separate evidence items. [Access Transparency](https://docs.cloud.google.com/assured-workloads/access-transparency/docs/overview), [Access Approval](https://docs.cloud.google.com/assured-workloads/access-approval/docs/overview).

## Lab: reconstruct a policy change

1. Query a narrow window without requesting a massive export:

   ```bash
   gcloud logging read \
     'log_id("cloudaudit.googleapis.com/activity") AND protoPayload.methodName:"SetIamPolicy"' \
     --project="$PROJECT_ID" --freshness=7d --limit=20 --format=json \
     > iam-events.json
   jq 'length' iam-events.json
   ```

   Zero records means the query found no matching retained events, not that no IAM change has ever occurred.

2. Extract a timeline locally:

   ```bash
   jq -r '.[] | [.timestamp,
     .protoPayload.authenticationInfo.principalEmail,
     .protoPayload.methodName, .protoPayload.resourceName,
     (.protoPayload.status.code // 0)] | @tsv' iam-events.json
   ```

3. Select one approved event, or use a synthetic example: at 10:00 a deployer grants a bucket role; at 10:03 a new principal reads an export; at 10:05 an alert fires. List facts and hypotheses separately. A grant followed by a read does not by itself establish that the grant was unauthorized.

4. Define the next evidence sources: change ticket, effective policy before and after, IdP sign-in, service-account delegation, data-access event, object metadata, and pipeline execution. Mark unavailable evidence explicitly. Use stable resource and request identifiers for correlation when possible, not only display names.

5. Write a containment proposal that revokes only the suspicious access path, preserves evidence, checks ongoing sessions or credentials, and validates legitimate service health. For this exercise, do not apply the proposal. Rebuilding trust may require credential rotation and source-system remediation beyond an IAM edit.

6. Design a SecOps detection for an unusual privileged grant followed by sensitive data access. State required log sources, normalization fields, time window, expected legitimate automation, suppression logic, and a test event. Include a delayed-log case and a duplicate-event case.

## Verification, cleanup, cost, and exercises

A successful report includes a reproducible query, UTC timeline with local-time conversion if needed, evidence references, uncertainty, and recommended next actions. Avoid declaring a person responsible solely from a shared identity. Failure modes include wrong project scope, querying receive time instead of event time, absent Data Access logging, field-path differences, and excessive filter specificity.

Delete local audit exports according to the exercise's retention policy; they may contain personal and security-sensitive metadata. Real log retention, exports, analytics, and SecOps ingestion can be billable. Extend the scenario with an approved Google support action and demonstrate which Access Approval and Access Transparency records would substantiate it without confusing it with a customer administrator operation.

