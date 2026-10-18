# VPC Service Controls, access context, and zero trust

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Explain why an authenticated request can still be blocked, distinguish application access from data-service perimeters, and design safe perimeter tests. Use `PROJECT_ID`, `REGION`, and `ZONE` from the setup guide. This is a design-first lab: organization administration and paid access products are not required. Optional inspections require an existing Access Context Manager policy, its API, and read permission such as Access Context Manager Policy Reader. Use only an organization and access policy explicitly supplied for your lab.

## Three complementary layers

VPC Service Controls reduces data-exfiltration paths for supported Google-managed services by defining service perimeters and rules. It is not a VPC packet firewall, and it does not grant IAM permission. A request must satisfy applicable IAM and perimeter requirements. Protecting one API does not automatically protect every data route, supported integration, or product in the project. Check each service's support and limitations. [VPC Service Controls overview](https://docs.cloud.google.com/vpc-service-controls/docs/overview).

Access Context Manager defines access levels based on supported contextual attributes. Perimeters and compatible products can use those levels. Context-aware controls supplement identity; they do not make every device trustworthy by default. Ingress rules describe permitted access into a perimeter and egress rules describe permitted access out. Model the identity, source or destination, service, operation, and resource explicitly. A bridge and a broad egress rule have different implications and should not be added merely to stop errors. [Access Context Manager overview](https://docs.cloud.google.com/access-context-manager/docs/overview).

Identity-Aware Proxy (IAP) protects access to supported applications or TCP forwarding paths using identity-aware authorization. Users can reach an application without receiving broad network trust. IAP TCP forwarding still requires appropriate IAM, firewall configuration, and operating-system access. BeyondCorp and current Chrome Enterprise access capabilities extend the zero-trust approach through identity, device, and contextual controls; exact product names, licenses, and integrations must be checked at implementation. [IAP concepts](https://docs.cloud.google.com/iap/docs/concepts-overview).

## Lab: map allowed and forbidden data flows

1. Write a scenario with a protected analytics project, a central logging project, an external analyst laptop, and a CI service account. Give the analyst legitimate IAM access to a dataset. State why that access alone should not permit exporting data to an arbitrary external project.

2. Create a flow table with columns for source identity, source context, destination resource, API method, IAM requirement, perimeter rule, and expected result. Include an internal query, an approved ingestion job, a central log export, an external download, and a service-agent call. Service agents are real dependencies; omit them and a correctly intended perimeter can break managed services.

3. If an existing organization policy is available, inspect it without mutation:

   ```bash
   export ACCESS_POLICY_ID='replace-with-existing-numeric-policy-id'
   gcloud access-context-manager perimeters list --policy="$ACCESS_POLICY_ID"
   gcloud access-context-manager levels list --policy="$ACCESS_POLICY_ID"
   ```

   Record which resources and restricted services appear. Avoid exporting sensitive source-network or device criteria into a public repository.

4. Design a dry-run perimeter for the scenario. Define the candidate protected projects and services, then enumerate expected violations before enforcement. Use the documented dry-run workflow in a real authorized environment; this tutorial does not apply rules. Distinguish a genuine exfiltration attempt from an overlooked necessary dependency.

5. Create an IAP access review for an internal operations UI. Require an approved user group, application authorization after login, backend access restrictions that prevent bypassing IAP, and a separate audited administrator path. Include an automated service-to-service call because human browser authentication and service authentication differ.

6. Write a rollback sequence that restores the last known-good perimeter configuration while preserving audit evidence. Time-box exceptions and give each one an owner. A permanent “allow all” exception invalidates the original security objective even if the application appears healthy.

## Verification and failure modes

Acceptance requires both positive and negative tests. The internal query must work with the intended identity; the external export must fail even when the caller has dataset permissions. The operator must be able to identify a perimeter denial from its violation evidence instead of repeatedly expanding IAM. Account for access-policy propagation and service-specific behavior. [Supported products and limitations](https://docs.cloud.google.com/vpc-service-controls/docs/supported-products).

## Cleanup, costs, and practice

No policies or deployments were created. Delete local internal topology exports after review. Real data-processing tests, logging, premium device controls, and backend applications can incur charges. A perimeter is not a cost cap. Extend the exercise to a vendor integration and a regional disaster recovery project; show precisely which operations must cross the boundary and how the test suite detects a newly introduced exfiltration path.

