# Resource hierarchy, labels, tags, and selecting a service

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Design a sensible resource hierarchy and justify a service choice from requirements. You need only a text editor; optional read-only commands require access to a project. Organization and folder administration are not required for the design exercise. Later security and enterprise tutorials implement more advanced policy controls.

## Separate structure from architecture

The organization/folder/project hierarchy establishes ownership and inherited controls. Resources belong under projects or other supported parents. An organization represents a managed enterprise boundary, folders group related projects, and projects group resources and API usage. A project's billing association is a related financial relationship, not an additional parent in this resource hierarchy.

Design folders around stable policy and administrative boundaries: environment, business unit, geography, or a combination. There is no universal perfect hierarchy. Too few projects can mix unrelated trust boundaries; too many without automation creates management overhead. Production and development often warrant separate projects because permissions, quotas, and blast radius differ.

Labels are resource metadata useful for filtering and cost allocation where supported. Resource Manager tags are managed key/value resources that can participate in supported policy conditions and inheritance. Compute network tags are another mechanism used by certain network features; they are not interchangeable with Resource Manager tags. Tags and labels do not themselves encrypt data or grant access.

Service selection starts with workload requirements: traffic shape, protocol, latency, state, transaction semantics, portability, operational skills, network reachability, compliance, region, recovery objectives, and cost model. A familiar product is not always the lowest-complexity solution. A managed service reduces some operations while introducing service-specific constraints and dependencies.

## Guided design exercise: a small retailer

Assume one platform team and two application teams operating a customer website and analytics pipeline. Production handles personal data; development uses synthetic records. Write the following artifacts:

1. Draw an organization with `platform`, `nonproduction`, and `production` folders. Under platform, include a networking project and a centralized logging project. Put separate app and analytics projects under each environment. These names are illustrative, not mandatory architecture.
2. Assign an accountable owner, cost center, environment, data class, and deletion process to each project. Decide which values are labels and which require policy-aware tags.
3. Explain inherited read permissions versus privileged deployment permissions. A broad grant at the organization can expose every descendant; a narrower project role does not automatically cancel that inherited grant.
4. Describe where a Shared VPC host project might live, which teams administer networking, and how service projects consume approved subnets. Do not assume this must be implemented for a small personal lab.
5. Make three service decisions with alternatives:

| Requirement | Initial candidate | Reason to reconsider |
| --- | --- | --- |
| Stateless HTTPS API with variable demand | Cloud Run | Unsupported runtime/network constraints or special persistent host requirements |
| Existing PostgreSQL application | Cloud SQL or AlloyDB | Scale, availability, compatibility and price requirements differ |
| Large historical SQL analysis | BigQuery | Very low-latency transaction processing is a different workload |

6. Add an architecture decision record: context, decision, alternatives, consequences, review trigger. For example, revisit the database decision when measured write throughput or recovery requirements exceed the tested design.

## Optional project inspection

```bash
gcloud projects describe "$PROJECT_ID" \
  --format='yaml(projectId,projectNumber,parent,labels)'
gcloud projects get-iam-policy "$PROJECT_ID" --format=json
```

Project IAM output alone is not a complete view of effective access; inherited policy and other controls must also be considered. The commands may expose organizational identities, so do not publish raw output. Personal projects may have no parent organization; that is a legitimate lab configuration.

## Verification and troubleshooting

Check that every project has an owner, budget contact, purpose, and lifecycle. Trace one inherited permission from parent to resource. Check whether deleting a development project would break production through a shared artifact, DNS record, key, or network dependency. If it would, document and redesign that coupling.

If labels do not appear in a billing report, verify service support, label timing, and export/report behavior rather than assuming every resource contributes the same metadata. If a tag condition appears ineffective, verify the tag binding, inheritance, and policy support on the specific resource.

## Cleanup and completion evidence

The design exercise creates nothing. Do not create an organization, alter shared IAM, or move projects merely to mirror the sample. Produce one hierarchy diagram, a responsibility table, and three decision records. Continue with IAM, networking, and the service-specific tutorials; revisit your choices after learning their practical limits.

## References

- [Resource hierarchy](https://docs.cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy)
- [Creating and managing labels](https://docs.cloud.google.com/resource-manager/docs/creating-managing-labels)
- [Tags overview](https://docs.cloud.google.com/resource-manager/docs/tags/tags-overview)
- [Enterprise foundations blueprint](https://docs.cloud.google.com/architecture/blueprints/security-foundations)
- [Architecture Framework](https://docs.cloud.google.com/architecture/framework)
