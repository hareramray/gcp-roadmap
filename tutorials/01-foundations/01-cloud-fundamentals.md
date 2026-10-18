# Cloud fundamentals and distributed-system thinking

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

You will explain service models, failure domains, elasticity, availability, consistency, and the shared responsibility model. No account or paid resource is required. Use a text editor and a calculator. This foundation prevents choosing a product merely because it appears in a certification diagram.

## Build the mental model

Cloud computing exposes infrastructure and managed capabilities through APIs. **IaaS** gives you virtual machines and networks with substantial operating-system responsibility. **PaaS** manages more of the runtime. **Serverless** shifts capacity management toward a service provider, while you still own application correctness, data, permissions, and spending. **SaaS** provides an application rather than an execution environment. These are useful categories, not perfect descriptions of every product.

Separate the **control plane**, which creates and configures resources, from the **data plane**, which serves application traffic. Permission to deploy a database is not necessarily permission to read its tables. An API outage that prevents new deployments does not always stop existing applications; the actual dependency must be examined.

Google Cloud resources have scopes. A zone is a deployment area within a region. Zonal resources can fail with their zone. Regional replication can reduce exposure to zonal failure; cross-region architecture addresses a different failure domain and changes latency, cost, and data residency. A global control surface does not imply all application data is replicated everywhere.

**Scalability** is the ability to handle more work. **Elasticity** changes capacity with demand. Vertical scaling makes a machine larger; horizontal scaling adds workers. Horizontal scaling requires dealing with shared state, distributed coordination, duplicate work, connection limits, and partitioning. A stateless web tier still depends on stateful databases, queues, identity, and configuration.

Availability is successful service over a defined measurement period. Durability is preservation of data. Latency is how long an operation takes; throughput is how much work completes per time unit. An average can hide a poor tail: measure percentiles and user-visible failures. A service-level agreement is a provider contract; an SLO is your operational target. Your application's availability also depends on your code and dependencies.

Distributed messages can be delayed, duplicated, or reordered. An idempotent operation can be retried without repeating its business effect. A timeout means the caller does not know whether the remote operation completed; it does not prove failure. Strong consistency, eventual consistency, transaction isolation, and replication are different concepts. State precisely which operation and failure condition a guarantee covers.

## Guided architecture exercise

1. Draw a small order system: browser → API → database; API → queue → email worker. Mark trust boundaries and persistent data.
2. Assign each responsibility: Google maintains physical infrastructure; your team controls application logic, access policy, data classification, recovery tests, and service configuration. For VMs add OS patching; for managed databases examine what remains your responsibility.
3. Assume an arrival rate of 100 requests/second and a mean elapsed time of 0.2 seconds per request inside the system being measured, including waiting. Little's law suggests approximately 20 concurrent in-flight requests in a stable system. CPU processing time alone is not the same input. This is a planning estimate, not a load-test result.
4. Make the API stateless. Decide where sessions live and how an order ID prevents duplicate purchase processing.
5. Fail one worker after it sends an email but before acknowledging its message. Explain why the replacement may receive the same work.
6. Set an illustrative 99.9% monthly availability objective. For a 30-day month, the failure allowance is 43.2 minutes if measured as time availability. A request-based objective uses eligible request counts instead.
7. List what must survive a zonal outage and what must survive accidental deletion. Replication alone can replicate an accidental deletion; recoverable backups solve a different problem.

## Verification and troubleshooting

Your diagram should distinguish traffic flow from deployment permissions, locate all durable data, and name every dependency on the critical path. A retry policy without a retry limit, jitter, deadline, and idempotency strategy is incomplete. If you cannot identify which component owns an order after a timeout, refine the business state machine before picking services.

For an application with two independent required dependencies each available 99.9%, their simple serial combination is about 99.8001%, before accounting for the application. Real failures are often correlated, so multiplying availability figures is an educational approximation rather than a guarantee.

## Cost, cleanup, and practice

No resources were created. Estimate cost drivers separately: execution time, provisioned capacity, stored bytes, operations, data transfer, and support. Describe a system that is cheap at low utilization but expensive at sustained load. Then redesign the order system for a regional outage and explain the extra cost and consistency tradeoffs.

Completion evidence: a one-page architecture, a responsibility table, one failure timeline, and a written explanation of availability versus durability. Continue to Linux and networking before deployment labs.

## References

- [Google Cloud overview](https://docs.cloud.google.com/docs/overview)
- [Regions and zones](https://docs.cloud.google.com/compute/docs/regions-zones)
- [Well-Architected Framework](https://docs.cloud.google.com/architecture/framework)
- [Google SRE: service level objectives](https://sre.google/sre-book/service-level-objectives/)
