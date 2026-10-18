# Learning progress checklist

[Home](README.md) · [Roadmap](ROADMAP.md) · [Coverage](COVERAGE.md)

Check a topic only after you can explain it, complete its practical or explicitly labeled design exercise, verify the result, analyze a failure, and account for cleanup/cost. Keep detailed evidence in your own learning journal. All topics start unchecked; repository authoring is not evidence that you completed a cloud lab.

## Foundations

- [ ] [Cloud fundamentals and distributed-system thinking](tutorials/01-foundations/01-cloud-fundamentals.md)
- [ ] [Linux, Bash, processes, files, and troubleshooting](tutorials/01-foundations/02-linux-and-shell.md)
- [ ] [Networking fundamentals: IP, DNS, TCP, TLS, and HTTP](tutorials/01-foundations/03-networking-fundamentals.md)
- [ ] [Git, Python, configuration, and API clients](tutorials/01-foundations/04-git-python-and-apis.md)
- [ ] [SQL, data modeling, transactions, and analytical thinking](tutorials/01-foundations/05-sql-and-data-fundamentals.md)
- [ ] [Accounts, projects, billing, APIs, locations, and quotas](tutorials/01-foundations/06-account-project-billing-and-quotas.md)
- [ ] [gcloud configurations, authentication, ADC, and API inspection](tutorials/01-foundations/07-gcloud-authentication-and-tooling.md)
- [ ] [Resource hierarchy, labels, tags, and selecting a service](tutorials/01-foundations/08-resource-hierarchy-and-service-selection.md)

## Roadmap 02 — Identity, security, and data protection

- [ ] [IAM roles, policies, and effective access](tutorials/02-identity-security/01-iam-roles-and-policies.md)
- [ ] [Service accounts, ADC, impersonation, and federation](tutorials/02-identity-security/02-service-accounts-and-federation.md)
- [ ] [Organization policy and landing zones](tutorials/02-identity-security/03-organization-policy-and-landing-zones.md)
- [ ] [Secret Manager and credential rotation](tutorials/02-identity-security/04-secret-manager.md)
- [ ] [Cloud KMS, CMEK, HSM, EKM, and certificate authorities](tutorials/02-identity-security/05-cloud-kms-and-certificate-authority.md)
- [ ] [VPC Service Controls, access context, and zero trust](tutorials/02-identity-security/06-vpc-service-controls-and-zero-trust.md)
- [ ] [Security Command Center and security posture](tutorials/02-identity-security/07-security-command-center-and-posture.md)
- [ ] [Audit logs, investigation, and Google Security Operations](tutorials/02-identity-security/08-audit-logs-and-security-operations.md)
- [ ] [Data protection, privacy, residency, and compliance](tutorials/02-identity-security/09-data-protection-and-compliance.md)

## Networking

- [ ] [VPC networks, subnets, address planning, and routes](tutorials/03-networking/01-vpc-subnets-and-routes.md)
- [ ] [Firewall rules, policy hierarchy, and network security](tutorials/03-networking/02-firewalls-and-network-security.md)
- [ ] [Cloud DNS, private zones, delegation, and resolution](tutorials/03-networking/03-cloud-dns.md)
- [ ] [Load balancing, TLS, Cloud CDN, and Cloud Armor](tutorials/03-networking/04-load-balancing-cdn-and-cloud-armor.md)
- [ ] [Cloud NAT and Private Google Access](tutorials/03-networking/05-cloud-nat-and-private-google-access.md)
- [ ] [Shared VPC, peering, Private Service Connect, and private services access](tutorials/03-networking/06-shared-vpc-peering-and-private-services.md)
- [ ] [Hybrid networking: VPN, Interconnect, Cloud Router, and NCC](tutorials/03-networking/07-hybrid-connectivity-vpn-interconnect-ncc.md)
- [ ] [Network observability and systematic troubleshooting](tutorials/03-networking/08-network-observability-and-troubleshooting.md)

## Compute

- [ ] [Compute Engine: build and operate a VM](tutorials/04-compute/01-compute-engine.md)
- [ ] [Managed instance groups: immutable fleets](tutorials/04-compute/02-managed-instance-groups.md)
- [ ] [Cloud Run: services, jobs, and revisions](tutorials/04-compute/03-cloud-run.md)
- [ ] [Cloud Run functions and Eventarc](tutorials/04-compute/04-cloud-run-functions.md)
- [ ] [App Engine: standard, flexible, and existing applications](tutorials/04-compute/05-app-engine.md)
- [ ] [Batch, HPC, GPUs, TPUs, and capacity planning](tutorials/04-compute/06-batch-hpc-gpu-tpu.md)

