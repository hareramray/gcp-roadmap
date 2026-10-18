# Incident response and systematic troubleshooting

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Run a tabletop incident, narrow a failure using evidence, and produce a useful postmortem. Use Cloud Shell Bash and `PROJECT_ID`, `REGION`, and `ZONE` from the setup guide for optional read-only inspections. Logs require the Logging API and Logs Viewer; service metadata needs that service's viewer permissions. The primary exercise is synthetic and needs no privileged access. Never create a production outage or send incident notifications to real teams as a training step.

## Organize before debugging overwhelms you

Declare an incident when user impact or risk warrants coordinated action, even before the cause is known. Assign an incident commander to coordinate priorities, an operations lead to manage technical mitigation, and a communications lead to maintain updates. In a small exercise one person can hold multiple roles, but responsibilities must remain explicit. Keep a shared timeline, decisions, owners, and current hypotheses. [Incident response](https://sre.google/workbook/incident-response/).

Prioritize reducing customer impact, then investigate the underlying cause. A rollback can be the fastest mitigation if the previous version and data compatibility are known. A rollback is unsafe when a schema change prevents old code from reading current data. Rate limiting, traffic shifting, disabling a feature, or restoring capacity can be alternatives; record the evidence and expected effect before applying one.

Troubleshoot by narrowing the scope: all users or one segment; all regions or one; new requests or existing sessions; one release or every version. Separate DNS, transport, TLS, authentication, authorization, application, and dependency failures. An HTTP 403 could originate in IAP, IAM, an application, or a service perimeter. A 503 could represent capacity, readiness, a backend timeout, or an intentional maintenance response. Status codes are clues, not diagnoses.

## Lab: the failed checkout release

1. Use this timeline: 09:00 release r42 begins; 09:03 errors rise from 0.2% to 8%; 09:05 latency rises only in the new version; 09:07 the database reports connection saturation; old instances remain mostly healthy. State known facts separately from the hypothesis that r42 leaks connections.

2. Create a local incident record:

   ```bash
   cat > incident-training.md <<'EOF'
   Incident: synthetic checkout degradation
   Severity: high user impact, simulated
   Commander: learner
   Impact: approximately 8 percent checkout errors in supplied scenario
   Leading hypothesis: new release exhausts connection pool
   Next action: compare release cohorts and prepare compatible rollback
   Update cadence: every 15 minutes during exercise
   EOF
   ```

3. Define the first three queries: error ratio by release, active database connections over time, and application timeout logs filtered to r42. If authorized existing logs use comparable fields, inspect a bounded sample:

   ```bash
   gcloud logging read 'severity>=ERROR' --project="$PROJECT_ID" \
     --freshness=1h --limit=20 --format=json > incident-log-sample.json
   ```

   This query is exploratory, not proof of the synthetic incident. Do not mix unrelated real events into the fictional timeline.

4. Choose a mitigation after checking schema compatibility. For the scenario, stop the rollout and return traffic to the last known-good version, while watching database load. Describe how sudden traffic concentration could overload the old fleet and why capacity must be checked first. Do not execute the rollback in a live project.

5. Add a counterfactual: if both old and new versions fail equally before the release, the release hypothesis weakens. Investigate shared dependencies, quotas, network changes, identity changes, and provider incidents. Consult project-specific Personalized Service Health where available as well as public status; a green global status page does not rule out a project-specific problem. [Service Health overview](https://docs.cloud.google.com/service-health/docs/overview).

6. Write a recovery criterion: error ratio and latency return within the agreed range, successful synthetic checkout passes, backlog drains, and stability persists for an observation window. Closing the incident merely because a deployment command succeeded is insufficient.

## Postmortem and acceptance criteria

Produce a blameless account of impact, detection, timeline, contributing conditions, mitigation, and follow-up actions. Replace “engineer made a mistake” with the missing validation or unsafe system condition. Give each action an owner, due date, and verification test. Examples include a connection-leak load test, bounded client pools, rollout abort thresholds, and an alert tied to user impact. [Postmortem culture](https://sre.google/sre-book/postmortem-culture/).

Success means another responder can continue from your record without repeating the investigation. Avoid simultaneous untracked changes, deleting evidence, broad permission escalation, and untested recovery commands. Capture request IDs and timestamps but sanitize secrets and customer data before sharing evidence.

## Cleanup, cost, and exercises

Delete sensitive local log samples according to the team's retention policy. The synthetic exercise creates no cloud resources. Real incident mitigation can increase spend through temporary scaling or failover; record the cost and assign cleanup ownership after stabilization. Extend the exercise with a regional network failure and a compromised deployment identity, then explain how technical mitigation and security evidence preservation change.

