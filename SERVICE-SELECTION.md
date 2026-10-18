# Google Cloud service selection guide

[Home](README.md) · [Coverage map](COVERAGE.md)

Choose from requirements and measured constraints. These tables point to tutorials that explain the tradeoffs; they are starting hypotheses, not universal prescriptions. Verify current edition, region, quotas, availability, and pricing in each tutorial's references.

## Compute and application hosting

| Need | Candidates and tutorial | Questions that decide |
| --- | --- | --- |
| Control of operating system or legacy VM | [Compute Engine](tutorials/04-compute/01-compute-engine.md) | Patching, licenses, availability, machine family, image lifecycle |
| Replicated VM fleet | [Managed instance groups](tutorials/04-compute/02-managed-instance-groups.md) | Statelessness, template version, health checks, autoscaling signal |
| Managed HTTP container or finite job | [Cloud Run](tutorials/04-compute/03-cloud-run.md) | Request/job semantics, state, concurrency, connections, cold starts |
| Small event handler | [Cloud Run functions](tutorials/04-compute/04-cloud-run-functions.md) | Trigger support, runtime lifecycle, retries, deployment path |
| Kubernetes API and ecosystem | [GKE modes](tutorials/05-containers/03-gke-autopilot-and-standard.md) | Operational ownership, scheduling needs, policy, total cost |
| Existing App Engine application | [App Engine](tutorials/04-compute/05-app-engine.md) | Runtime constraints, migration cost, standard/flexible differences |
| Finite batch or accelerator workload | [Batch/HPC/GPU/TPU](tutorials/04-compute/06-batch-hpc-gpu-tpu.md) | Capacity, checkpointing, placement, storage throughput, budget |

## Storage and databases

| Need | Candidates and tutorial | Important distinction |
| --- | --- | --- |
| Objects and files accessed through APIs | [Cloud Storage](tutorials/06-storage/01-cloud-storage.md) | Object storage semantics differ from a POSIX filesystem |
| VM disks or shared/parallel filesystem | [Block/file/parallel storage](tutorials/06-storage/02-block-file-and-parallel-storage.md) | Latency, IOPS, throughput, sharing, durability, protocol |
| Managed familiar SQL engine | [Cloud SQL](tutorials/07-databases/02-cloud-sql.md) | Engine compatibility, HA, read replicas, connection limits |
| PostgreSQL-compatible analytical/transactional requirements | [AlloyDB](tutorials/07-databases/03-alloydb.md) | Benchmark actual query/write patterns and operational economics |
| Distributed relational transactions | [Spanner](tutorials/07-databases/04-spanner.md) | Keys, locality, transaction scope, scale and minimum footprint |
| Document-oriented application data | [Firestore](tutorials/07-databases/05-firestore.md) | Query/index model, edition/mode, rules versus server IAM |
| Large key-oriented low-latency workloads | [Bigtable](tutorials/07-databases/06-bigtable.md) | Row-key design, hot spots, query model, capacity |
| Cache or transient acceleration layer | [Memorystore](tutorials/07-databases/07-memorystore.md) | Engine lifecycle, persistence, eviction, failure semantics |
| Historical SQL analytics | [BigQuery](tutorials/08-data-analytics/01-bigquery-fundamentals.md) | Scan/capacity economics, partitioning, data location, access |

Begin with [database selection and modeling](tutorials/07-databases/01-database-selection-and-modeling.md). A cache, warehouse, and transactional database are not substitutes merely because each stores bytes.

## Integration and data processing

