# Review questions, practical assessments, and portfolio defense

[Home](README.md) · [Roadmap](ROADMAP.md) · [Capstones](roadmaps/14-capstones.md)

Use these prompts after the relevant tutorials. Answer aloud, draw a diagram, state assumptions, and describe evidence you would collect. A useful answer explains tradeoffs and failure behavior rather than listing product names. The linked roadmaps contain the underlying tutorials.

## Foundation and identity assessment

1. A Python client fails while `gcloud` succeeds. What credentials, project, and quota configuration do you compare? **Strong answer:** separates ADC from CLI credentials and authentication from authorization. See [foundations](roadmaps/01-foundations.md).
2. A project Viewer can still modify a resource. What inherited policies or other identities might explain it? **Strong answer:** inspects effective access instead of assuming one local binding is the entire policy. See [security](roadmaps/02-identity-security.md).
3. Why does deploying as a service account require different permissions from that account's database access? **Strong answer:** distinguishes deployer, runtime, and service-agent identities.
4. A budget alert arrives after charges exceed its threshold. Is the system broken? **Strong answer:** explains alerting delay and budgets versus hard caps, and proposes inventory/quotas/automation with their limitations.

## Networking and application assessment

5. A private VM reaches Cloud Storage but not a public package repository. **Strong answer:** investigates Private Google Access versus general egress/NAT, DNS, routes, and firewall policy. See [networking](roadmaps/03-networking.md).
6. A DNS record resolves correctly but HTTPS fails. **Strong answer:** separates transport, certificate/hostname, proxy, backend, and application layers.
7. A peers with B and B peers with C. Why can A not assume access to C? **Strong answer:** explains non-transitive peering and proposes a supported explicit connectivity design.
8. A regional MIG has autohealing but users see failures. **Strong answer:** reviews health-check meaning, rollout strategy, backend readiness, state dependencies, and capacity. See [compute](roadmaps/04-compute.md).
9. A Cloud Run service overwhelms its database as traffic rises. **Strong answer:** discusses concurrency, instance bounds, connection pooling, downstream capacity, deadlines, and queueing rather than simply increasing database size.
10. Pods are Pending versus CrashLoopBackOff. **Strong answer:** uses scheduling events for the first and container/probe/configuration evidence for the second. See [containers](roadmaps/05-containers.md).

## Data and integration assessment

11. Choose a database for a global transaction workload, a PostgreSQL migration, a document app, and key-oriented telemetry. **Strong answer:** states access patterns, consistency, locality, operations, recovery, and cost assumptions. See [databases](roadmaps/07-databases.md).
12. Why can a replica fail to protect against accidental deletion? **Strong answer:** distinguishes replication, backup isolation, retention, point-in-time recovery, and tested restore.
13. A dashboard total doubles after adding a join. **Strong answer:** checks grain and one-to-many cardinality before blaming caching. See [analytics](roadmaps/08-data-analytics.md).
14. A stream retries an event after the worker crashes. **Strong answer:** defines idempotency, acknowledgement boundary, durable effect, deduplication scope, and replay behavior.
15. Choose Pub/Sub, Tasks, Scheduler, Workflows, or Airflow for five concrete scenarios. **Strong answer:** describes fanout, explicit dispatch, time triggers, service orchestration, and data DAGs. See [integration](roadmaps/13-integration.md).
16. A BigQuery query becomes expensive. **Strong answer:** examines bytes processed, partition pruning, clustering, joins, selected columns, capacity model, and repeated dashboard queries.

## Delivery, operations, and architecture assessment

17. Terraform plans to replace a database unexpectedly. **Strong answer:** stops before apply, identifies the changed immutable attribute/provider/state issue, assesses data recovery, and reviews alternatives. See [DevOps](roadmaps/10-devops.md).
18. An external CI pipeline needs Google Cloud access. **Strong answer:** designs federation with narrowly constrained issuer/subject/repository/environment claims and least privilege.
19. Why can a deployment rollback fail to restore correct behavior after a schema migration? **Strong answer:** distinguishes code rollback from data/schema compatibility and uses backward-compatible migration stages.
20. Define an SLO for checkout. **Strong answer:** chooses eligible user interactions, success criteria, latency threshold, measurement window, and actionable burn-rate response. See [SRE](roadmaps/11-observability-sre.md).
21. A service has backups but has never restored them. **Strong answer:** treats recovery as unproven, defines RPO/RTO, and schedules an isolated restore/reconciliation exercise.
22. A company wants multicloud for resilience. **Strong answer:** identifies actual failure domains, data consistency, identity, networking, operator skill, testing, and cost. See [enterprise](roadmaps/12-enterprise.md).

## AI assessment

23. The model answers a training question convincingly but cites the wrong passage. **Strong answer:** separates retrieval relevance, grounding, answer correctness, and citation support. See [AI/ML](roadmaps/09-ai-ml.md).
24. A retrieved document instructs the assistant to leak another user's records. **Strong answer:** treats it as untrusted data and enforces authorization outside model instructions.
25. When should you fine-tune rather than improve retrieval or prompting? **Strong answer:** defines the measured failure, available data, evaluation method, update frequency, latency, and total lifecycle cost.
26. An agent loops on a failing tool call. **Strong answer:** imposes validated arguments, permission boundaries, deadlines, bounded calls/retries, explicit failure state, and useful monitoring.

## Practical assessment format

Choose one task you can safely execute in a disposable environment: diagnose a denied request, repair a failing local test, reconcile a data total, inspect a rollout failure, or restore synthetic data. Set a 45–90 minute working window, but stop if you reach your budget/resource boundary. Record the initial symptom, competing hypotheses, tests, outcome, and cleanup. A well-explained unsuccessful experiment can reveal more understanding than an unexplained green screenshot.

Score each response from 0–3: 0 = unfamiliar; 1 = vocabulary only; 2 = correct explanation with tradeoffs; 3 = explanation plus demonstrated evidence and recovery/cleanup. Revisit any item below 2. Do not convert the score into an unsupported prediction of exam success.

## Portfolio defense

For each capstone, prepare a five-minute walkthrough: user need, constraints, architecture, hardest decision, test evidence, failure drill, cost, and remaining limitation. Include one alternative you rejected and the requirement that ruled it out. Remove credentials and private data from artifacts. Distinguish simulated outcomes from live results and say what you would validate before production.
