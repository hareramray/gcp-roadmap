# Accounts, projects, billing, APIs, locations, and quotas

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Prepare a learning project without confusing project access, payment permissions, service activation, or capacity limits. You need an account authorized to inspect the project. Creating projects, linking billing, setting budgets, and enabling APIs require additional roles; complete only the steps permitted in your environment. Read the shared lab setup first.

## Understand the boundaries

A project is a major unit for API usage, quotas, billing attribution, and resource organization. Its display name can differ from its globally unique project ID and numeric project number. Many service identities include the project number. A billing account pays for linked projects and has its own access policies. Being a project administrator does not automatically make you a billing administrator.

An organization provides the top-level hierarchy for managed enterprise resources. Personal projects may have no organization. Folder and organization permissions inherit downward where supported. If an organization policy prohibits a region or public IP, a tutorial's project-level administrator cannot necessarily bypass it.

Service Usage controls which APIs are enabled. Enabling an API permits its use subject to permissions, billing, organization constraints, and quotas; it does not grant data access. A service agent may be created for the enabled service. Do not remove service-agent permissions without understanding the product's dependency on them.

Quotas restrict rates or allocated resources within a scope. A request quota might limit calls per minute, while an allocation quota limits CPUs or IP addresses. A higher quota is not a capacity reservation and does not guarantee hardware availability. Some limits can be raised through a request; fixed system limits cannot. Quotas are not a comprehensive cost cap.

Location selection affects latency, available products and editions, resilience, data transfer, and residency requirements. Distinguish a zone, region, multi-region, and global resource. Placing related services in different regions can create latency and transfer costs, but placing everything in one zone increases a shared failure domain.

## Guided setup and inspection

1. In the console project selector, identify your lab project. Record ID and number without storing payment details. If you must create one, choose a unique ID, approved parent, and descriptive name.
2. Open Billing and confirm the intended account is linked. If access is denied, identify whether you lack billing-account visibility, project billing assignment rights, or both.
3. Create a project-scoped budget with meaningful thresholds and recipient notifications. Record its amount and currency. Remember that notifications do not stop resources.
4. In Cloud Shell, set the variables from the shared setup and inspect:

```bash
gcloud projects describe "$PROJECT_ID" \
  --format='yaml(projectId,projectNumber,name,parent,lifecycleState)'
gcloud billing projects describe "$PROJECT_ID"
gcloud services list --enabled --project="$PROJECT_ID" \
  --format='table(config.name)'
```

5. If permitted and needed for later infrastructure labs, enable Compute Engine:

```bash
gcloud services enable compute.googleapis.com --project="$PROJECT_ID"
gcloud compute regions describe "$REGION" --project="$PROJECT_ID" \
  --format='yaml(name,quotas)'
```

6. Open Quotas & System Limits in the console. Filter to a service and region, distinguish current usage from the limit, and record one rate quota and one allocation quota. Do not request increases merely to complete the exercise.
7. Use the pricing calculator to estimate a small VM, boot disk, public IP if applicable, and data transfer. Save your assumptions rather than a supposedly permanent price.

## Verification and troubleshooting

The project should be active; the linked billing account should be the intended one; the enabled-service list should contain any API you deliberately enabled. A quota-related error should include a metric and scope. If VM creation later fails despite apparent CPU quota, check machine-family quota, region, reservations, organization restrictions, and stock availability separately.

A budget with no verified recipient is not an operational control. An enabled billing account with no project linkage cannot pay for that project's services. If billing details are unavailable, use the design exercise and do not attempt to work around account restrictions.

## Cleanup and completion evidence

This inspection need not create chargeable resources. Keep useful budgets. Remove only test budgets or project settings you created and no longer need. Do not disable shared billing or delete a shared project. Record a lab inventory containing project, location, API dependencies, budget contacts, two quotas, and estimated cost drivers. Explain why none of a budget, quota increase, or API enablement guarantees a successful deployment.

## References

- [Create and manage projects](https://docs.cloud.google.com/resource-manager/docs/creating-managing-projects)
- [Cloud Billing concepts](https://docs.cloud.google.com/billing/docs/concepts)
- [Service Usage overview](https://docs.cloud.google.com/service-usage/docs/overview)
- [Cloud Quotas overview](https://docs.cloud.google.com/docs/quotas/overview)
- [Budgets and alerts](https://docs.cloud.google.com/billing/docs/how-to/budgets)
