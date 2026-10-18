# Networking roadmap

[Home](../README.md) · [Full sequence](../ROADMAP.md) · [Lab setup](../LAB-SETUP.md)

Prerequisites: foundations and basic IAM. Allow 30–50 hours including packet-path investigation. Network labs share a clearly named disposable VPC; follow each dependency and cleanup note.

## Topic sequence and tutorials

| Step | Tutorial | Detailed coverage | Completion evidence |
| --- | --- | --- | --- |
| 1 | [VPCs, subnets, and routes](../tutorials/03-networking/01-vpc-subnets-and-routes.md) | Global/regional scope, custom networks, address planning, IPv6, dynamic routing | Create/inspect a custom network and explain effective routes. |
| 2 | [Firewalls and network security](../tutorials/03-networking/02-firewalls-and-network-security.md) | Targets, priorities, policy hierarchy, statefulness, NGFW/IDS distinctions | Define narrow access and predict allowed and denied flows. |
| 3 | [Cloud DNS](../tutorials/03-networking/03-cloud-dns.md) | Private/public zones, delegation, records, forwarding, DNSSEC | Inspect a private zone and test from the correct network. |
| 4 | [Load balancing, CDN, and Cloud Armor](../tutorials/03-networking/04-load-balancing-cdn-and-cloud-armor.md) | L7/L4, internal/external, NEGs, TLS, certificates, caching, WAF | Draw the full serving graph and define cache/security tests. |
| 5 | [NAT and Private Google Access](../tutorials/03-networking/05-cloud-nat-and-private-google-access.md) | General egress, API access, DNS/routes, port allocation | Explain and optionally demonstrate differing outbound paths. |
| 6 | [Shared VPC and private services](../tutorials/03-networking/06-shared-vpc-peering-and-private-services.md) | Host/service projects, peering, PSA, PSC, ownership | Select a supported private connectivity pattern without transit assumptions. |
| 7 | [Hybrid connectivity](../tutorials/03-networking/07-hybrid-connectivity-vpn-interconnect-ncc.md) | HA VPN, Interconnect, Cloud Router/BGP, NCC, MTU, failover | Produce a BGP worksheet and failure-domain analysis. |
| 8 | [Network observability](../tutorials/03-networking/08-network-observability-and-troubleshooting.md) | Connectivity Tests, flow/firewall/NAT logs, mirroring, diagnostics | Produce an evidence-based incident timeline. |

## How to complete this domain

Work in order unless you can already demonstrate the prerequisites. For each tutorial, save a short explanation, a sanitized exercise result or design artifact, one investigated failure, and a cleanup record. Read-only configuration inspection is not a substitute for a live traffic test when the objective requires one. Mark a design-only exercise explicitly when you cannot provision its environment.

Revisit any topic you can name but cannot explain. For broader subtopics, use the linked official references to inspect exact feature support, current commands, and production limits. Do not treat a product name as a complete architecture.

## Next steps

Continue with [Compute](04-compute.md), [Containers](05-containers.md), and [Enterprise architecture](12-enterprise.md).

