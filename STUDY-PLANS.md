# Study schedules, specialization paths, and certification practice

[Home](README.md) · [Full roadmap](ROADMAP.md) · [Checklist](CHECKLIST.md)

## Choose a pace

The full library is larger than a short certification course. At 8–10 hours/week, plan a multi-month foundation-and-specialization path and continue into the remaining domains. At 15–20 hours/week, you can move faster, but retain time for labs, failure investigation, and revision. The schedules below are suggested sequences, not guarantees that every tutorial fits a fixed week.

For each study session: spend about a quarter of the time on concepts, half on the exercise, and a quarter on verification, notes, and cleanup. Keep a learning journal with question, prediction, observation, correction, and source. Revisit difficult topics after one day, one week, and one month.

## A 24-week broad first pass

| Weeks | Focus | Evidence to produce |
| --- | --- | --- |
| 1–2 | [Foundations](roadmaps/01-foundations.md) and [setup](LAB-SETUP.md) | Local tests, SQL reconciliation, identity/configuration map |
| 3–4 | [IAM/security basics](roadmaps/02-identity-security.md), [VPC/DNS/firewall](roadmaps/03-networking.md) | Access matrix and private-network plan |
| 5–6 | [Compute](roadmaps/04-compute.md), [storage](roadmaps/06-storage.md) | VM/serverless labs, lifecycle and cleanup evidence |
| 7–8 | [Databases](roadmaps/07-databases.md) | Data model, engine decision, backup/restore design |
| 9–10 | [Integration](roadmaps/13-integration.md), [DevOps](roadmaps/10-devops.md) | Duplicate-safe workflow, versioned deployment, rollback |
| 11–12 | [Containers/GKE](roadmaps/05-containers.md) | Pod diagnostics, workload identity, rollout evidence |
| 13–14 | [SRE/FinOps](roadmaps/11-observability-sre.md) | Dashboard, SLO, incident report, cost analysis |
| 15–17 | [Data analytics](roadmaps/08-data-analytics.md) | Reconciled dataset, pipeline, governed metric |
| 18–20 | [AI and ML](roadmaps/09-ai-ml.md) | Evaluation set, retrieval/model experiment, cost report |
| 21–22 | [Enterprise](roadmaps/12-enterprise.md), advanced security/network revisits | Migration and architecture review |
| 23–24 | [Capstone](roadmaps/14-capstones.md), review and gap repair | Portfolio with tests and limitations |

This is a **first pass** at approximately 15–20 hours/week for someone with some technical background. Beginners should stretch foundations and practice weeks. Enterprise deployments may be represented by explicit design exercises until an authorized sandbox is available.

## Role-based paths

| Role | Prioritize after foundations | Portfolio focus |
| --- | --- | --- |
| Cloud engineer | IAM, networking, compute, storage, Terraform, monitoring | [Serverless application](tutorials/14-capstones/01-serverless-application.md) plus a VM recovery drill |
| Platform/DevOps engineer | Containers, GKE, CI/CD, federation, supply chain, SRE | [GKE platform](tutorials/14-capstones/02-gke-platform.md) |
| Cloud architect | Service selection, networking, data choices, enterprise, reliability, cost | Two capstones plus [design review](tutorials/12-enterprise/05-architecture-framework-and-design-reviews.md) |
| Security engineer | Full security track, private networking, audit, CI trust, incident response | Access-denial evidence and an actionable threat model |
| Network engineer | Full networking track, GKE networking, hybrid, security, operations | Hybrid topology with route/MTU/failover analysis |
| Data engineer | SQL, storage, databases, full analytics, data IAM, orchestration | [Data platform](tutorials/14-capstones/03-data-platform.md) |
| Database engineer | Full database track, migration, storage, networking, recovery | Engine comparison, migration rehearsal, restore evidence |
| ML/AI engineer | Python, data platform basics, full AI track, deployment, observability | [Evaluated AI application](tutorials/14-capstones/04-ai-application-and-architecture-review.md) |
| Application developer | Cloud Run, databases, APIs, events, Firebase, CI/CD, telemetry | Authenticated app with asynchronous processing |

Prioritization does not remove other topics from the library. Use the coverage checklist to distinguish completed, reviewed, and deferred work.

## Certification method

Open the [current official certification catalog](https://cloud.google.com/learn/certification), choose the role relevant to your work, and read that exam's guide, eligibility details, delivery policy, and recommended experience. Product coverage and exam names can change; the official catalog explicitly directs candidates to current exam guides for product updates.

Create a private objective-to-evidence table: official objective, matching tutorial, lab evidence, confidence, and remaining gap. Use official sample questions to learn format and identify misunderstandings. Do not treat answer memorization or unauthorized exam dumps as expertise. A correct practice answer should include why the alternatives fail the stated requirements.

Before scheduling an exam, explain each domain without notes, complete representative labs, diagnose several failures, and revisit weak areas. Certification is optional for using this library and does not replace production experience.

## Weekly review

Record one architecture decision, one failure you diagnosed, one permission you narrowed, one cost driver you measured, and one topic you still cannot explain. End the week with cleanup and a billing/resource check. Keep unfinished work visible rather than checking a box because you read the title.
