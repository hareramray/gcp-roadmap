# Infrastructure Manager and Config Connector

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Choose a reconciliation owner

Infrastructure Manager executes Terraform-based infrastructure workflows as a managed Google Cloud service. Config Connector represents supported Google Cloud resources as Kubernetes custom resources and reconciles them through controllers. Both express desired state, but their execution and ownership models differ. Infrastructure Manager organizes deployments, revisions, previews, and managed state; Config Connector continually reconciles Kubernetes objects and exposes status conditions. [Infrastructure Manager overview](https://docs.cloud.google.com/infrastructure-manager/docs/overview)

Never let Terraform and Config Connector independently control the same resource fields without an explicit supported ownership arrangement. Competing reconcilers can repeatedly undo one another's changes. A migration requires inventory, ownership transfer, state handling, and verification. Legacy Deployment Manager material should be treated as migration context; consult the current service lifecycle guidance rather than starting a new design from an old YAML tutorial.

This tutorial contains a local configuration exercise and two **gated integration labs**. Execute a cloud branch only after its listed platform prerequisites are satisfied. Use Cloud Shell Bash after the shared setup. Manager executions, build/storage services, and any Config Connector cluster or managed resources can incur charges. Allow 60–90 minutes for the design and more for platform setup.

## Local configuration exercise

Create a clean directory containing only this Terraform file. Do not upload local state, credentials, or unrelated files from an existing project.

```bash
mkdir -p "$HOME/gcp-roadmap-labs/infra-manager"
cd "$HOME/gcp-roadmap-labs/infra-manager"
cat > main.tf <<'EOF'
terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}
variable "project_id" { type = string }
provider "google" { project = var.project_id }
resource "google_compute_network" "lab" {
  name                    = "infra-manager-lab-net"
  auto_create_subnetworks  = false
}
output "network_id" { value = google_compute_network.lab.id }
EOF
terraform init -backend=false
terraform fmt
terraform fmt -check
terraform validate
```

Expect a valid configuration describing a custom-mode network, with no subnets, routes created by workloads, or VMs. Validation checks syntax and provider schema; it does not prove cloud permissions, quota, or organizational policy compliance.

## Gated lab A: a managed preview and deployment

Prerequisites: enable `config.googleapis.com` and the dependent APIs required by the setup guide; choose a supported Infrastructure Manager location and Terraform version; create an execution service account with only the permissions this network requires; grant your caller Config Admin and permission to act as that account. The execution account also needs the documented access to source artifacts and service runtime dependencies. Use an approved storage bucket for configuration. Do not reuse the local Terraform state backend from the previous tutorial: Infrastructure Manager owns this deployment's state.

```bash
: "${INFRA_SA:?Set the authorized Infrastructure Manager service-account email}"
: "${CONFIG_BUCKET:?Set the approved source bucket name without gs://}"
gcloud storage cp main.tf "gs://$CONFIG_BUCKET/infra-manager-lab/main.tf"
gcloud infra-manager previews create \
  "projects/$PROJECT_ID/locations/$REGION/previews/network-lab-preview" \
  --service-account="projects/$PROJECT_ID/serviceAccounts/$INFRA_SA" \
  --gcs-source="gs://$CONFIG_BUCKET/infra-manager-lab/" \
  --input-values="project_id=$PROJECT_ID"
```

Inspect the preview in the console and export its plan using the documented preview workflow. Expect exactly one planned network creation. Stop if unexpected projects, destructive operations, or extra resources appear. Apply the reviewed source after freezing it to a specific object generation or immutable Git revision:

```bash
gcloud infra-manager deployments apply \
  "projects/$PROJECT_ID/locations/$REGION/deployments/network-lab" \
  --service-account="projects/$PROJECT_ID/serviceAccounts/$INFRA_SA" \
  --gcs-source="gs://$CONFIG_BUCKET/infra-manager-lab/" \
  --input-values="project_id=$PROJECT_ID"
gcloud infra-manager deployments describe \
  "projects/$PROJECT_ID/locations/$REGION/deployments/network-lab"
```

The mutable path above is acceptable only for the controlled tutorial; production review and apply must refer to identical content. Verify successful revision state and compare the reported managed resource with `gcloud compute networks describe infra-manager-lab-net`. A preview is evidence about a configuration at a point in time, not a guarantee that later capacity or policy will remain unchanged. [Preview guidance](https://docs.cloud.google.com/infrastructure-manager/docs/preview-deployment)

## Gated lab B: Kubernetes reconciliation

Use an administrator-prepared Config Connector installation with namespace-scoped identity, supported CRDs, and a dedicated project. Do not install an infrastructure controller into an unrelated shared cluster just to try this example.

```yaml
apiVersion: compute.cnrm.cloud.google.com/v1beta1
kind: ComputeNetwork
metadata:
  name: connector-lab-net
  namespace: infra-lab
  annotations:
    cnrm.cloud.google.com/project-id: REPLACE_WITH_PROJECT_ID
spec:
  autoCreateSubnetworks: false
```

Replace the project placeholder, save as `network.yaml`, then run `kubectl apply -f network.yaml`. Inspect `kubectl describe computenetwork connector-lab-net -n infra-lab` and its Ready condition. Verify the actual VPC exists. The controller's Google identity needs network permissions; Kubernetes permission to create a CRD instance does not independently authorize cloud operations. Finalizers let the controller coordinate deletion, so a stuck terminating object may indicate a cloud deletion dependency or missing permissions. [Config Connector resources](https://docs.cloud.google.com/config-connector/docs/concepts/resources)

## Cleanup, diagnosis, and exercises

For Manager, delete the lab deployment using its documented delete workflow and choose resource deletion intentionally; confirm the VPC is gone. Remove only the lab source prefix and preview artifacts after reviewing retention requirements. For Config Connector, delete the `ComputeNetwork` object and verify the underlying VPC is removed before deleting the namespace. Review deletion-policy annotations before assuming the controller deletes or abandons a resource.

Permission failures require identifying the executing identity, not simply granting more permissions to your user. Reconciliation loops require checking competing owners, invalid fields, policy restrictions, and dependent resources. Exercise: write an ownership table for network, database, application deployment, and IAM bindings, assigning exactly one primary controller to each.

## Official references

- [Deploy with Infrastructure Manager](https://docs.cloud.google.com/infrastructure-manager/docs/deploy-resources)
- [Config Connector overview](https://docs.cloud.google.com/config-connector/docs/overview)
- [Organize Config Connector resources](https://docs.cloud.google.com/config-connector/docs/how-to/organizing-resources/overview)

