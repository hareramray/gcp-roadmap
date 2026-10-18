# Governance, risk, procurement, and the cloud operating model

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Design an application onboarding process that gives teams autonomy with clear guardrails and accountability. Use Cloud Shell Bash with the shared `PROJECT_ID`, `REGION`, and `ZONE` for a local policy packet. No organization, subscription, Marketplace offer, quota request, or support plan is changed. Optional metadata reads require Resource Manager Viewer and the Resource Manager API. Real organization setup requires domain ownership, billing ownership, identity administration, and designated emergency contacts; Marketplace procurement and support administration have separate permissions.

## Governance is an operating system for decisions

Define who owns platform services, application reliability, security controls, billing allocation, data stewardship, and vendor relationships. A central platform team can offer approved project templates and deployment paths while application teams own their software and on-call outcomes. Record responsibility for patching, access reviews, incident response, backup restores, decommissioning, and risk exceptions. A committee without explicit decision rights becomes a bottleneck.

Use organizations, folders, and projects to express control boundaries. Project creation should assign an owner, purpose, billing link, environment, data classification, approved locations, quotas, logging, and expiry or review date. An exception process needs evidence, a compensating control, expiry, and a person authorized to accept the residual risk. [Resource Manager overview](https://docs.cloud.google.com/resource-manager/docs/resource-manager-overview).

Labels are resource metadata useful for inventory and cost attribution; they do not automatically inherit. Resource Manager tags are separately managed key/value resources and bindings that can inherit and participate in supported IAM or organization-policy conditions. Network tags used by VPC firewall rules are a different mechanism. Permission to attach a security-relevant tag can change policy outcomes, so it is not just harmless metadata administration. [Tags overview](https://docs.cloud.google.com/resource-manager/docs/tags/tags-overview).

## Procurement, catalogs, quotas, and support

Google Cloud Marketplace can simplify procurement for eligible third-party solutions, but purchasing does not establish security approval, data-processing suitability, support quality, or an exit plan. Review seller terms, deployment permissions, data paths, billing meters, renewal conditions, cancellation, and export options. Do not assume a private offer has the same terms as a public listing. [Marketplace documentation](https://docs.cloud.google.com/marketplace/docs).

An internal service catalog makes approved solutions discoverable. The Service Catalog product has documented distribution workflows, but older pages mention Deployment Manager templates. As reviewed on 18 October 2026, Deployment Manager is deprecated and new customers are blocked; use current Terraform/Infrastructure Manager-compatible delivery where appropriate and verify the supported catalog integration. [Service Catalog overview](https://docs.cloud.google.com/service-catalog/docs/overview), [Deployment Manager status](https://docs.cloud.google.com/deployment-manager/docs/deprecations).

Quotas protect resource dimensions and API rates; they are distinct from capacity reservations, billing budgets, and contractual commitments. Request increases before a migration or sales event, with region, metric, projected demand, and timeline. Support arrangements define case access and response objectives, not automatic application recovery. Keep essential contacts, escalation paths, and provider-access approvals current.

## Lab: build an onboarding packet

1. Create a local request template:

   ```bash
   cat > onboarding-request.yaml <<'EOF'
   application: orders-training
   environment: development
   owner: platform-training
   cost_center: training
   data_classification: synthetic
   recovery_owner: application-team
   review_interval_days: 90
   EOF
   ```

2. Add proposed project and folder, allowed regions, identity groups, workload identities, network requirements, budget notifications, logging retention, and backup expectations. Make every required field lead to an actionable control; do not collect metadata nobody uses.

3. Define three catalog offers: a managed application service, a data-analysis project, and a private VM workload. Each must include supported versions, input limits, security defaults, expected cost drivers, ownership, upgrade policy, and teardown steps. A template is maintained software, so assign tests and release ownership.

4. Design a risk exception for a vendor that requires a static credential. Record alternative options considered, restricted scope, storage and rotation, monitoring, expiry, and a federation migration milestone. An exception must not silently become a permanent organizational default.

5. Simulate a procurement review for a logging SaaS. Trace which logs leave the organization, where they are stored, who can access them, how credentials are obtained, what happens when the contract ends, and how retained evidence is exported or deleted.

6. Construct a responsibility table for quota exhaustion during a launch. Include application demand forecasting, platform quota requests, finance budget review, security boundary validation, incident command, and vendor escalation. Define one accountable owner per decision.

## Verification, cleanup, costs, and exercises

Acceptance requires that an application team can determine the approved path, expected lead time, responsible owner, exception route, and retirement process. Common failures include ownerless projects, labels mistaken for security policy, stale catalog modules, quotas mistaken for caps, and paid subscriptions left active after resources are deleted.

Remove local synthetic files when finished. No purchase or administrative change occurred. Extend the operating model to a merger with two billing accounts and conflicting naming standards. Propose a staged convergence that preserves existing access, contractual commitments, and incident response while improving inventory quality.

