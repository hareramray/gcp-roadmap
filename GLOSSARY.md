# Cloud engineering glossary

[Home](README.md) · [Foundations](roadmaps/01-foundations.md)

Use this as a vocabulary reference; the domain tutorials explain implementation and exceptions.

| Term | Meaning |
| --- | --- |
| ADC | Application Default Credentials: how supported libraries discover credentials for their environment |
| API | A contract through which software invokes operations or accesses data |
| Artifact | A versioned build output such as a container image or package |
| Authentication | Establishing who a caller is |
| Authorization | Deciding what that caller is allowed to do |
| Availability | Successful service over a specified measurement population/time window |
| BGP | Routing protocol used to exchange reachability information between routing domains |
| Blast radius | The extent of resources/users affected by a failure or incorrect change |
| Blue/green deployment | Switching traffic between separate deployment environments |
| Canary deployment | Exposing a new version to a controlled portion of traffic before wider rollout |
| Cardinality | Number of distinct values, or relationship multiplicity in a data model/join |
| CIDR | Prefix notation for IP address ranges, such as `10.20.0.0/24` |
| CloudEvent | Standardized event envelope with identity, source, type, and payload information |
| CMEK | Customer-managed encryption key used by supported services |
| CNI | Container Network Interface specification used by container networking implementations |
| Control plane | Interfaces and components that configure/manage a system |
| CUD | Committed use discount arrangement; scope and eligibility depend on the product |
| Data plane | Components that process workload traffic or data operations |
| Data lineage | Relationships showing where data came from and how it was transformed |
| Data residency | Requirements or configuration concerning where data is stored/processed |
| Dead-letter handling | Isolating repeatedly failing messages for diagnosis and controlled repair |
| Deduplication | Detecting repeated inputs within a defined identity and retention scope |
| Drift | Difference between declared configuration and actual resource state |
| Durability | Preservation of data over time and failure conditions |
| Egress | Traffic leaving a specified boundary; the billable meaning depends on the service/path |
| Error budget | Allowed unreliability implied by an SLO over its window |
| Event time | Time the business event occurred |
| Federation | Trusting an external identity system through validated identity assertions |
| FQDN | Fully qualified domain name |
| HA | High availability: architecture/operations intended to maintain service through failures |
| HSM | Hardware security module for protected cryptographic operations/key handling |
| IAM | Identity and Access Management policies, roles, principals, and permissions |
| IAP | Identity-Aware Proxy: identity-based access for supported applications and tunnels |
| Idempotency | Repeating an operation does not repeat its intended business effect |
| Ingress | Traffic entering a specified boundary |
| IOPS | Input/output operations per second, interpreted with workload size and latency |
| JWT | JSON Web Token; claims must be verified and authorized, not merely decoded |
| KMS | Key Management Service for cryptographic key lifecycle and operations |
| Kubernetes | Platform/API for orchestrating containerized workloads |
| Latency | Time required for an operation, often measured with percentiles |
| Least privilege | Granting only the access necessary for the intended task |
| MIG | Managed instance group: a VM fleet governed by templates and management settings |
| MTU | Maximum transmission unit on a network link/path |
| NAT | Network address translation |
| NEG | Network endpoint group used by supported load-balancing configurations |
| OIDC | OpenID Connect, an identity layer over OAuth 2.0 |
| OLAP | Analytical processing over substantial data, often historical/aggregated |
| OLTP | Transaction processing for operational applications |
| PDB | PodDisruptionBudget governing supported voluntary disruptions |
| PITR | Point-in-time recovery within a service's supported recovery window |
| Principal | An identity represented in an access-control decision |
| Processing time | Time a processing system handles an event |
| PSA | Private services access to supported producer-managed services |
| PSC | Private Service Connect for supported private service access patterns |
| Pub/Sub | Publish/subscribe messaging pattern and Google Cloud messaging service |
| Quota | Limit on request rate, resource allocation, or another scoped usage metric |
| RAG | Retrieval-augmented generation: generation supplied with retrieved context |
| RBAC | Role-based access control |
| Region | Geographic deployment area containing zones or regional service infrastructure |
| RPO | Recovery point objective: acceptable data-loss interval |
| RTO | Recovery time objective: acceptable time to restore the defined service |
| Runtime identity | Identity used by running application code |
| Service agent | Google-managed identity used to perform service operations |
| Service account | Non-human IAM principal commonly used by workloads |
| SLI | Service-level indicator: measured service behavior |
| SLO | Service-level objective: target for an SLI over a defined window |
| SLA | Service-level agreement: contractual service commitment with defined conditions |
| Spot capacity | Interruptible discounted capacity subject to product-specific availability/terms |
| Terraform state | Mapping and metadata used to track managed infrastructure; can contain sensitive data |
| Throughput | Amount of completed work per unit time |
| TTL | Time to live, used for caches or retention depending on context |
| VPC | Virtual Private Cloud network |
| WAF | Web application firewall capabilities on supported serving paths |
| Workload identity | Identity assigned to a running application or workload |
| Zone | Deployment/failure-domain scope within a region |

For product-specific definitions, consult the relevant [tutorial references](COVERAGE.md); some terms have narrower meanings in a particular service.