## Containers and GKE

- [ ] [Docker, OCI images, and Artifact Registry](tutorials/05-containers/01-docker-and-artifact-registry.md)
- [ ] [Kubernetes fundamentals: desired state and application objects](tutorials/05-containers/02-kubernetes-fundamentals.md)
- [ ] [GKE Autopilot and Standard: cluster decisions](tutorials/05-containers/03-gke-autopilot-and-standard.md)
- [ ] [GKE security, RBAC, and Workload Identity Federation](tutorials/05-containers/04-gke-security-and-workload-identity.md)
- [ ] [GKE operations, traffic, fleets, and service mesh](tutorials/05-containers/05-gke-operations-and-multicluster.md)

## Storage

- [ ] [Cloud Storage: objects, access, lifecycle, and recovery](tutorials/06-storage/01-cloud-storage.md)
- [ ] [Block, file, and parallel storage](tutorials/06-storage/02-block-file-and-parallel-storage.md)
- [ ] [Data transfer, backup, and restore drills](tutorials/06-storage/03-data-transfer-and-backup.md)

## Database

- [ ] [Database selection and data modeling](tutorials/07-databases/01-database-selection-and-modeling.md)
- [ ] [Cloud SQL: relational operations, connectivity, and recovery](tutorials/07-databases/02-cloud-sql.md)
- [ ] [AlloyDB for PostgreSQL: architecture and workload evaluation](tutorials/07-databases/03-alloydb.md)
- [ ] [Spanner: distributed relational data and transaction design](tutorials/07-databases/04-spanner.md)
- [ ] [Firestore: documents, queries, indexes, and security rules](tutorials/07-databases/05-firestore.md)
- [ ] [Bigtable: row keys, wide columns, and operational scale](tutorials/07-databases/06-bigtable.md)
- [ ] [Memorystore: Valkey, Redis, caching, and migration](tutorials/07-databases/07-memorystore.md)
- [ ] [Database Migration Service: assessment, replication, and cutover](tutorials/07-databases/08-database-migration-service.md)

## Data and analytics

- [ ] [BigQuery fundamentals: datasets, SQL, and ingestion](tutorials/08-data-analytics/01-bigquery-fundamentals.md)
- [ ] [BigQuery performance, reservations, and governance](tutorials/08-data-analytics/02-bigquery-performance-and-governance.md)
- [ ] [Pub/Sub: delivery, retries, ordering, and dead-letter handling](tutorials/08-data-analytics/03-pubsub.md)
- [ ] [Dataflow and Apache Beam: batch and streaming pipelines](tutorials/08-data-analytics/04-dataflow-and-apache-beam.md)
- [ ] [Dataproc and Managed Service for Apache Spark](tutorials/08-data-analytics/05-dataproc-and-managed-spark.md)
- [ ] [Cloud Composer and Managed Service for Apache Airflow](tutorials/08-data-analytics/06-cloud-composer-and-airflow.md)
- [ ] [Dataform: SQL workflows, assertions, and data quality](tutorials/08-data-analytics/07-dataform-and-data-quality.md)
- [ ] [Dataplex, Knowledge Catalog, BigLake, and the lakehouse](tutorials/08-data-analytics/08-dataplex-biglake-and-catalog.md)
- [ ] [Looker and Data Studio: semantic models and trustworthy dashboards](tutorials/08-data-analytics/09-looker-and-looker-studio.md)

## AI and machine learning

- [ ] [Vertex AI foundations and Gemini Enterprise Agent Platform](tutorials/09-ai-ml/01-vertex-ai-and-ml-foundations.md)
- [ ] [Custom training, model artifacts, and prediction](tutorials/09-ai-ml/02-training-and-prediction.md)
- [ ] [Gemini and generative AI with the Google Gen AI SDK](tutorials/09-ai-ml/03-gemini-and-generative-ai.md)
- [ ] [Retrieval-augmented generation and vector search](tutorials/09-ai-ml/04-rag-and-vector-search.md)
- [ ] [Agents, tool calling, and controlled execution](tutorials/09-ai-ml/05-agents-and-tool-use.md)
- [ ] [MLOps, evaluation, monitoring, and responsible AI](tutorials/09-ai-ml/06-mlops-evaluation-and-responsible-ai.md)
- [ ] [Pretrained AI and industry APIs](tutorials/09-ai-ml/07-pretrained-ai-and-industry-apis.md)

