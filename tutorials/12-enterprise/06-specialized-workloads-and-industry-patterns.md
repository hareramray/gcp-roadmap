# Specialized workloads and industry architecture patterns

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Scope, outcome, and prerequisites

This is an **orientation and architecture-design tutorial**, not a full deployment manual for every industry product. Each area requires specialist implementation guides, supported-version matrices, licensing, commercial eligibility, and workload-specific validation. You will produce a concrete readiness review for one scenario and explain how its constraints affect the architecture. Use Cloud Shell Bash and the shared `PROJECT_ID`, `REGION`, and `ZONE` only for planning. No paid infrastructure, patient dataset, commercial database, or licensed ERP is deployed. Product references were reviewed on 18 October 2026; recheck availability before procurement.

## Enterprise and regulated workloads

**SAP:** begin with SAP-certified machine and storage configurations, supported operating systems, HANA memory sizing, application/database topology, high availability, backups, and SAP/Google support boundaries. Treat RISE with SAP and customer-managed SAP as different responsibility models. A generic VM sizing recommendation is not certification for an SAP system. [SAP on Google Cloud](https://docs.cloud.google.com/sap/docs/overview-of-sap-on-google-cloud).

**Oracle:** compare supported Oracle Database@Google Cloud offerings, existing Oracle deployment models, and application modernization. Licensing, database edition, networking, recovery, support, and region availability require explicit review. Do not assume that moving a database changes its license obligations. [Oracle Database@Google Cloud](https://docs.cloud.google.com/oracle/database/docs/overview).

**Bare metal:** distinguish Bare Metal Solution regional extensions from Compute Engine bare metal instance offerings. Bare Metal Solution provides specialized infrastructure connected to Google Cloud, while customer responsibilities include relevant operating system, application, and database operations. Current guidance points many Oracle scenarios toward Oracle Database@Google Cloud; product selection should follow the actual compatibility requirement. [Bare Metal Solution](https://docs.cloud.google.com/bare-metal/docs/bms-overview), [Oracle offering comparison](https://docs.cloud.google.com/bare-metal/docs/explore-oracle-partnership-offerings).

**Sovereign and regulated workloads:** define residency, operator access, jurisdiction, key control, evidence, and support-personnel requirements separately. Assured Workloads control packages and appropriate Distributed Cloud options can support particular boundaries, but supported products and responsibilities vary. A country-specific region does not alone establish a complete sovereignty or regulatory claim. [Assured Workloads](https://docs.cloud.google.com/assured-workloads/docs/overview).

## Industry patterns

**Healthcare:** Cloud Healthcare API supports FHIR, HL7v2, and DICOM workflows. Plan patient matching, message quality, consent or approved access policy, de-identification, audit, and downstream analytics. Technical support for a medical format is not a clinical validation. Contracts and covered-service configuration matter before using real protected information. [Healthcare API](https://docs.cloud.google.com/healthcare-api/docs/introduction).

**Retail:** separate catalog browsing, inventory, checkout, payment, fulfillment, and analytics. Cache read-heavy catalog data while defining inventory freshness and reservation semantics. Use idempotency for order creation and payment retries. Keep card data boundaries narrow and isolate third-party payment integrations. Test demand spikes with stock contention rather than only a static homepage benchmark.

**Gaming:** distinguish account services, matchmaking, stateful session servers, leaderboards, and analytics. Session placement depends on latency, regional capacity, game state, and player continuity. GKE with an appropriate current Agones-based architecture is a possible path; the legacy managed Game Servers product should not be treated as a default new deployment. Validate the current supported stack and operating responsibilities. [Google Cloud service status](https://status.cloud.google.com/summary), [Agones documentation](https://agones.dev/site/docs/).

**Media:** ingestion, transcoding, packaging, storage, content protection, and distribution are separate stages. Live Stream API converts supported live inputs into streaming output formats; content distribution and user authorization need additional design. Plan backup inputs, rendition ladders, rights restrictions, egress, and end-to-end glass-to-glass latency. [Live Stream API](https://docs.cloud.google.com/livestream/docs/overview).

**Edge and industrial workloads:** define behavior when connectivity disappears. Local inference or transaction processing needs cached models/configuration, local authentication, buffering, conflict resolution, and safe updates. Google Distributed Cloud offerings have different hardware and connectivity models; choose after measuring local constraints rather than assuming cloud services simply run unchanged at every site.

**Sustainable workloads:** measure useful output per resource unit, eliminate idle capacity, reduce unnecessary transfers, and schedule flexible jobs appropriately. Compare carbon measures using consistent scopes and methodology. Estimated emissions can guide improvements but should not override safety, reliability, or data requirements. [Carbon Footprint methodology](https://docs.cloud.google.com/carbon-footprint/docs/methodology).

## Lab: a regional hospital's imaging handoff

1. Create a local readiness document with the scenario: imaging arrives from three hospitals, identifiers remain restricted, researchers receive an approved de-identified copy, and the source hospitals must continue operating during a cloud outage. Use invented records only.

2. Draw the ingestion path, protected imaging store, identity boundary, de-identification step, research store, audit destination, backup, and recovery site. Mark the data classification and location on every arrow, including logs and temporary files.

3. Specify prerequisites: approved agreements, supported DICOM transfer behavior, service APIs, least-privilege runtime identities, key/secret access, network capacity, retention requirements, and a named clinical-data owner. Mark unknown contractual or regulatory questions for the responsible specialist.

4. Work an outage example: the cloud connection fails for six hours. At 20 GB per hour, each affected ingestion path needs at least 120 GB of usable buffering before safety margin, metadata, and replication overhead. Define overflow behavior and how resumed transfer avoids duplicate or missing studies. Do not claim a storage estimate proves clinical safety.

5. Define acceptance tests: only approved readers access identifiable images; the research transformation passes planted identifier tests; audit records connect actions to identities; replay is idempotent; and a timed restore meets the agreed RPO/RTO. Add performance evidence from realistic image sizes.

6. Compare the same template with a retail store or gaming session site. Replace clinical constraints with inventory consistency or session continuity, preserving the discipline of measuring offline behavior and ownership.

## Cleanup, costs, and extension

No cloud resources or real industry data were used. Keep the sanitized readiness review as a portfolio artifact. Real specialized environments can involve minimum capacity, licensing, long retention, dedicated hardware, network transfer, and support commitments. Before implementation, build a line-item estimate and vendor-supported cleanup/exit plan. Extend one industry into a full specialist learning track using its official deployment, security, backup, migration, and troubleshooting guides; this overview establishes the questions that track must answer.

