# Sources, current names, and maintenance guidance

[Home](README.md) · [Coverage map](COVERAGE.md)

## How this library was prepared

Prepared on **18 October 2026** using current official Google Cloud documentation and primary documentation for foundational tools such as Python, Git, Kubernetes, Terraform, Apache Beam/Airflow/Spark, and OpenTelemetry. The tutorials are original teaching material with original exercises. Each tutorial links its relevant product references; those references are the authority for current syntax, limits, pricing, availability, and product behavior.

The authoring process checked navigation/coverage and local syntax where tooling allowed. It did **not** authenticate to your Google Cloud account, deploy resources, execute paid labs, or validate every command against a live organization. Organization policies, IAM, APIs, capacity, editions, and locations can require adjustments. The distinction between local labs, optional managed deployments, and design exercises is stated in the tutorials.

## Primary entry points

| Purpose | Official source |
| --- | --- |
| Full documentation catalog | [Google Cloud docs](https://docs.cloud.google.com/docs) |
| Product discovery | [Products at a glance](https://docs.cloud.google.com/docs/product-list) |
| Architecture guidance | [Architecture Center](https://docs.cloud.google.com/architecture) and [Well-Architected Framework](https://docs.cloud.google.com/architecture/framework) |
| Product changes | [Release notes](https://docs.cloud.google.com/release-notes) |
| Command reference | [gcloud reference](https://docs.cloud.google.com/sdk/gcloud/reference) |
| Authentication | [Authentication documentation](https://docs.cloud.google.com/docs/authentication) |
| Pricing assumptions | [Pricing](https://cloud.google.com/pricing) and [calculator](https://cloud.google.com/products/calculator) |
| Locations | [Cloud locations](https://cloud.google.com/about/locations) plus each service's location guide |
| Quotas | [Cloud Quotas](https://docs.cloud.google.com/docs/quotas/overview) plus service-specific limits |
| Certification objectives | [Certification catalog](https://cloud.google.com/learn/certification) |
| Operational status | [Google Cloud Service Health](https://status.cloud.google.com/) |
| Foundational reliability | [Google SRE books](https://sre.google/books/) |

## Names and lifecycle need particular attention

Familiar filenames are intentionally stable so bookmarks and learning paths remain useful. The tutorials explain current names where official documentation has moved. For example, the AI, catalog, Spark/Airflow, BI, cache, and security-posture tutorials include naming or lifecycle notes discovered during research. Follow their dated official sources and do not assume a changed marketing name means every API, role, SDK parameter, Terraform resource, or endpoint changed at the same time.

Likewise, an old tutorial can remain searchable after a product stops accepting new customers or moves to a different support state. Never adopt a legacy offering solely because an old example still loads. The DevOps material favors current infrastructure-as-code paths and discusses legacy tooling only with its migration implications.

## Before executing a lab

1. Read the tutorial's current official setup guide and pricing page.
2. Check CLI/SDK/provider versions and read `--help` for any unfamiliar flag.
3. Confirm supported region, edition, API, identity, quotas, and organization policy.
4. Replace placeholders, review requested permissions, and estimate the entire resource graph's cost.
5. Run a small bounded test and record actual behavior. A command syntax check cannot prove live permissions or service availability.
6. Update your notes if the current behavior differs, with the date and official source supporting the change.

## Keeping the curriculum complete

Every topic promoted into a domain roadmap must have a real tutorial file with learning outcomes, prerequisites, teaching, a practical or design exercise, verification, troubleshooting, cleanup/cost considerations, and sources. Specialized subtopics can live within a broader tutorial, but their depth should be clear. The coverage map inventories the named curriculum; it is not a claim to mirror every API option in the entire Google Cloud catalog.

When adding or renaming a tutorial, update the owning roadmap, coverage map, checklist, cross-links, and service-selection guide as relevant. Re-run the local documentation checker described in [the tooling readme](tools/README.md). Recheck fast-moving areas before major use, especially AI models/SDKs, product lifecycle, Kubernetes versions, CI identity defaults, pricing, and certifications. This document defines a maintenance process; it does not schedule any automated future work.
