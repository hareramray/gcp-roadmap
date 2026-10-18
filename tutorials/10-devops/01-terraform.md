# Terraform: reproducible infrastructure and controlled state

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Prerequisites and operating model

Use Cloud Shell Bash, a disposable project, and a reviewed Terraform installation. Run `terraform version` first. Allow 60–90 minutes. This lab creates an empty Cloud Storage bucket and an optional state bucket, so storage operations and retained versions can incur small charges. Your identity needs permissions for the resources it manages; Terraform does not bypass IAM.

Terraform configuration describes desired infrastructure. Providers translate resource operations into API calls. State maps configuration addresses such as `google_storage_bucket.lab` to real resources and stores attributes used for planning. State is sensitive operational data: it can contain secrets even when an output is marked `sensitive`. Never commit state or saved plans to a public repository.

`init` installs providers and configures the backend. `plan` compares configuration, state, and refreshed remote observations. `apply` executes an approved plan. A plan is not an atomic transaction across every API; partial failures can leave some resources changed and others unchanged. Read the next plan before retrying. Modules package related configuration behind inputs and outputs; they should express useful architectural boundaries rather than wrap every individual resource mechanically. [Terraform workflow](https://developer.hashicorp.com/terraform/cli/run)

## Hands-on: one resource with explicit guardrails

```bash
mkdir -p "$HOME/gcp-roadmap-labs/terraform"
cd "$HOME/gcp-roadmap-labs/terraform"
cat > main.tf <<'EOF'
terraform {
  required_version = ">= 1.5, < 2.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}
variable "project_id" { type = string }
variable "region" { type = string }
provider "google" {
  project = var.project_id
  region  = var.region
}
resource "google_storage_bucket" "lab" {
  name                        = "${var.project_id}-terraform-lab"
  location                    = var.region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  force_destroy               = false
  labels = { purpose = "roadmap-lab" }
}
output "bucket_name" { value = google_storage_bucket.lab.name }
EOF
export TF_VAR_project_id="$PROJECT_ID"
export TF_VAR_region="$REGION"
terraform init
terraform fmt
terraform fmt -check
terraform validate
terraform plan -out=lab.tfplan
terraform show lab.tfplan
terraform apply lab.tfplan
terraform output bucket_name
terraform plan -detailed-exitcode
```

Expect one bucket creation and then no changes; the final command returns zero for no difference, two for a nonempty plan, and one for an error. Cloud Shell normally supplies Application Default Credentials. Outside it, configure ADC or approved short-lived impersonation separately from interactive `gcloud` login. Do not introduce a service-account key file just to satisfy a provider.

The example selects a provider major release deliberately. Review compatibility and update the version constraint during maintenance; commit `.terraform.lock.hcl` so teammates use the reviewed provider checksums. Exclude `.terraform/`, `*.tfstate*`, and `*.tfplan` from Git.

## Remote state and locking

For team use, bootstrap a separate bucket before configuring the backend. Give only authorized runners access and enable versioning. The GCS backend supports state locking; locking prevents concurrent writers, not malicious access or wrong configuration. [GCS backend](https://developer.hashicorp.com/terraform/language/backend/gcs)

```bash
export TF_STATE_BUCKET="${PROJECT_ID}-tfstate-lab"
gcloud storage buckets create "gs://$TF_STATE_BUCKET" \
  --location="$REGION" --uniform-bucket-level-access
gcloud storage buckets update "gs://$TF_STATE_BUCKET" --versioning
cat > backend.tf <<'EOF'
terraform {
  backend "gcs" {}
}
EOF
terraform init -migrate-state \
  -backend-config="bucket=$TF_STATE_BUCKET" \
  -backend-config='prefix=roadmap/storage'
```

Review the migration prompt and verify the remote state exists before discarding any local backup. Separate production and development states to reduce blast radius. Workspaces can separate state instances but do not automatically separate credentials, policy, or cloud projects. Avoid putting backend credentials directly in configuration or command history.

## Drift, imports, and lifecycle

Change the lab bucket's label in the console, then run `terraform plan`. Terraform should detect drift and propose restoring the declared value. Decide whether the console change was legitimate; either encode it in configuration or restore the intended state. `ignore_changes` is useful for attributes owned elsewhere but can hide meaningful drift.

Import associates an existing resource with an address; it does not automatically produce a correct production design. With an import block, specify the resource's supported import identifier, run a plan, inspect generated or handwritten configuration, and remove the import block after the workflow is complete if appropriate. Never import the same resource into two independently managed states. [Import](https://developer.hashicorp.com/terraform/language/import)

Use `prevent_destroy` for carefully selected critical resources, understanding that it is a configuration guard rather than a replacement for backups or IAM. `create_before_destroy` can reduce downtime but requires duplicate capacity and names that permit coexistence. Use `moved` blocks when refactoring addresses so a rename does not accidentally imply replacement.

## Cleanup and exercises

```bash
terraform plan -destroy -out=destroy.tfplan
terraform show destroy.tfplan
terraform apply destroy.tfplan
```

The bucket is empty, so destruction should succeed. If it contains data, `force_destroy=false` deliberately prevents automatic data removal. Keep the state bucket until all managed resources are gone and state retention requirements are understood; versioned state objects require deliberate cleanup. Never delete a shared backend to “unlock” a run. Investigate the lock owner before using force-unlock.

Exercise: extract the bucket into a reusable module with validated inputs, preserve its resource identity using a moved block, and show a no-replacement plan. Explain how an approved saved plan can become stale and why production applies should use a controlled runner.

## Official references

- [Google Terraform documentation](https://docs.cloud.google.com/docs/terraform)
- [State storage and locking](https://developer.hashicorp.com/terraform/language/state/backends)
- [Resource lifecycle](https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle)

