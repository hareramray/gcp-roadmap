# Well-Architected Framework and design reviews

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Create an architecture decision record and review a service against measurable requirements. This is a local design exercise; use Cloud Shell Bash and reference `PROJECT_ID`, `REGION`, and `ZONE` from the setup guide in diagrams and resource plans. No API, deployment, or paid product is required. Bring basic knowledge of identity, networking, compute, storage, databases, observability, and recovery. A review is strongest when application, platform, security, operations, finance, and business owners can challenge assumptions together.

## Use all six pillars

Google Cloud's Well-Architected Framework organizes guidance into operational excellence; security, privacy, and compliance; reliability; cost optimization; performance optimization; and sustainability. Cross-pillar perspectives add domain-specific concerns. The framework is a structured way to ask questions and evaluate tradeoffs, not a certification that a diagram is automatically production-ready. [Well-Architected Framework](https://docs.cloud.google.com/architecture/framework).

Translate each pillar into evidence. Operational excellence needs deployment, rollback, ownership, observability, and incident procedures. Security needs identity and trust boundaries, least privilege, data lifecycle, and verification. Reliability needs SLOs, failure isolation, capacity, backups, and measured restores. Cost needs unit economics and accountable spend. Performance needs realistic load and latency objectives. Sustainability needs measured resource efficiency and appropriate emissions reporting, within functional and residency constraints.

Start with requirements: users, business transactions, peak volume, latency, availability, RPO/RTO, data classification, residency, staffing, budget, and expected growth. Label an assumption as an assumption. A product choice made before these inputs often optimizes the wrong thing. Define what would make the choice change; this prevents an architecture decision record from becoming an unchallengeable permanent rule.

## Lab: review an order-processing service

1. Use a worked scenario: 100 requests per second normally, 1,000 at a seasonal peak, 99.9% successful checkout SLO, p95 below 500 ms, RPO 15 minutes, RTO two hours, and a small operations team. These are invented requirements for comparison, not service guarantees.

2. Create an architecture decision record locally:

   ```bash
   cat > adr-001.md <<'EOF'
   # ADR 001: Hosting the orders API
   Status: proposed
   Context: seasonal traffic and a small operations team
   Options: managed serverless service; managed Kubernetes; VM instance group
   Decision: evaluate managed serverless first
   Evidence required: load test, dependency capacity, rollback and restore drill
   Revisit when: runtime constraints or sustained economics invalidate the choice
   EOF
   ```

3. Compare options using the same criteria: runtime compatibility, operational staffing, scaling behavior, networking, identity, deployment safety, observability, cost at baseline and peak, and portability requirements. Give evidence or “unknown” for each cell. An unsupported numeric score creates false precision; record why a criterion matters.

4. Trace a checkout request from DNS and ingress through identity, application, database, and external payment provider. Mark synchronous dependencies, timeouts, retry policies, idempotency keys, and failure responses. Identify where a retry could duplicate a charge or order and require a business-level safeguard.

5. Review failure cases: one application instance stops, a zone fails, the database throttles, an identity grant is removed, a new release corrupts output, and the primary region is unavailable. For each, document detection, user impact, mitigation, recovery dependency, and test evidence. A multi-zone diagram does not prove successful regional recovery. [DR planning](https://docs.cloud.google.com/architecture/dr-scenarios-planning-guide).

6. Estimate cost and sustainability together. Remove idle work, rightsize capacity, reduce unnecessary data movement, and measure actual usage. A lower-carbon region is only a candidate if latency, data rules, supported services, and recovery requirements remain satisfied. Carbon Footprint reports are estimates with defined coverage and methodology, not exact per-request physical measurements. [Carbon methodology](https://docs.cloud.google.com/carbon-footprint/docs/methodology).

7. Run a review meeting with three outcomes per concern: accepted with evidence, action required with owner/date, or explicitly accepted risk with expiry. End with a decision and verification plan, not an endless list of hypothetical concerns. Store the diagram, ADR, requirements, and runbooks together with a maintenance owner.

## Verification and failure modes

Acceptance requires traceability from every critical requirement to a design element and a test. The p95 target needs representative load; the RTO target needs a timed drill; least privilege needs positive and negative access tests. Product SLAs and marketing examples are inputs, not proof that your assembled system meets its objectives.

Common failures include ignoring data-plane dependencies, undocumented single points of failure, overcomplicated designs a small team cannot operate, unbounded retries, missing rollback compatibility, and optimizing only infrastructure price while ignoring staffing.

## Cleanup, costs, and exercises

The exercise creates only a local ADR. Keep it as a portfolio artifact or remove it after review. Any later load test, failover drill, or redundant deployment requires a separate cost estimate and cleanup plan. Extend the scenario with a strict country boundary and then with a tenfold traffic increase. Explain which decisions remain valid, which must change, and what new evidence is required before implementation.

