# Load balancing, TLS, Cloud CDN, and Cloud Armor

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Choose the right load-balancer family, trace its resources, and design an HTTPS delivery path with caching and application protection. Complete HTTP/TLS and VPC fundamentals. This is a guided design and console-inspection exercise by default: load balancers, IPs, certificates, logging, CDN traffic, and security policies can incur charges. Use the linked product-specific setup guide if you choose to deploy after pricing the design.

## Choose the serving path

Application Load Balancers handle HTTP(S) semantics such as host/path routing. Network Load Balancers handle transport-level needs and include proxy and passthrough families. Choose external versus internal access, global versus regional reach, protocol support, backend type, network service tier, client-IP behavior, and TLS termination deliberately. Product combinations and feature support differ; not every backend works with every load balancer.

A typical external HTTPS application path includes an address, forwarding rule, target HTTPS proxy, certificate configuration, URL map, backend service, and backend group or network endpoint group (NEG). VM backends use health checks and firewall allowances appropriate to the selected load balancer. Serverless NEGs follow their own backend and health behavior; do not copy a VM health-check recipe indiscriminately.

TLS can terminate at the frontend, while backend transport has a separate encryption decision. Certificate Manager supports managed and self-managed certificate workflows with specific attachment options. A domain and correct authorization/DNS are prerequisites for a publicly trusted managed certificate. Do not interpret “certificate provisioning” as proof that DNS already routes clients correctly.

Cloud CDN caches eligible responses near users. Cache keys, TTL, cache-control headers, signed access, invalidation, and origin behavior affect correctness. Personalized responses and secrets must not be cached under a shared key. Media CDN addresses specialized media-delivery patterns; evaluate it separately for large streaming workflows rather than assuming it is a switch on every web backend.

Cloud Armor applies security policies to supported serving resources. Rules can match request properties, enforce rate limits, and use supported preconfigured WAF protections. Preview mode helps assess false positives before enforcement. A WAF does not fix broken application authorization or unsafe database queries.

## Guided exercise: design an online catalog

1. Define requirements: HTTPS customers in several regions, `/images/*` cacheable, `/account/*` private and uncacheable, and an API backend with controlled deployment access.
2. Choose an external Application Load Balancer and a backend supported by that mode. List every resource and its scope. Decide whether backend regions need failover and how database availability affects that decision.
3. Sketch the URL map and caching contract. Example: public product images get explicit cacheable headers and immutable versioned URLs; account responses use suitable private/no-store semantics. Specify whether query strings affect image variants.
4. In the console load-balancer creation flow, inspect supported choices without saving a deployment. Record the frontend protocol, address scope, backend type, certificate attachment, logging setting, and health behavior.
5. Write a minimal security policy plan: observe first, baseline legitimate traffic, add a narrowly justified rule in preview, assess sampled false positives, then enforce with a rollback path. Do not invent one universal rate limit for all endpoints.
6. Create a test matrix: valid image, personalized page, unknown host/path, unhealthy backend, expired certificate, and excessive requests. Specify expected HTTP result and the log/metric that proves the outcome.
7. Estimate standing and traffic-driven charges and identify every resource that teardown must remove.

## Verification and troubleshooting

A deployed extension should prove domain resolution, valid certificate chain, successful frontend response, correct cache behavior, and intentional security-policy behavior. Check backend health and logs if the frontend returns 502/503. A healthy backend can still produce application errors. A certificate can remain unprovisioned because of authorization or DNS configuration. A cache hit ratio alone does not prove private content is protected.

Capture client-visible status, request ID, selected backend, and relevant policy decision where supported. To troubleshoot latency, separate edge processing, connection setup, backend execution, and cache misses. Never fix a failing health check by allowing all sources and ports without identifying the actual requirement.

## Cleanup and exercises

No resources exist if you only inspected the creation flow. For a deployment, delete its forwarding rules and dependent frontend/backend resources, unused addresses, certificates, test policies, and test backends in the documented dependency order. Do not delete a shared certificate or backend. Completion evidence is the complete resource graph, cache rules, security test matrix, cost estimate, and teardown plan. Extend the design to an internal API and explain what changes.

## References

- [Load-balancing overview](https://docs.cloud.google.com/load-balancing/docs/load-balancing-overview)
- [Choose a load balancer](https://docs.cloud.google.com/load-balancing/docs/choosing-load-balancer)
- [Certificate Manager](https://docs.cloud.google.com/certificate-manager/docs/overview)
- [Cloud CDN](https://docs.cloud.google.com/cdn/docs/overview)
- [Cloud Armor](https://docs.cloud.google.com/armor/docs/cloud-armor-overview)
- [Media CDN](https://docs.cloud.google.com/media-cdn/docs/overview)
