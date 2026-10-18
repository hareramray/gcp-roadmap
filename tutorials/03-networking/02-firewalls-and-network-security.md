# Firewall rules, policy hierarchy, and network security

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Write a narrowly scoped firewall rule and explain its effective behavior. Recreate or retain the network from [the VPC lab](01-vpc-subnets-and-routes.md). Use Compute Security Admin or a custom role with the necessary firewall permissions; network creation permissions alone may not suffice. This lab does not open access to the public internet or create a VM. Firewall logging and advanced inspection can produce charges.

## Understand enforcement

A firewall decision considers direction, action, priority, protocol/port, source or destination, and target. VPC firewall rules apply to eligible interfaces in their network. Ingress evaluates connections toward a target; egress evaluates connections initiated from it. Lower numeric priority means higher priority within the applicable rule model. Hierarchical and network firewall policies add evaluation stages; do not collapse all rule types into one imaginary flat list.

For ordinary VM networking, implied rules normally deny ingress and allow egress after applicable explicit policy. Default networks also contain predefined rules that a new custom network does not inherit. Stateful connection tracking generally permits matching response traffic for an allowed flow. This does not mean all traffic in the opposite direction is permitted.

Target a workload deliberately. Network tags are convenient selectors but whoever can change them can affect policy application. Service-account targeting can connect rules to workload identity; it does not replace application authentication. Secure tags in supported firewall policies have their own administration model. A resource label is not a firewall target simply because it has the same text.

Cloud NGFW capabilities include policy organization and, in appropriate tiers/configurations, additional inspection. Cloud IDS detects threats through its supported traffic inspection workflow; detection is not equivalent to inline blocking. Cloud Armor protects supported application-facing serving paths and is covered with load balancing. VPC Service Controls protect supported managed-service data boundaries; they are not packet firewall rules.

## Lab: create an explicit internal HTTP rule

Suppose only a frontend subnet needs to call a backend on TCP port 8080. For this isolated example the source range is `10.20.0.0/24`, and the target tag is `gcp-study-api`.

```bash
gcloud compute firewall-rules create gcp-study-allow-api \
  --network=gcp-study-net --direction=INGRESS --priority=1000 \
  --action=ALLOW --rules=tcp:8080 --source-ranges=10.20.0.0/24 \
  --target-tags=gcp-study-api --enable-logging --project="$PROJECT_ID"
gcloud compute firewall-rules describe gcp-study-allow-api \
  --project="$PROJECT_ID" \
  --format='yaml(direction,priority,allowed,sourceRanges,targetTags,logConfig)'
```

No VM currently has this tag, so this configuration does not establish a working HTTP service. Write a four-case prediction table:

| Attempt | Expected rule match |
| --- | --- |
| Internal source, tagged VM, TCP 8080 | Matches this allow rule |
| Internal source, tagged VM, TCP 22 | Does not match this rule |
| External source, tagged VM, TCP 8080 | Does not match this source range |
| Internal source, untagged VM, TCP 8080 | Does not match this target |

The final result still depends on other effective rules and a valid route/listener. If you later deploy disposable VMs, test both allowed and denied cases and inspect their effective firewall policies. Use IAP/OS Login for administration rather than adding a world-open SSH rule.

## Verification and troubleshooting

The described rule must match the intended direction, range, port, and target. If a supposedly denied connection succeeds, examine existing established sessions and other effective allow rules. If a permitted connection fails, verify that the destination has the target selector, the source address is what you assumed after proxies/NAT, and the process listens on the correct interface.

Firewall logs help identify matching behavior but are not a complete packet capture. Logging settings and sampling/aggregation elsewhere affect evidence. Do not conclude that “no log” proves “no traffic” without examining the logging path and scope.

## Cleanup and exercises

```bash
gcloud compute firewall-rules delete gcp-study-allow-api --project="$PROJECT_ID"
```

Remove this rule before deleting the VPC. Keep a redacted rule matrix as evidence. Redesign the example using service-account targeting, then describe how a folder-level deny should constrain project-level exceptions. Explain which controls you would use for egress to package repositories, internal service calls, public HTTP abuse, and managed-service exfiltration.

## References

- [VPC firewall rules](https://docs.cloud.google.com/firewall/docs/firewalls)
- [Firewall policies](https://docs.cloud.google.com/firewall/docs/firewall-policies-overview)
- [Firewall rule logging](https://docs.cloud.google.com/firewall/docs/firewall-rules-logging)
- [Cloud IDS overview](https://docs.cloud.google.com/intrusion-detection-system/docs/overview)
- [IAP TCP forwarding](https://docs.cloud.google.com/iap/docs/using-tcp-forwarding)
