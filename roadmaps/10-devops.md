# DevOps, infrastructure automation, and platform engineering roadmap

[Curriculum home](../README.md) · [Shared lab setup](../LAB-SETUP.md)

## Goal and prerequisites

Build a traceable path from reviewed source and infrastructure definitions to a verified, recoverable deployment. Prerequisites are Git, basic application testing, IAM/service accounts, Cloud Storage, containers, and at least one deployment target such as Cloud Run or GKE. Use Google Cloud Shell Bash for local command examples; external CI examples explicitly identify where they run.

Suggested pace: 20–30 focused hours over two or three weeks. Start with local validation and small disposable resources. Enterprise controller installations, external identity federation, admission enforcement, and workstation evaluation are gated integrations requiring the stated platform prerequisites. No cloud deployment is required merely to read or prepare the examples.

## Ordered topic-to-tutorial map

| Order | Tutorial | Detailed coverage | Evidence to produce |
| --- | --- | --- | --- |
| 1 | [Terraform](../tutorials/10-devops/01-terraform.md) | Providers and lockfiles; variables and modules; plan/apply; state; remote GCS backend and locking; imports; drift; lifecycle guards; refactoring; destruction | Reviewed plan, no-change second plan, remote-state configuration, and safe drift/refactor exercise |
| 2 | [Infrastructure Manager and Config Connector](../tutorials/10-devops/02-infrastructure-manager-and-config-connector.md) | Managed Terraform previews/revisions; source and execution identity; Kubernetes infrastructure CRDs; reconciliation; conditions/finalizers; deletion semantics; ownership transfer | Valid local configuration, optional managed preview or controller proof, and single-owner resource matrix |
| 3 | [Cloud Build](../tutorials/10-devops/03-cloud-build.md) | Build steps; workspace and dependencies; substitutions; explicit current service-account handling; source staging; logs; image publishing; triggers; private pools | Successful bounded build, failed-test stop, least-privilege account, and source-to-digest evidence |
| 4 | [Cloud Deploy](../tutorials/10-devops/04-cloud-deploy.md) | Pipelines/targets/releases/rollouts; Skaffold profiles; execution accounts; dev-to-prod promotion; approvals; canary phases; rollback; external side effects | Reviewed delivery files, optional dev rollout and approval gate, plus a canary/rollback procedure |
| 5 | [CI/CD Workload Identity Federation](../tutorials/10-devops/05-cicd-workload-identity-federation.md) | OIDC trust; claims/audience; numeric repository identity; attribute conditions; service-account impersonation; external workflow authentication; negative tests | Keyless read-only workflow and documented rejection of an unauthorized branch or repository |
| 6 | [Testing and software supply chain](../tutorials/10-devops/06-testing-and-software-supply-chain.md) | Unit/integration/canary evidence; immutable promotion; vulnerability scanning; SBOMs; provenance; attestations; Binary Authorization; exceptions and break glass | Meaningful local tests, digest-linked evidence record, and a reviewed admission-policy test plan |
| 7 | [Developer tools and platform engineering](../tutorials/10-devops/07-developer-tools-and-platform-engineering.md) | Cloud Shell and editor; Cloud Code; Cloud Workstations; reproducible onboarding; starter interfaces; maintained deployment paths; ownership; platform metrics | Self-checking starter, fresh-environment onboarding results, and a small internal-platform service contract |

## Connect the pieces

Infrastructure automation creates foundations and records their ownership. The application build validates source and creates an immutable artifact. The delivery system promotes that exact artifact using a deployment identity scoped to the target environment. Runtime identity grants the application its own API access. External CI federation establishes how a trusted job receives short-lived credentials. Tests, scans, provenance, and attestations provide different evidence at different boundaries.

Keep those responsibilities visible. A single all-powerful pipeline is convenient until an untrusted change, compromised dependency, or accidental command inherits its full authority. Separate configuration authorship, execution permissions, approval responsibility, and operational recovery according to the risk of each environment.

## Completion gates

- Show the exact configuration or commit, artifact digest, build identity, tests, release, and target for one deployment.
- Explain why state is sensitive and demonstrate safe locking, drift review, and destruction planning.
- Identify which controller owns each infrastructure resource and how ownership changes during migration.
- Prove an unauthorized CI context fails, rather than demonstrating only a successful trusted workflow.
- Explain the distinction among a vulnerability finding, an SBOM, provenance, an attestation, and admission enforcement.
- Demonstrate a failed test prevents artifact publication and a failed acceptance check prevents promotion.
- Write a rollback procedure covering schema compatibility and effects that cannot be undone by changing an image.
- Verify a fresh developer can run tests using only documented setup steps.

## Portfolio deliverable

Create a small repository containing application code, meaningful tests, a Dockerfile, a Terraform module, build configuration, delivery configuration, a keyless CI trust design, and an operations README. Attach a release evidence bundle and a cleanup inventory. Use synthetic data and a disposable project. Clearly distinguish executed results from design-only integrations so a reviewer can assess what was actually verified.

## Maintenance references

Recheck [Terraform on Google Cloud](https://docs.cloud.google.com/docs/terraform), [Cloud Build](https://docs.cloud.google.com/build/docs), [Cloud Deploy](https://docs.cloud.google.com/deploy/docs), and [IAM federation guidance](https://docs.cloud.google.com/iam/docs/workload-identity-federation) when updating this track. Service-account defaults, supported Terraform/Skaffold versions, action versions, and platform feature availability can change; each tutorial links its primary documentation.
