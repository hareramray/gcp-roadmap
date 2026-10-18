# VPC networks, subnets, address planning, and routes

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Build a custom VPC and subnet, inspect routes, and explain which resources are global or regional. Complete networking fundamentals first. Use a dedicated project, enable `compute.googleapis.com`, and obtain permissions to create networks and subnets, typically through Compute Network Admin in a sandbox. Organization policies can restrict these actions. This lab creates network configuration but no VM; later attachments, IPs, traffic, and logging can incur charges.

## Understand the topology

A Google Cloud VPC network is global. Its subnets are regional, and a VM interface uses a subnet in the VM's region. A subnet has a primary IPv4 range and can have secondary ranges for supported uses such as alias IPs. GKE commonly needs additional address planning for Pods and Services. IPv6 has its own allocation, scope, and service-support considerations; a dual-stack design needs both routing and firewall policy for the relevant address families.

Custom mode lets you deliberately allocate ranges. Auto mode creates predefined regional subnets and is convenient for exploration but often unsuitable for carefully planned hybrid address space. A custom network does not automatically permit arbitrary internal traffic. Route reachability and firewall permission are separate decisions.

System-generated subnet routes represent local subnets. A default route matches destinations that lack a more specific applicable route. Static routes are manually configured; dynamic routes are learned through Cloud Router/BGP for supported connectivity. Policy-based routes and service-specific routing can alter the ordinary path. Route selection involves applicability and route category before prefix/priority decisions; “lowest numeric priority always wins” is not a complete model.

Cloud Router exchanges routing information. It is not a VM through which every packet flows. Regional versus global dynamic routing mode affects the scope of learned dynamic routes. VPC Network Peering exchanges supported routes subject to configuration and does not make peering generally transitive. Plan non-overlapping ranges before connecting networks.

## Lab: create and inspect an isolated network

Use these names only if they are unused in your lab project. Later networking exercises refer to this network; retain it until those exercises are complete or recreate it deliberately.

```bash
gcloud services enable compute.googleapis.com --project="$PROJECT_ID"
gcloud compute networks create gcp-study-net --subnet-mode=custom \
  --bgp-routing-mode=REGIONAL --project="$PROJECT_ID"
gcloud compute networks subnets create gcp-study-subnet \
  --network=gcp-study-net --range=10.20.0.0/24 \
  --region="$REGION" --project="$PROJECT_ID"
gcloud compute networks describe gcp-study-net --project="$PROJECT_ID" \
  --format='yaml(name,autoCreateSubnetworks,routingConfig,subnetworks)'
gcloud compute networks subnets describe gcp-study-subnet \
  --region="$REGION" --project="$PROJECT_ID" \
  --format='yaml(name,region,ipCidrRange,privateIpGoogleAccess)'
gcloud compute routes list --project="$PROJECT_ID" \
  --filter='network:gcp-study-net' \
  --format='table(name,destRange,priority,nextHopGateway,nextHopNetwork)'
```

Record the subnet route and default route if present. Explain which matches `10.20.0.7` and which might match a public internet address. A default internet-gateway route alone does not give a VM without an external address general internet access; it needs an appropriate translation/access mechanism.

Draw an additional future subnet in a second region and reserve non-overlapping Pod and hybrid ranges on paper. Do not allocate broad ranges casually: later peering and private-service allocations can be difficult to change.

## Verification and troubleshooting

The network should show custom subnet mode and the subnet should show the chosen region and CIDR. These control-plane checks do not prove VM connectivity; there are no VMs in this lab. If creation reports overlap, inspect all relevant primary, secondary, peered, and reserved ranges before choosing another CIDR. A region mismatch usually appears when a zonal resource references a subnet in a different region.

For a missing route, inspect the source interface, applicable network, route category, and dynamic-routing scope. Do not add a broad static route without understanding where its next hop sends traffic. An incorrect route can create a black hole or leak traffic into the wrong security domain.

## Cleanup and practice

Delete dependent resources from later exercises first, then:

```bash
gcloud compute networks subnets delete gcp-study-subnet \
  --region="$REGION" --project="$PROJECT_ID"
gcloud compute networks delete gcp-study-net --project="$PROJECT_ID"
```

Deletion prompts are intentional. If a resource-in-use error appears, inventory dependencies instead of forcing broad deletion. Completion evidence is a topology diagram, route interpretation, and an address plan that leaves room for growth. Extend the plan to dual stack and document why IPv4-only assumptions would fail.

## References

- [VPC networks](https://docs.cloud.google.com/vpc/docs/vpc)
- [Subnets](https://docs.cloud.google.com/vpc/docs/subnets)
- [Routes](https://docs.cloud.google.com/vpc/docs/routes)
- [IP address ranges](https://docs.cloud.google.com/vpc/docs/subnets#ip-ranges)
- [Cloud Router overview](https://docs.cloud.google.com/network-connectivity/docs/router/concepts/overview)
