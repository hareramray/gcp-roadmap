# Complete Google Cloud learning roadmap

[Home](README.md) · [All-topic coverage](COVERAGE.md) · [Progress checklist](CHECKLIST.md)

This roadmap orders the curriculum by dependencies. Read a topic, perform its exercise, explain a failure mode, and retain evidence before moving on. Domain numbering organizes the library; you can revisit earlier material as your projects become more realistic. The estimated hours below are planning guidance, not a promise of mastery or exam readiness.

## Stage 1: build the foundation

**Start with [Foundations](roadmaps/01-foundations.md), then [lab setup](LAB-SETUP.md).** Learn cloud responsibility and failure domains, Linux/Bash, IP/DNS/TLS/HTTP, Git/Python/API clients, SQL/data modeling, projects/billing/quotas, CLI authentication, and resource hierarchy. Allocate roughly 30–50 hours if these are new.

Exit evidence: a working local program with tests; a SQL query whose totals you can reconcile; a request-path diagram; a correctly identified learning project and account; a budget plan; and an explanation of CLI credentials versus ADC. Do not start Kubernetes before you can inspect a process, port, HTTP error, and log.

## Stage 2: identity, security, and networks

Work through [Identity and security](roadmaps/02-identity-security.md) and [Networking](roadmaps/03-networking.md). Begin with IAM/service accounts and VPC/firewall/DNS basics, then private connectivity, managed secrets/keys, organization controls, service perimeters, hybrid designs, and security operations. Allocate 50–90 hours, with organization-only topics completed as explicit design exercises if needed.

Exit evidence: a least-privilege identity matrix, private-network topology, successful and denied access tests, secret lifecycle, audit evidence, and a packet-path investigation. Explain why private reachability, encryption, authentication, and authorization are separate controls. Treat logs and cost checks as part of every later stage.

## Stage 3: host applications and persist data

Study [Compute](roadmaps/04-compute.md), [Storage](roadmaps/06-storage.md), and the selection/modeling and relevant service topics in [Databases](roadmaps/07-databases.md). Learn VMs and instance groups, Cloud Run/services/jobs/functions, App Engine, batch/accelerator patterns, object/block/file storage, backups, transactional databases, NoSQL stores, and caches. Allocate 65–110 hours for broad study; go deeper on your chosen application stack.

Exit evidence: one VM-based workload and one serverless workload, a justified database choice, narrowly scoped runtime identity, restore test, cost model, and cleanup proof. Describe when a cache can lose data and why a replica is not a complete backup strategy.

## Stage 4: integrate and deliver

Study [Application integration](roadmaps/13-integration.md) and [DevOps](roadmaps/10-devops.md). Then complete [Containers](roadmaps/05-containers.md) if your application/platform path needs Kubernetes. Integration covers Workflows, Eventarc, Tasks/Scheduler, API management, application identity, Firebase, and business connectors. Delivery covers Terraform, managed infrastructure, builds, deploy pipelines, keyless CI, tests, supply-chain controls, and developer platforms. Allocate 65–110 hours plus 30–55 for container depth.

Exit evidence: reproducible infrastructure, an immutable artifact, a tested deployment and rollback, a bounded background task, and duplicate-safe event handling. Explain who can deploy versus who can read runtime data. On GKE, prove identity, health, network policy, rollout, and cleanup behavior.

## Stage 5: operate as a production engineer

Study [Observability and SRE](roadmaps/11-observability-sre.md) and [Enterprise architecture](roadmaps/12-enterprise.md). Logging and monitoring should already be in use; now formalize traces, SLOs, error budgets, recovery objectives, incident response, FinOps, migrations, hybrid operations, identity governance, and design review. Allocate 55–95 hours.

Exit evidence: a meaningful user-centered SLO, a useful alert, an incident timeline, measured recovery, a migration rollback decision, and an architecture review covering security, reliability, operations, performance, cost, and sustainability. An alert that nobody owns is unfinished work.

## Stage 6: specialize in data and AI

Study [Data analytics](roadmaps/08-data-analytics.md), followed by [AI and ML](roadmaps/09-ai-ml.md) as relevant. Analytics includes BigQuery, Pub/Sub, Beam/Dataflow, Spark, Airflow, Dataform, catalog/lakehouse governance, and BI. AI includes classical ML, training/serving, generative models, retrieval, agents, evaluation, MLOps, and specialized APIs. Allocate 65–110 hours for analytics and 50–90 for AI foundations and applied practice.

Exit evidence: reconciled pipeline results, duplicate/late-data handling, access-controlled analytics, an evaluated model or retrieval application, explicit model/version dependencies, and a measured latency/cost profile. An impressive single answer is not an evaluation result.

## Stage 7: integrate and demonstrate

Complete one [capstone](roadmaps/14-capstones.md), then a second from a different domain. Each provides milestones, acceptance tests, failure drills, cleanup, and portfolio requirements. Allocate 12–30 hours per project initially, with more time for hardening.

Present the problem, constraints, architecture, alternatives, implementation, tests, failure recovery, costs, and remaining limitations. Label design-only work and live tests separately. Use [review questions](INTERVIEW-AND-REVIEW.md) to explain decisions without reading notes.

## Completion standard

A checked topic means you can teach the concept, complete the guided exercise or defend its design artifact, verify success and a failure case, name operational/cost/security tradeoffs, and clean up resources. Reading alone is an initial pass. A course-wide first pass is several hundred hours; genuine production expertise requires repeated work on real requirements over time.

Use [role-based study plans](STUDY-PLANS.md) to prioritize while keeping the full [coverage map](COVERAGE.md) available. Official [certification guides](https://cloud.google.com/learn/certification) are the source of current exam objectives, which can differ from the breadth and order of this practical curriculum.
