# Shared VPC, peering, Private Service Connect, and private services access

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Choose the right private-connectivity pattern and explain its ownership, routing, DNS, and security implications. Complete the first five networking topics and basic IAM. This is a design exercise because organization privileges, supported managed services, endpoint charges, and multi-project ownership vary. No organization mutation or paid service provisioning is required.

## Compare four mechanisms

**Shared VPC** centralizes a network in a host project and lets authorized service projects use its subnets. Network administrators retain ownership of common network controls while application teams manage permitted resources. A service project does not receive a separate copied VPC. Required IAM spans host and service projects, and certain service agents need documented host-project permissions. Use subnet-level access where possible.

**VPC Network Peering** connects independent networks and exchanges supported routes. Each side owns its network and firewall policy. Peering is not generally transitive: if A peers with B and B peers with C, A cannot assume access to C through B. Overlapping subnet ranges cause problems. DNS and IAM are not automatically merged by route exchange.

**Private services access (PSA)** establishes connectivity to a supported service producer using an allocated address range and Service Networking connection. Managed services use producer-side infrastructure within that arrangement. Address sizing matters: later service allocations can fail if too little usable space remains. Deleting a shared connection can affect multiple dependent services.

**Private Service Connect (PSC)** exposes supported services through private endpoints or supported backends, with consumer and producer controls. Depending on the use case, consumers connect to Google APIs, a supported managed service, or a producer service attachment. PSC service access does not mean arbitrary transitive network access to everything in the producer VPC.

These mechanisms can coexist. An application in a Shared VPC service project might consume a managed database through the service's supported private connectivity. Choose based on the exact service and edition rather than assuming Cloud SQL, AlloyDB, and every third-party producer offer identical options.

## Guided exercise: central platform and two app teams

1. Draw a host project with application subnets and two service projects. Name the network team, app deployers, runtime identities, and Google service agents. Write an access table showing who can use a subnet, change routes, and deploy a workload.
2. Give each team an application and a database requirement. Identify which private-connectivity modes the chosen database supports in your region/edition using its current documentation. Record why the selected mode fits.
3. Reserve a separate non-overlapping range for PSA if that mode is chosen. Distinguish an allocated producer-services range from a VM subnet. Include expected growth and avoid treating a broad CIDR as free unlimited capacity.
4. For a PSC alternative, show consumer endpoint address, producer attachment or API target, acceptance policy, DNS name, and client IAM. List which team owns each component.
5. Add a partner VPC using peering. Explain what routes may be exchanged and why the partner cannot automatically reach another peered network. Specify explicit firewall and DNS behavior.
6. Run a paper failure drill: the database hostname resolves to an old public address after private connectivity is configured. Trace resolver selection before changing routes. Then simulate the correct address with a denied IAM request to show that private reachability does not grant data access.

## Optional read-only inspection

If you have a lab network, inspect its peering configuration without creating a connection:

```bash
gcloud compute networks peerings list --network=gcp-study-net \
  --project="$PROJECT_ID"
gcloud compute addresses list --global --project="$PROJECT_ID" \
  --filter='purpose=VPC_PEERING'
```

An empty list is a valid result. Do not change organization associations or reuse production ranges to populate the output.

## Verification and troubleshooting

A correct design names both sides' ownership and avoids undocumented transit assumptions. A deployment must additionally prove connection/endpoint readiness, DNS from the actual client, route and firewall behavior, application TLS, and IAM authorization. “Connected” in a control-plane page is only one of those checks.

Investigate private-service failures by separating address exhaustion, connection setup, DNS, routing, permissions, and service-specific provisioning. Deleting and recreating a producer connection can be disruptive; inspect dependencies and use the product's documented recovery process.

## Cleanup, costs, and practice

The design-only exercise creates nothing. Optional deployments require a dependency inventory before removing endpoints, forwarding rules, service attachments, allocations, or shared network associations. PSC and managed services may bill independently. Completion evidence is a multi-project ownership diagram and a decision table comparing the four mechanisms. Extend it with a private third-party SaaS producer and explain how consumer acceptance and DNS would work.

## References

- [Shared VPC](https://docs.cloud.google.com/vpc/docs/shared-vpc)
- [VPC Network Peering](https://docs.cloud.google.com/vpc/docs/vpc-peering)
- [Private services access](https://docs.cloud.google.com/vpc/docs/private-services-access)
- [Private Service Connect](https://docs.cloud.google.com/vpc/docs/private-service-connect)
- [Private connectivity options](https://docs.cloud.google.com/vpc/docs/private-access-options)
