# IAM roles, policies, and effective access

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

You will explain an authorization decision, inspect a project policy, and design a narrow grant without granting yourself broad administration. Use Bash in Google Cloud Shell with `PROJECT_ID`, `REGION`, and `ZONE` from the setup guide. This lab reads existing configuration; it creates no cloud resources. You need `resourcemanager.projects.getIamPolicy` on the lab project. IAM role descriptions require permission to view the corresponding role; organization-level investigation additionally requires access to ancestor policies. Ask the project administrator for read access if necessary.

## Understand the model

A principal is an authenticated person or workload. A permission authorizes an operation such as `storage.objects.get`. A role bundles permissions. An allow-policy binding associates a role with principals on a resource, optionally with a condition. Prefer groups for human access and a separate runtime identity per application. Basic Owner, Editor, and Viewer roles are usually too broad for production job functions; predefined roles are a useful starting point, while custom roles add maintenance obligations. [IAM overview](https://docs.cloud.google.com/iam/docs/overview).

Access inherited from an organization or folder is not removed by deleting a project-level grant. Effective access also depends on deny policies, principal access boundaries where applicable, and service-specific controls. A valid IAM grant does not bypass VPC Service Controls, organization policy, application authorization, or network restrictions. A deny policy takes precedence over a conflicting allow grant for supported permissions. [Deny policies](https://docs.cloud.google.com/iam/docs/deny-overview).

Conditions use Common Expression Language to constrain supported attributes, for example request time or resource tags. An expiring binding is useful for a short engagement, but expiry is not a substitute for removing obsolete membership. Do not assume every service supplies every attribute. Conditional allow policies use policy version 3; preserve the version and etag when editing a full policy to avoid lost updates. [IAM Conditions](https://docs.cloud.google.com/iam/docs/conditions-overview).

## Lab: build an access explanation

1. Confirm the active account and project before inspecting anything:

   ```bash
   gcloud auth list --filter=status:ACTIVE --format='value(account)'
   gcloud projects describe "$PROJECT_ID" --format='yaml(projectId,parent)'
   gcloud projects get-iam-policy "$PROJECT_ID" --format=json > iam-before.json
   ```

2. Produce a compact inventory locally. This shows bindings attached to this project, **not** all inherited access:

   ```bash
   jq -r '.bindings[] | [.role, (.members | join(",")),
     (.condition.expression // "unconditional")] | @tsv' iam-before.json
   gcloud iam roles describe roles/storage.objectViewer --format=yaml
   ```

3. Create an access matrix for an imaginary orders application. Give `orders-runtime` object-read access on its input bucket, an operator log-view access on the application project, and a deployer deployment permissions plus carefully scoped service-account attachment permission. Record a separate resource scope for every row. Do not grant a runtime identity permission to modify its own IAM policy.

4. Work through three requests: reading an input object, deleting that object, and changing the bucket policy. Match each request to its permission and then to the proposed role. Object Viewer should support the read, not the delete or policy change. A project-wide Object Viewer grant would cover more buckets than a bucket-scoped grant.

5. In IAM Policy Troubleshooter, enter an authorized test principal, the full resource name, and the permission being investigated. Inspect both the granting binding and any deny explanation. If you cannot access ancestor information, record the result as incomplete instead of declaring the principal harmless. IAM changes and group membership can take time to propagate.

6. Write `iam-review.md` locally with the principal, action, resource, applicable hierarchy, condition, expected decision, and evidence. Include a proposed expiry and owner for privileged access. Privileged Access Manager can provide an entitlement/request workflow where temporary elevation is required; compare that workflow with permanent administrator membership.

## Verification and troubleshooting

Success means another learner can reproduce your three authorization decisions from the matrix. A `403` may mean the inspecting account lacks policy-read permission, the API is unavailable, or a service boundary blocks the call. It does not prove the target has no access. An empty project policy also does not prove the project is inaccessible because grants can be inherited. Never “fix” uncertainty by granting Owner.

## Cleanup, cost, and extensions

No cloud mutation occurred. Delete local policy exports when finished because they reveal identity information. IAM itself is not a replacement for a spending control; permissions can enable billable resources elsewhere. Extend the matrix with a contractor group and an emergency administrator. Explain how you would test expiry, audit approval, review custom-role permissions after a service update, and prevent tag administration from accidentally enabling access.

