# Cloud DNS, private zones, delegation, and resolution

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Create a private managed zone, add a record, and distinguish configuration inspection from actual name resolution. Use the VPC from the first networking lab, enable `dns.googleapis.com`, and obtain DNS administration permissions plus any required network binding permissions. Managed zones and queries can incur charges. No registered public domain is necessary for the private example.

## Concepts

A managed zone contains DNS records for a suffix. A public zone is served through authoritative name servers and becomes useful for an internet domain when its parent delegates to those servers. Creating a zone alone does not change your registrar's delegation. A private zone is visible to authorized networks and has different resolution behavior from public DNS.

An A record maps a name to IPv4; AAAA maps to IPv6; CNAME aliases a name; MX identifies mail routing; TXT stores text used by various verification and policy systems. TTL influences caching, so changing a record does not instantly replace every cached answer. Negative responses can also be cached.

Private DNS designs include forwarding to on-premises resolvers, inbound forwarding for hybrid clients, DNS peering, and split-horizon names. DNS peering and VPC Network Peering are distinct features. Routing to a DNS server, permission to query it, and correct response routing still matter. DNSSEC provides authenticity validation for applicable public DNS data; it does not encrypt all DNS traffic.

Avoid private namespaces that accidentally shadow necessary public service names. A broad private zone can capture queries even when a particular expected record is absent. Plan zone ownership, overlapping suffixes, and resolver precedence before adding a zone to a production VPC.

## Lab: make a private service name

Use the reserved testing suffix `.test.` for a lab name, and a fictional internal address from the lab subnet. The address is illustrative and does not identify a running service.

```bash
gcloud services enable dns.googleapis.com --project="$PROJECT_ID"
gcloud dns managed-zones create gcp-study-zone \
  --dns-name=study.test. --description='Disposable private DNS exercise' \
  --visibility=private --networks=gcp-study-net --project="$PROJECT_ID"
gcloud dns record-sets create api.study.test. \
  --zone=gcp-study-zone --type=A --ttl=60 --rrdatas=10.20.0.10 \
  --project="$PROJECT_ID"
gcloud dns record-sets list --zone=gcp-study-zone --project="$PROJECT_ID"
gcloud dns managed-zones describe gcp-study-zone --project="$PROJECT_ID"
```

Verify the A record, zone suffix, and authorized network. The trailing dot represents an absolute DNS name. A 60-second TTL makes a useful learning example, but a production TTL should balance change propagation, caching, query load, and failure behavior.

For a data-plane test, create a disposable VM explicitly attached to `gcp-study-net` and `gcp-study-subnet`. Adapt the [Compute Engine tutorial](../04-compute/01-compute-engine.md), changing its network/subnet arguments and creating its narrowly scoped IAP SSH firewall rule in this network. The unmodified compute lab uses `vm-lab-net`, which is not authorized for this private zone. From the correctly attached VM, run `getent hosts api.study.test`; `dig` is an alternative if installed. Expect `10.20.0.10`. Cloud Shell is not automatically in the authorized VPC, so a Cloud Shell lookup is not a valid proof that the private zone works for VPC clients.

Draw the public equivalent: a domain registrar delegates a subdomain to the zone's authoritative name servers; those servers return the record. Do not change a real domain just for this exercise. Include rollback steps and the old TTL in your design.

## Verification and troubleshooting

If a record is absent in the API listing, fix the zone/record operation. If it exists but VPC resolution fails, inspect source network authorization, query suffix, forwarding policies, resolver order, and caching. If resolution works but HTTP fails, move to routing, firewall, listener, and application checks. An A record does not create an IP allocation or load balancer.

For public domains, inspect delegation before editing records repeatedly. For hybrid forwarding, verify both directions of network connectivity and the required source ranges for the documented forwarding mechanism. Never assume forwarding packets originate from a random client VM's IP.

## Cleanup and practice

```bash
gcloud dns record-sets delete api.study.test. --zone=gcp-study-zone \
  --type=A --project="$PROJECT_ID"
gcloud dns managed-zones delete gcp-study-zone --project="$PROJECT_ID"
```

Delete any optional test VM separately. Completion evidence is a resolver-path diagram, record listing, and, if executed, a lookup from the authorized network. Practice diagnosing a stale answer, a missing delegation, and a private zone that shadows a public suffix. State the difference between a private answer and an authenticated application.

## References

- [Cloud DNS overview](https://docs.cloud.google.com/dns/docs/overview)
- [Create managed zones](https://docs.cloud.google.com/dns/docs/zones)
- [DNS records](https://docs.cloud.google.com/dns/docs/records)
- [DNS best practices](https://docs.cloud.google.com/dns/docs/best-practices)
- [DNSSEC](https://docs.cloud.google.com/dns/docs/dnssec)
