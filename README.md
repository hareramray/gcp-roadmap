# Google Cloud roadmap and tutorial library

A practical curriculum from first cloud concepts to production architecture, operations, data engineering, and AI. Start with the foundations, build small systems, then specialize. The material is written for a learner who wants to understand **why a service is chosen, how to use it, how to verify it, and how to operate it**.

The library contains **92 tutorials across 14 domains**, including four capstone projects, plus study plans, a progress checklist, service comparisons, a glossary, and review questions. The [coverage map](COVERAGE.md) links every topic to its tutorial.

Prepared on **18 October 2026**. Official documentation was consulted during authoring; prices, quotas, regional availability, product names, exam objectives, and preview features can change. Follow each tutorial's official references before provisioning resources.

## Start here

1. Read [the complete learning sequence](ROADMAP.md).
2. Set up [your lab environment](LAB-SETUP.md). The command examples use **Bash in Google Cloud Shell**, including when your own computer runs Windows.
3. Open a domain roadmap below, then work through its linked tutorials.
4. Record results in [the progress checklist](CHECKLIST.md). A topic is complete when you can explain it, perform or defend its exercise, investigate a failure, and clean up.
5. Use [role-based paths](STUDY-PLANS.md), [capstones](roadmaps/14-capstones.md), and [review questions](INTERVIEW-AND-REVIEW.md) to turn the material into a portfolio.

## Domain roadmaps

| Order | Roadmap | What you will learn |
| --- | --- | --- |
| 01 | [Foundations](roadmaps/01-foundations.md) | Cloud, Linux, networking, Git, Python, SQL, setup, authentication, resource hierarchy |
| 02 | [Identity and security](roadmaps/02-identity-security.md) | IAM, service accounts, policies, secrets, keys, perimeters, posture, audit, data protection |
| 03 | [Networking](roadmaps/03-networking.md) | VPCs, firewall rules, DNS, NAT, private services, load balancing, hybrid networking, diagnostics |
| 04 | [Compute](roadmaps/04-compute.md) | VMs, instance groups, Cloud Run, functions, App Engine, batch and accelerators |
| 05 | [Containers](roadmaps/05-containers.md) | Images, registries, Kubernetes, GKE, workload identity, fleet operations |
| 06 | [Storage](roadmaps/06-storage.md) | Object, block, file, parallel storage, transfer and backup |
| 07 | [Databases](roadmaps/07-databases.md) | Data modeling, SQL, AlloyDB, Spanner, Firestore, Bigtable, caches, migration |
| 08 | [Data analytics](roadmaps/08-data-analytics.md) | BigQuery, messaging, streaming, Spark, orchestration, transformations, catalog, BI |
| 09 | [AI and ML](roadmaps/09-ai-ml.md) | ML foundations, training, inference, Gemini, retrieval, agents, evaluation and AI APIs |
| 10 | [DevOps and platforms](roadmaps/10-devops.md) | Terraform, managed infrastructure, CI/CD, federation, testing, supply chain and developer tools |
| 11 | [Observability and SRE](roadmaps/11-observability-sre.md) | Logs, metrics, traces, SLOs, recovery, incidents and costs |
| 12 | [Enterprise architecture](roadmaps/12-enterprise.md) | Migration, hybrid environments, identity, governance, design reviews and industry patterns |
| 13 | [Application integration](roadmaps/13-integration.md) | Workflows, events, queues, schedulers, API management, Firebase and connectors |
| 14 | [Capstone projects](roadmaps/14-capstones.md) | Integrated application, platform, data and AI projects with acceptance tests |

## Supporting references

- [Coverage map](COVERAGE.md): every tutorial and its owning roadmap.
- [Service selection guide](SERVICE-SELECTION.md): compare overlapping products and find their tutorials.
- [Glossary](GLOSSARY.md): vocabulary used throughout the course.
- [Source and maintenance policy](SOURCES.md): authoritative documentation and how to keep this library current.
- [Lab setup and cleanup](LAB-SETUP.md): shared variables, access requirements, billing controls and teardown.

## How detailed is this library?

Every curriculum topic has a dedicated tutorial. Related features and specialized products are taught inside their relevant topic; the coverage map makes that grouping explicit. Tutorials include guided commands where a small reproducible lab is appropriate, and clearly identified design exercises for organization-only, hardware-dependent, or expensive enterprise environments. A design exercise produces an architecture, access plan, failure analysis, and acceptance criteria rather than pretending a deployment happened.

Google Cloud contains a changing catalog of services and configuration options. This is a broad, detailed learning curriculum, **not a claim that every API method, SKU, release note, or product feature has been reproduced**. For that level of reference detail, use the linked official product documentation. The material does not silently treat an overview as an executed production deployment.

## Lab conventions

- Nothing in this repository has provisioned a Google Cloud resource. You choose when to run a tutorial.
- Cloud resources can cost money even when idle. Budgets alert; they do not automatically cap charges.
- Use a dedicated learning project and synthetic data. Organization changes belong in an authorized sandbox organization.
- Replace named placeholders before executing commands. Never paste an entire tutorial into a terminal at once.
- Read commands before running them, verify output after each stage, and finish the cleanup section.
- Do not commit passwords, private keys, access tokens, production data, or Terraform state.

The primary discovery reference is the [Google Cloud documentation catalog](https://docs.cloud.google.com/docs); each tutorial includes more specific sources.