| Need | Tutorial | Decision factor |
| --- | --- | --- |
| Broadcast events to independent consumers | [Pub/Sub](tutorials/08-data-analytics/03-pubsub.md) | Fanout, retention, acknowledgement, replay and ordering |
| Route supported source events | [Eventarc](tutorials/13-integration/02-eventarc-and-event-driven-design.md) | Source/destination support, filters, location, identity |
| Dispatch a specific background action | [Cloud Tasks](tutorials/13-integration/03-cloud-tasks-and-cloud-scheduler.md) | Rate, retries, target and idempotency |
| Start work on a schedule | [Cloud Scheduler](tutorials/13-integration/03-cloud-tasks-and-cloud-scheduler.md) | Timezone, overlap, authentication, duplicate invocation |
| Coordinate service steps | [Workflows](tutorials/13-integration/01-workflows-and-orchestration.md) | State, retries, callbacks, compensation |
| Schedule data-pipeline dependencies | [Airflow/Composer](tutorials/08-data-analytics/06-cloud-composer-and-airflow.md) | DAG lifecycle, environment cost, sensors, backfills |
| Transform batch/streaming records | [Beam/Dataflow](tutorials/08-data-analytics/04-dataflow-and-apache-beam.md) | Event time, state, windows, sink guarantees |
| Spark ecosystem workloads | [Managed Spark/Dataproc](tutorials/08-data-analytics/05-dataproc-and-managed-spark.md) | Serverless versus cluster, libraries, shuffles, data locality |
| Govern SQL transformations | [Dataform](tutorials/08-data-analytics/07-dataform-and-data-quality.md) | Dependencies, assertions, version control, ownership |
| Connect business applications | [Application Integration/connectors](tutorials/13-integration/05-firebase-and-business-integrations.md) | Credentials, mapping, vendor limits, reconciliation |

## Networking, security, and operations

| Requirement | Tutorial |
| --- | --- |
| Outbound access without VM public addresses | [NAT and Private Google Access](tutorials/03-networking/05-cloud-nat-and-private-google-access.md) |
| Central networking or private producer services | [Shared VPC, peering, PSA, PSC](tutorials/03-networking/06-shared-vpc-peering-and-private-services.md) |
| Internet/internal traffic distribution, TLS, caching, WAF | [Load balancing/CDN/Armor](tutorials/03-networking/04-load-balancing-cdn-and-cloud-armor.md) |
| On-premises or cross-cloud connectivity | [VPN/Interconnect/NCC](tutorials/03-networking/07-hybrid-connectivity-vpn-interconnect-ncc.md) |
| Workload credentials without static keys | [Service accounts/federation](tutorials/02-identity-security/02-service-accounts-and-federation.md) |
| Secret values versus cryptographic keys/certificates | [Secret Manager](tutorials/02-identity-security/04-secret-manager.md), [KMS/CA](tutorials/02-identity-security/05-cloud-kms-and-certificate-authority.md) |
| Managed-service data perimeter | [VPC Service Controls/zero trust](tutorials/02-identity-security/06-vpc-service-controls-and-zero-trust.md) |
| Desired-state infrastructure | [Terraform](tutorials/10-devops/01-terraform.md), [Infra Manager/Config Connector](tutorials/10-devops/02-infrastructure-manager-and-config-connector.md) |
| Build versus release orchestration | [Cloud Build](tutorials/10-devops/03-cloud-build.md), [Cloud Deploy](tutorials/10-devops/04-cloud-deploy.md) |
| Logs, metrics, distributed request timing | [Logging](tutorials/11-observability-sre/01-cloud-logging.md), [Monitoring](tutorials/11-observability-sre/02-cloud-monitoring-and-alerting.md), [Tracing](tutorials/11-observability-sre/03-tracing-profiling-and-opentelemetry.md) |

For AI choices, work through [AI foundations](tutorials/09-ai-ml/01-vertex-ai-and-ml-foundations.md), [training/prediction](tutorials/09-ai-ml/02-training-and-prediction.md), [generative models](tutorials/09-ai-ml/03-gemini-and-generative-ai.md), [retrieval](tutorials/09-ai-ml/04-rag-and-vector-search.md), and [specialized APIs](tutorials/09-ai-ml/07-pretrained-ai-and-industry-apis.md). Start with the simplest system that meets measured quality and operational requirements, then justify additional model customization or agent autonomy.
