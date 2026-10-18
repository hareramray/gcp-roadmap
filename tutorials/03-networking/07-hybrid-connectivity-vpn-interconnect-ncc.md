# Hybrid networking: VPN, Interconnect, Cloud Router, and NCC

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Design resilient on-premises connectivity and explain encryption, routing, redundancy, and route exchange. Complete IP planning, VPC routing, and private DNS. This is an architecture exercise; actual VPN gateways, partner circuits, dedicated connectivity, cross-cloud links, and attachments need approved budgets and network administration. Do not create half a production tunnel from a learning project.

## Understand the choices

Cloud VPN connects networks with IPsec tunnels over supported transport. HA VPN uses a topology designed for higher availability when you configure the required interfaces, peer redundancy, tunnels, and dynamic routing. Merely choosing the HA product does not prove your overall topology qualifies for an availability commitment. Review current topology requirements and the peer device's capabilities.

Dedicated Interconnect and Partner Interconnect provide private connectivity through different physical/provider arrangements. Cross-Cloud Interconnect addresses supported connectivity between cloud providers. Capacity, locations, lead times, VLAN attachments, routing, provider responsibility, and pricing differ. Private transport is not automatically end-to-end encryption; choose supported encryption mechanisms where required and document exactly which segment they protect.

Cloud Router manages BGP sessions and route exchange. BGP advertises prefixes and selects paths according to configuration and policy. Your Google Cloud and peer-side advertisements must agree on non-overlapping ranges, intended default routes, and failover behavior. An “up” BGP session can still advertise the wrong prefixes. Regional/global routing mode affects where learned routes are usable.

Network Connectivity Center (NCC) organizes supported spokes around a hub for applicable connectivity and route-management use cases. VPC spokes and hybrid spokes have distinct capabilities and restrictions. Do not infer a universal transit network from a hub icon; inspect current spoke compatibility, route propagation, and data-transfer behavior.

DNS, MTU, asymmetric paths, firewalls, endpoint routing, identity, and observability remain part of the design. IPsec adds overhead; path MTU problems can create symptoms where small requests work while larger transfers fail. Two tunnels through the same peer device or facility may share a failure domain.

## Guided exercise: connect a branch and a data center

1. Allocate illustrative ranges: cloud `10.20.0.0/16`, data center `10.60.0.0/16`, branch `10.80.0.0/16`. Confirm they do not overlap with Pods, services, private-service allocations, or partner networks.
2. Choose a branch HA VPN design and a data-center connectivity option based on measured bandwidth, latency, lead time, reliability target, and budget. Record why a cheaper option was accepted or rejected.
3. Draw both directions of each path. Include peer devices, provider/facility boundaries, Google interfaces, tunnels or VLAN attachments, routers, and destination VPC subnets.
4. Create a BGP worksheet: local/peer ASNs, session addresses, advertised prefixes, learned prefixes, route priorities, and acceptable default-route behavior. Use placeholders for sensitive production values.
5. Decide whether NCC solves a real hub/spoke requirement. Specify which networks should communicate and which must remain isolated. Add explicit policy for any branch-to-branch path rather than assuming transit.
6. Design private DNS forwarding and access to Google APIs from on-premises clients. Name the resolver path and required routes; do not assume a VM-only setting automatically covers hybrid clients.
7. Simulate loss of one tunnel, one peer router, one provider circuit, and one region. For each event record expected route withdrawal, surviving path, convergence observation, and business impact.

## Verification and troubleshooting

Acceptance requires more than green status icons. Verify BGP session state, received/advertised prefixes, effective routes in the intended regions, bidirectional application traffic, measured throughput/latency, and failover under controlled maintenance. Test from actual endpoints because router-level checks cannot prove an application firewall or database listener works.

For failure, inspect underlay reachability, IPsec negotiation, BGP, route propagation, firewall policy, DNS, and application in that order as evidence directs. A route seen in the wrong region can indicate dynamic-routing mode rather than tunnel failure. Intermittent large-transfer failure suggests MTU/MSS or fragmentation investigation. Duplicate paths can create asymmetric routing that a stateful inspection device rejects.

## Cleanup, security, and exercises

No live resources are created here. For a lab deployment, coordinate teardown on both sides, withdraw advertisements deliberately, remove tunnels/attachments/gateways, and confirm provider commitments or reserved capacity are canceled only when intended. Remove shared secrets from temporary configuration stores.

Completion evidence is a topology, BGP worksheet, failure matrix, estimated recurring cost, and ownership/runbook. Extend the design to a merger with overlapping addresses and compare renumbering, proxies, and supported private NAT patterns. Explain why encryption, private transport, and application authentication are separate requirements.

## References

- [Cloud VPN overview](https://docs.cloud.google.com/network-connectivity/docs/vpn/concepts/overview)
- [HA VPN topologies](https://docs.cloud.google.com/network-connectivity/docs/vpn/concepts/topologies)
- [Cloud Interconnect](https://docs.cloud.google.com/network-connectivity/docs/interconnect/concepts/overview)
- [Cloud Router](https://docs.cloud.google.com/network-connectivity/docs/router/concepts/overview)
- [Network Connectivity Center](https://docs.cloud.google.com/network-connectivity/docs/network-connectivity-center/concepts/overview)
