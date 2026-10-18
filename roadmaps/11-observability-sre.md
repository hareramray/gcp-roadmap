# Roadmap 11 — Observability, SRE, reliability, and FinOps

[Curriculum home](../README.md) · [Lab setup](../LAB-SETUP.md)

This track turns a deployed application into an operable service. You will connect user experience to telemetry, paging, incident decisions, recovery tests, and cost. The exercises provide local datasets, calculations, instrumentation, and tabletop scenarios; read-only cloud inspections are optional when existing resources are available.

## Preparation and sequence

Complete the foundations of IAM, application hosting, networking, storage, and databases first. Know which team owns the application, which users it serves, and what a successful transaction means. Suggested effort is 16–25 hours plus later supervised practice on a deployed workload. Use the shared Cloud Shell variables and synthetic data; no production disruption or paid monitoring pipeline is required for these lessons.

| Order | Tutorial and complete topic scope | Evidence of learning |
|---|---|---|
| 1 | [Cloud Logging](../tutorials/11-observability-sre/01-cloud-logging.md): structured payloads, monitored resources, collection, queries, routing, sink identities, retention, views, logs-based metrics | Define a useful schema and a tested log-routing design. |
| 2 | [Monitoring and alerting](../tutorials/11-observability-sre/02-cloud-monitoring-and-alerting.md): metric descriptors, gauges/deltas/counters, alignment/reduction, dashboards, cardinality, alert windows, missing data, uptime/synthetic checks | Detect a sustained error condition and explain notification behavior. |
| 3 | [Tracing, profiling, and OpenTelemetry](../tutorials/11-observability-sre/03-tracing-profiling-and-opentelemetry.md): spans, propagation, critical path, collectors, sampling, correlation, CPU/wait analysis | Generate three local spans and interpret their relationships. |
| 4 | [SLOs and SRE](../tutorials/11-observability-sre/04-slos-error-budgets-and-sre.md): SLIs/SLOs/SLAs, good/valid events, error budgets, burn rates, release policies, toil | Calculate a budget and make a justified release decision. |
| 5 | [Reliability and disaster recovery](../tutorials/11-observability-sre/05-reliability-backups-and-disaster-recovery.md): failure domains, availability/durability, RPO/RTO, backups, vaults, consistency, failover/failback, restore drills | Restore synthetic data and produce a dependency-complete recovery plan. |
| 6 | [Incident response](../tutorials/11-observability-sre/06-incident-response-and-troubleshooting.md): command roles, timelines, scoped diagnosis, mitigation, provider health, recovery criteria, postmortems | Lead a simulated failed-release incident and assign testable follow-ups. |
| 7 | [FinOps and billing](../tutorials/11-observability-sre/07-finops-billing-and-cost-optimization.md): billing dimensions, allocation, budget notifications, exports, egress, rightsizing, quotas, commitments, unit economics | Build a cost model and distinguish savings from unused commitments. |

## Integrated completion project

For the same orders application, assemble a service operations packet: log schema and query set, dashboard sketch, alert specification, trace example, SLO document, budget calculation, incident runbook, recovery plan, and monthly cost model. Make the telemetry population and time window consistent across artifacts. Include missing telemetry, dependency failure, regional outage, corrupted data, and unexpected cost growth as test cases.

The readiness review should answer five questions with evidence: how quickly do users notice failure; how quickly does the team detect it; who acts and how; can data and service be recovered; and what does normal versus emergency operation cost? Do not equate an alert policy with a working on-call process, a backup with a proven restore, or a billing budget with a hard spending cap.

Revisit the packet after releases and architecture changes. Product capabilities, telemetry pricing, and backup workflows evolve; follow the dated official references in each tutorial and verify service-specific limits before deployment.

