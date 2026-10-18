# Networking fundamentals: IP, DNS, TCP, TLS, and HTTP

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Trace a request from a hostname to an application, calculate basic address ranges, and distinguish DNS, connectivity, TLS, and application failures. Use Cloud Shell with Python and `curl`; no cloud resource needs to be provisioned. Optional commands require `dig` and `openssl`.

## Understand the layers

An IP address identifies a network interface or endpoint within an addressing context. A CIDR prefix such as `10.20.0.0/24` contains 256 IPv4 addresses, although cloud platforms reserve some addresses and allocation rules vary. A subnet is an address range in a network; it is not an IAM boundary. Private RFC 1918 addresses need an appropriate route to communicate and cannot be assumed unique across organizations.

Routing chooses a next hop for traffic. Firewall policy permits or denies it. A route without a matching allow policy can still fail; an allow rule cannot create a missing route. NAT rewrites addresses and sometimes ports. Source NAT supports outbound access using a different source; it does not automatically create a publicly reachable server.

TCP establishes a connection and presents an ordered byte stream. UDP provides datagrams without TCP's transport guarantees. A port identifies a transport endpoint; an HTTP URL also identifies a resource. A process listening only on `127.0.0.1` accepts local connections but is not reachable through a VM's internal IP. Containers add their own namespaces and port mappings.

DNS maps names to records, with caching controlled in part by TTLs. A records contain IPv4 addresses; AAAA records contain IPv6 addresses; CNAME records alias names. Recursive resolvers obtain answers from authoritative servers. Split-horizon DNS can intentionally return different answers inside and outside a network. DNS resolution succeeding does not prove a service is reachable.

TLS provides encryption in transit and server authentication when certificate verification succeeds. The certificate name, validity interval, trusted chain, and protocol configuration matter. Server Name Indication allows the client to identify the intended hostname during TLS negotiation. Do not disable certificate validation to make a production problem disappear.

HTTP is an application protocol. Understand methods, headers, bodies, content types, redirects, caching, status codes, and connection reuse. A 401 typically concerns authentication; a 403 indicates access was refused; a 404 means the target resource or route was not found; 429 indicates rate limiting; 5xx indicates a server-side failure somewhere in the serving path. An upstream proxy may generate the response, so identify which component replied.

## Lab: diagnose one public request and calculate a subnet

1. Calculate a range without sending traffic:

```bash
python3 - <<'PY'
import ipaddress
net = ipaddress.ip_network('10.20.0.0/24')
print('addresses:', net.num_addresses)
print('first:', net.network_address, 'last:', net.broadcast_address)
print('10.20.0.17 inside:', ipaddress.ip_address('10.20.0.17') in net)
print('four /26 blocks:', list(net.subnets(new_prefix=26)))
PY
```

Expected values include 256 addresses, a last address of `10.20.0.255`, and four non-overlapping `/26` ranges. These are mathematical values, not a promise that every address is usable by a VM.

2. Resolve and request Google's documentation site:

```bash
getent ahosts docs.cloud.google.com
curl --head --location --max-time 20 https://docs.cloud.google.com/
curl --silent --output /dev/null \
  --write-out 'dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} total=%{time_total} status=%{http_code}\n' \
  https://docs.cloud.google.com/
```

Timing fields are cumulative milestones and vary by cache, network, and connection reuse. A redirect changes which host eventually serves content. No fixed IP address or exact latency is required for success.

3. If available, run `dig docs.cloud.google.com` and examine answer records and TTLs. Draw the sequence: resolver → IP routing → TCP → TLS → HTTP. State what information each stage needs.

## Verification and failure analysis

Create a table mapping “name not found,” “connection refused,” “connection timed out,” “certificate mismatch,” and “HTTP 403” to the first layer to inspect. A refused connection often means no listener or an explicit rejection; a timeout has many possible causes. ICMP ping failure alone cannot prove HTTP failure because firewall rules may treat protocols differently.

## Cleanup, security, and practice

This exercise creates no cloud resources. It sends ordinary requests to a public documentation endpoint; do not replace that with scanning arbitrary systems. Practice dividing `10.40.0.0/16` into non-overlapping ranges for development, production, containers, and future hybrid networks. Explain how overlapping addresses complicate peering and VPN designs. Continue to the VPC tutorials to apply these concepts to Google Cloud-specific routing and firewall behavior.

## References

- [VPC overview](https://docs.cloud.google.com/vpc/docs/overview)
- [IPv4 private address allocation, RFC 1918](https://www.rfc-editor.org/rfc/rfc1918)
- [HTTP semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110)
- [Python ipaddress](https://docs.python.org/3/library/ipaddress.html)