## DevOps, infrastructure automation, and platform engineering

- [ ] [Terraform: reproducible infrastructure and controlled state](tutorials/10-devops/01-terraform.md)
- [ ] [Infrastructure Manager and Config Connector](tutorials/10-devops/02-infrastructure-manager-and-config-connector.md)
- [ ] [Cloud Build: explicit identity and reproducible pipelines](tutorials/10-devops/03-cloud-build.md)
- [ ] [Cloud Deploy: promotion, approval, canary, and rollback](tutorials/10-devops/04-cloud-deploy.md)
- [ ] [Keyless external CI with Workload Identity Federation](tutorials/10-devops/05-cicd-workload-identity-federation.md)
- [ ] [Testing and software supply-chain controls](tutorials/10-devops/06-testing-and-software-supply-chain.md)
- [ ] [Developer tools and platform engineering](tutorials/10-devops/07-developer-tools-and-platform-engineering.md)

## Roadmap 11 — Observability, SRE, reliability, and FinOps

- [ ] [Cloud Logging: ingestion, queries, routing, and retention](tutorials/11-observability-sre/01-cloud-logging.md)
- [ ] [Cloud Monitoring, dashboards, and actionable alerts](tutorials/11-observability-sre/02-cloud-monitoring-and-alerting.md)
- [ ] [Tracing, profiling, and OpenTelemetry](tutorials/11-observability-sre/03-tracing-profiling-and-opentelemetry.md)
- [ ] [SLOs, error budgets, and practical SRE](tutorials/11-observability-sre/04-slos-error-budgets-and-sre.md)
- [ ] [Reliability, backups, and disaster recovery](tutorials/11-observability-sre/05-reliability-backups-and-disaster-recovery.md)
- [ ] [Incident response and systematic troubleshooting](tutorials/11-observability-sre/06-incident-response-and-troubleshooting.md)
- [ ] [FinOps, billing, budgets, and cost optimization](tutorials/11-observability-sre/07-finops-billing-and-cost-optimization.md)

## Roadmap 12 — Enterprise architecture, migration, and specialization

- [ ] [Migration assessment, planning, and execution](tutorials/12-enterprise/01-migration-assessment-and-execution.md)
- [ ] [Hybrid, multicloud, fleets, and Google Distributed Cloud](tutorials/12-enterprise/02-hybrid-multicloud-and-distributed-cloud.md)
- [ ] [Enterprise identity, directories, and productivity boundaries](tutorials/12-enterprise/03-enterprise-identity-and-productivity.md)
- [ ] [Governance, risk, procurement, and the cloud operating model](tutorials/12-enterprise/04-governance-risk-and-operating-model.md)
- [ ] [Well-Architected Framework and design reviews](tutorials/12-enterprise/05-architecture-framework-and-design-reviews.md)
- [ ] [Specialized workloads and industry architecture patterns](tutorials/12-enterprise/06-specialized-workloads-and-industry-patterns.md)

## Application integration

- [ ] [Workflows and reliable service orchestration](tutorials/13-integration/01-workflows-and-orchestration.md)
- [ ] [Eventarc, CloudEvents, and event-driven architecture](tutorials/13-integration/02-eventarc-and-event-driven-design.md)
- [ ] [Cloud Tasks, Cloud Scheduler, retries, and background jobs](tutorials/13-integration/03-cloud-tasks-and-cloud-scheduler.md)
- [ ] [API Gateway, Apigee, contracts, and service discovery](tutorials/13-integration/04-api-gateway-apigee-and-service-directory.md)
- [ ] [Firebase, application identity, and business integrations](tutorials/13-integration/05-firebase-and-business-integrations.md)

## Capstone projects

- [ ] [Capstone: a secure serverless order application](tutorials/14-capstones/01-serverless-application.md)
- [ ] [Capstone: a reproducible GKE application platform](tutorials/14-capstones/02-gke-platform.md)
- [ ] [Capstone: a governed batch and streaming data platform](tutorials/14-capstones/03-data-platform.md)
- [ ] [Capstone: an evaluated retrieval assistant with controlled tools](tutorials/14-capstones/04-ai-application-and-architecture-review.md)

