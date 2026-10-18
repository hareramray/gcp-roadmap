# Cloud NAT and Private Google Access

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Distinguish general outbound internet access from private access to supported Google APIs. Use the VPC/subnet from the first networking tutorial and the network/router/NAT permissions needed for your chosen steps. The NAT extension is billable and optional; the first step changes subnet configuration only. A VM is required to validate actual traffic, and its cost is separate.

## Understand the mechanisms

Public Cloud NAT performs source translation for eligible outbound traffic from workloads without their own external addresses. It allows return traffic for those connections; it does not expose a listener to unsolicited internet connections. The gateway is configured with a Cloud Router, but Cloud Router is a control-plane component, not a user-managed NAT appliance forwarding every packet.

Private Google Access permits eligible workloads without external addresses to reach supported Google API/service endpoints under documented routing and DNS conditions. It does not provide arbitrary internet access to package mirrors or third-party APIs. Calls to supported Google endpoints and arbitrary external destinations can therefore behave differently from the same VM.

The private and restricted Google API domains offer different service access choices. Restricted API endpoints support the applicable VPC Service Controls service set; endpoint selection does not alone create a perimeter or grant IAM permissions. DNS, route, firewall, service enablement, and authentication must all agree.

Cloud NAT has public and private use cases. Private NAT translates supported private-to-private flows and has topology/protocol limitations distinct from public NAT. Do not apply an internet-egress recipe to overlapping hybrid networks without studying the relevant mode. NAT port allocation, connection lifetime, idle timeout, and workload concurrency matter for reliability at scale.

## Lab A: enable and inspect Private Google Access

```bash
gcloud compute networks subnets update gcp-study-subnet \
  --region="$REGION" --enable-private-ip-google-access --project="$PROJECT_ID"
gcloud compute networks subnets describe gcp-study-subnet \
  --region="$REGION" --project="$PROJECT_ID" \
  --format='yaml(name,privateIpGoogleAccess,ipCidrRange)'
```

Expected configuration: `privateIpGoogleAccess: true`. This is not yet a data-plane test. Use a test VM in this subnet with no external IP and an appropriately scoped runtime identity. From it, test an authenticated operation on a supported Google service. Also test a harmless third-party endpoint with a timeout and explain why it may fail without NAT. Cloud Shell is outside this VPC and cannot substitute for the VM test.

## Lab B: optional public NAT configuration

Review current pricing before proceeding. Retain the ordinary default route to the default internet gateway needed by this design. These names are for this lab only.

```bash
gcloud compute routers create gcp-study-router --network=gcp-study-net \
  --region="$REGION" --project="$PROJECT_ID"
gcloud compute routers nats create gcp-study-nat \
  --router=gcp-study-router --region="$REGION" \
  --nat-custom-subnet-ip-ranges=gcp-study-subnet \
  --auto-allocate-nat-external-ips --project="$PROJECT_ID"
gcloud compute routers nats describe gcp-study-nat \
  --router=gcp-study-router --region="$REGION" --project="$PROJECT_ID"
```

Now repeat the outbound test from the VM and compare results. The VM remains without an external interface address. A new inbound request to a NAT address should not become an application access path. Verify the endpoint only through a separately designed inbound mechanism such as a load balancer or authenticated administrative tunnel.

## Verification and troubleshooting

If outbound traffic fails, inspect the VM's region/subnet coverage, external-IP status, default route, egress policy, DNS, NAT allocation, and endpoint availability. If only Google API traffic fails, inspect the chosen DNS domains, API support, IAM, service perimeter, and required routes. If problems appear only under load, examine port exhaustion and connection reuse rather than repeatedly adding addresses without evidence.

NAT logging/metrics can aid diagnosis but may add charges. Keep test data and tokens out of published logs. Stable outbound IP requirements should use a deliberate address plan rather than assuming automatically allocated addresses never change.

## Cleanup and practice

```bash
gcloud compute routers nats delete gcp-study-nat \
  --router=gcp-study-router --region="$REGION" --project="$PROJECT_ID"
gcloud compute routers delete gcp-study-router --region="$REGION" --project="$PROJECT_ID"
```

Delete optional VMs and check any reserved addresses. If the subnet remains for other labs, retain or explicitly restore its private-access setting according to that lab's needs. Completion evidence is a before/after connectivity matrix and a diagram explaining why NAT, Private Google Access, Private Service Connect, and VPC Service Controls solve different problems.

## References

- [Cloud NAT overview](https://docs.cloud.google.com/nat/docs/overview)
- [Set up Cloud NAT](https://docs.cloud.google.com/nat/docs/set-up-manage-network-address-translation)
- [Private Google Access](https://docs.cloud.google.com/vpc/docs/configure-private-google-access)
- [Private access options](https://docs.cloud.google.com/vpc/docs/private-access-options)
- [Private NAT](https://docs.cloud.google.com/nat/docs/private-nat)
