# Roadmap 12 — Enterprise architecture, migration, and specialization

[Curriculum home](../README.md) · [Lab setup](../LAB-SETUP.md)

This track combines technical design with the organizational work needed to operate cloud services at scale. It covers migration, hybrid environments, enterprise identity, governance, architecture review, and industry patterns. These are concrete design labs because a personal training project cannot reproduce a commercial VMware private cloud, licensed ERP system, regulated organization, or distributed hardware deployment.

## Preparation and sequence

Finish the core infrastructure, security, application, data, and SRE tracks first. Be comfortable explaining IAM boundaries, network paths, database consistency, recovery objectives, and billing drivers. Suggested effort is 15–25 hours for the portfolio exercises; production specialization requires deeper product guides, hands-on access, and domain experts. Use the common Cloud Shell variables only for planning and optional authorized inspections.

| Order | Tutorial and complete topic scope | Evidence of learning |
|---|---|---|
| 1 | [Migration assessment and execution](../tutorials/12-enterprise/01-migration-assessment-and-execution.md): inventory, dependencies, strategy selection, Migration Center, Migrate to VMs, Migrate to Containers, Database Migration Service, waves, cutover, rollback, decommissioning | Deliver an orders-system migration plan with a clear post-write rollback boundary. |
| 2 | [Hybrid and multicloud](../tutorials/12-enterprise/02-hybrid-multicloud-and-distributed-cloud.md): GKE Enterprise, fleets, attached clusters, Distributed Cloud variants, VMware Engine, connectivity, offline operation, shared responsibility | Choose platforms for store, ERP, and public API workloads with a failure matrix. |
| 3 | [Enterprise identity and productivity](../tutorials/12-enterprise/03-enterprise-identity-and-productivity.md): Cloud Identity, workforce federation, Managed Microsoft AD, Google Workspace, SaaS authorization boundaries, lifecycle, emergency access | Demonstrate joiner/mover/leaver controls across cloud, Windows, and productivity systems. |
| 4 | [Governance and operating model](../tutorials/12-enterprise/04-governance-risk-and-operating-model.md): organization setup, ownership, tags/labels, quotas, risk exceptions, Marketplace procurement, service catalogs, support, retirement | Produce an onboarding packet and a vendor/exception review. |
| 5 | [Architecture framework](../tutorials/12-enterprise/05-architecture-framework-and-design-reviews.md): six Well-Architected pillars, requirements, alternatives, ADRs, tradeoffs, evidence, design reviews | Map every critical requirement to an architecture decision and verification test. |
| 6 | [Specialized workloads](../tutorials/12-enterprise/06-specialized-workloads-and-industry-patterns.md): SAP, Oracle, bare metal, sovereignty, regulated systems, healthcare, retail, gaming, media, edge, sustainability | Complete an industry readiness review with supported-product and responsibility checks. |

## Integrated completion project

Prepare an enterprise proposal for a fictional retailer with regional stores, a VMware-hosted ERP, a public orders API, and an analytics team. Include a dependency inventory, phased migration, hybrid/offline plan, identity lifecycle, onboarding catalog, procurement checklist, operating responsibilities, architecture decisions, recovery objectives, and unit-cost estimate. Choose one specialist workload for deeper investigation and state precisely where the overview stops and specialist deployment guidance begins.

Accept the proposal only when application owners can validate the dependencies, operations can execute the runbooks, security can test access boundaries, finance can explain costs, and business owners understand the downtime and recovery tradeoffs. A product logo diagram alone is insufficient evidence.

Check commercial eligibility, region availability, supported versions, current deprecations, contractual terms, and licensing before any implementation. The tutorials call out known lifecycle changes and link to official documentation, while deliberately avoiding a claim that one repository can replace every product manual or every industry's professional requirements.

