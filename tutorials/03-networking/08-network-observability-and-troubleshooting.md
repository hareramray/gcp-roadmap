# Network observability and systematic troubleshooting

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Investigate a failed connection with reproducible evidence instead of opening broad firewall rules. Complete the networking topics. The core exercise uses a written incident and read-only inspection. Optional Connectivity Tests and flow/firewall logging require service permissions and may incur charges; consult pricing and retention before enabling them at large scale.

## Understand the evidence sources

Connectivity Tests analyzes supported network configuration and, for applicable scenarios, includes live data-plane checks. Its results must be interpreted within its coverage and limitations. It cannot guarantee application-level correctness for every service or replace an actual authenticated request.

VPC Flow Logs provide sampled/aggregated flow observations for supported resources and configurations. They are useful for traffic patterns, source/destination analysis, and network investigation, but are not a packet-by-packet lossless capture. Firewall logs record supported rule decisions when enabled. Load-balancer logs reveal frontend/backend behavior. NAT logs and metrics help investigate translation and port allocation. Packet Mirroring sends supported traffic to a collector and introduces additional architecture, access, storage, and privacy considerations.

Network Intelligence Center tools help inspect topology, performance, connectivity, and policy usage. Tool visibility depends on scope, enabled telemetry, permissions, and supported resource types. A dashboard with no data can mean missing collection rather than zero traffic. Synchronize timestamps and carry request/correlation IDs wherever possible.

Always define the failing flow precisely: source identity and interface, source IP, destination name and resolved IP, protocol/port, time interval, expected route, and observed error. “The network is down” provides too little information for a useful test.

## Guided incident: private API timeout

Scenario: a VM without an external IP used to call an internal API on TCP 8080. After a deployment it times out, while a local health check inside the API container succeeds.

1. Write the hypothesis list: wrong DNS record, wrong source network, missing route, firewall target changed, listener bound only to loopback, unhealthy load-balancer backend, or application saturation. Do not assume the newest infrastructure change is guilty without evidence.
2. From the actual client environment, resolve the API name. Save the answer and compare it with the intended endpoint. Do not use Cloud Shell as a substitute for a private VPC client.
3. Inspect the destination configuration and listening socket. A local health check can succeed while the process is bound to `127.0.0.1`, which prevents remote access.
4. Identify effective routes and firewall policies for this exact source and destination. Check target selectors and service-account changes introduced by the deployment.
5. In Network Intelligence Center → Connectivity Tests, create a narrowly scoped test using the actual source resource and destination/port if supported. Record the traced configuration step that fails or the successful analysis result. Separate configuration analysis from any live test result.
6. Inspect flow, firewall, and application logs for the same time window. If requests reach the server, shift toward application processing and dependencies. If they do not, investigate the last verified network boundary.
7. Change one variable at a time. If you correct a listener bind address, retest the original client and a deliberately unauthorized client. Successful intended traffic alone does not prove policy is still narrow.

## Optional read-only commands

```bash
gcloud compute routes list --project="$PROJECT_ID" \
  --filter='network:gcp-study-net'
gcloud compute firewall-rules list --project="$PROJECT_ID" \
  --filter='network:gcp-study-net'
gcloud compute networks subnets describe gcp-study-subnet \
  --region="$REGION" --project="$PROJECT_ID"
```

These commands show useful configuration but may not include every hierarchical policy or managed-service path affecting a flow. Use effective-policy views and the relevant service documentation for the full evaluation.

## Verification and troubleshooting habits

Create a timeline with hypothesis, test, observation, and conclusion. A test that cannot distinguish two hypotheses is weak evidence. Use bounded timeouts, avoid high-volume traffic generators in shared environments, and record when a cached DNS response or established TCP session could influence results.

For a performance issue, measure packet loss/retransmissions where observable, RTT, application latency, connection reuse, throughput, and resource saturation. High throughput and low latency are related but different objectives. A single speed-test result does not represent every service path or workload.

## Cleanup and completion evidence

Delete temporary Connectivity Tests if no longer useful, disable only logging enabled exclusively for the exercise, and remove packet-mirroring policies/collectors if created. Preserve sanitized incident evidence under appropriate retention. Completion evidence is a one-page incident report with root cause, proof, fix, negative test, and preventive action. Practice the same workflow for DNS failure, TLS mismatch, NAT exhaustion, and a denied private-service request.

## References

- [Connectivity Tests overview](https://docs.cloud.google.com/network-intelligence-center/docs/connectivity-tests/concepts/overview)
- [VPC Flow Logs](https://docs.cloud.google.com/vpc/docs/flow-logs)
- [Firewall logging](https://docs.cloud.google.com/firewall/docs/firewall-rules-logging)
- [Packet Mirroring](https://docs.cloud.google.com/vpc/docs/packet-mirroring)
- [Cloud NAT monitoring](https://docs.cloud.google.com/nat/docs/monitoring)
