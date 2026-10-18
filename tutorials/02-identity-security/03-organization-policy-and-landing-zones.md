# Organization policy and landing zones

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Produce a landing-zone design and safely inspect a project's effective guardrails. Use Bash in Cloud Shell with the common `PROJECT_ID`, `REGION`, and `ZONE`. A personal project may not belong to an organization; complete the design exercise even if organization queries are unavailable. Reading organization policy requires appropriate Organization Policy Viewer permissions and the Organization Policy API. Listing ancestors needs Resource Manager visibility. No policies are changed and no landing zone is deployed.

## What a landing zone actually contains

A landing zone is an operational foundation: identity, resource hierarchy, networking, security controls, billing allocation, logging, deployment automation, and recovery responsibilities. Folders group projects for policy and administration; projects isolate workload configuration, APIs, quotas, and many billing records. Choose folder boundaries that match stable control needs, not every temporary reporting line. Separate production from nonproduction and distinguish central security, networking, and shared delivery services from application projects. [Landing-zone design](https://docs.cloud.google.com/architecture/landing-zones).

IAM controls who can perform an operation. Organization policy constrains permitted resource configurations. A user can hold a create permission yet be blocked from creating a disallowed resource. Constraints can be managed or custom, and policy behavior varies by constraint type. Inheritance and overrides must be understood individually; a child does not automatically erase every ancestor restriction. Some constraints affect only new or updated resources, so enforcement is not equivalent to remediating existing inventory. [Organization Policy overview](https://docs.cloud.google.com/resource-manager/docs/organization-policy/overview).

Common design requirements include restricted service-account key creation, approved locations, controlled external identities, reduced public exposure, and required configuration patterns. Do not copy a historical constraint name without checking its current documentation and whether a newer managed constraint supersedes it. An exception should carry a business justification, owner, expiry, compensating control, and measurable rollback plan. Tags can scope certain conditional policies, so permission to bind an exception tag is security-sensitive.

## Lab: design, inspect, and stage a guardrail

1. Confirm ancestry:

   ```bash
   gcloud projects describe "$PROJECT_ID" --format='yaml(projectId,parent)'
   gcloud projects get-ancestors "$PROJECT_ID"
   ```

   If there is no organization, record that fact and use the hypothetical hierarchy below. Do not create an organization just to complete the lesson.

2. Inspect one effective policy, where the documented constraint is supported in your organization:

   ```bash
   gcloud org-policies describe constraints/iam.disableServiceAccountKeyCreation \
     --project="$PROJECT_ID" --effective
   ```

   A policy-not-found response is not a universal permission grant. Resolve the constraint's default, inherited configuration, and any replacement constraint. Record precisely what was observed, including the resource and timestamp.

3. Create a local hierarchy document: organization → platform folder and workload folder; workload folder → production and development; production → orders project. Put central log storage and key administration in dedicated platform projects. Add owners and delegated roles to each boundary. Keep billing-account administration separate from project creation permissions.

4. Write a requirement: “New user-managed service-account keys are blocked in development except a documented integration.” State how you will inventory existing keys, identify federation alternatives, test a harmless negative request in a disposable project, and preserve an emergency path. Do not actually attempt a key creation here.

5. Build a rollout table with stages `observe`, `dry-run where supported`, `pilot`, and `enforce`. For each, define evidence, owner, success threshold, and rollback. Dry-run support is feature-specific; if unavailable, use a pilot project and policy simulation options supported by the service. A platform-wide deny should never be the first test.

6. Add networking and operations acceptance criteria: no overlapping address ranges, a documented Shared VPC owner if used, centralized audit routing with destination permissions, project budget ownership, incident contacts, and an infrastructure-as-code pipeline with review. A hierarchy diagram without these controls is incomplete.

## Verification and failure modes

Have a peer trace an application onboarding request through identity, project creation, network allocation, policy evaluation, and logging. They should be able to tell which team fixes an IAM denial versus a constraint violation. A project move can change inherited access and restrictions; evaluate both before planning a move. “Allowed region” policies need service-specific interpretation and are not automatically a full legal data-residency guarantee. [Resource hierarchy](https://docs.cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy).

## Cleanup, costs, and exercises

The exercise produces local documents only. Remove exported internal hierarchy details from shared computers. Real landing zones can create billable logging, connectivity, and security services even before an application is deployed. Extend the design to an acquired company, then explain how you would migrate projects without breaking service agents, billing ownership, support access, and emergency administration.

