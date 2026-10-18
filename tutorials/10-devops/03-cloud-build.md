# Cloud Build: explicit identity and reproducible pipelines

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Understand the trust boundary

Cloud Build executes containerized build steps, shares a workspace between steps, and publishes artifacts. A build definition is executable code with the permissions of its build service account. Someone who can modify a privileged build or its trigger may be able to exercise those permissions. Separate building artifacts from deploying production resources.

Cloud Build's default identity has changed over time and depends on project history and organization settings. Do not assume every project uses `PROJECT_NUMBER@cloudbuild.gserviceaccount.com`. Inspect `gcloud builds get-default-service-account` and specify a user-managed account for this tutorial. Distinguish the build execution account from the Cloud Build service agent used by Google's control plane. [Current default behavior](https://docs.cloud.google.com/build/docs/cloud-build-service-account-updates)

Use Cloud Shell Bash with the shared setup and the Docker tutorial's application directory. Allow one hour. Remote execution, image storage, source staging, logs, and network transfers can incur charges. Your caller must be authorized to submit builds, upload source, and act as the build account. Administrative IAM commands below require corresponding permissions.

## Prepare narrowly scoped resources

```bash
gcloud services enable cloudbuild.googleapis.com artifactregistry.googleapis.com
gcloud iam service-accounts create roadmap-builder
export BUILD_SA="roadmap-builder@${PROJECT_ID}.iam.gserviceaccount.com"
export BUILD_BUCKET="${PROJECT_ID}-build-source-lab"
gcloud storage buckets create "gs://$BUILD_BUCKET" \
  --location="$REGION" --uniform-bucket-level-access
gcloud artifacts repositories create build-lab \
  --repository-format=docker --location="$REGION"
gcloud artifacts repositories add-iam-policy-binding build-lab \
  --location="$REGION" --member="serviceAccount:$BUILD_SA" \
  --role=roles/artifactregistry.writer
gcloud storage buckets add-iam-policy-binding "gs://$BUILD_BUCKET" \
  --member="serviceAccount:$BUILD_SA" --role=roles/storage.objectViewer
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$BUILD_SA" --role=roles/logging.logWriter
```

These grants let the build read staged source, write images to one repository, and emit logs. They do not let it deploy Cloud Run or administer IAM. The submitting user needs Service Account User on this build account, granted by an authorized administrator. A user-managed execution identity also requires an explicit supported logging destination; this example selects Cloud Logging only. [User-managed build accounts](https://docs.cloud.google.com/build/docs/securing-builds/configure-user-specified-service-accounts)

## Author and submit a build

In the container tutorial's directory, create this file. Its quoted heredoc preserves Cloud Build substitution variables for the build service rather than expanding them in your local shell.

```bash
cat > cloudbuild.yaml <<'EOF'
steps:
- id: syntax-check
  name: python:3.12-slim
  entrypoint: python
  args: ['-m', 'py_compile', 'app.py']
- id: build-image
  name: gcr.io/cloud-builders/docker
  args: ['build', '-t', '${_REGION}-docker.pkg.dev/$PROJECT_ID/build-lab/web:${_TAG}', '.']
images:
- '${_REGION}-docker.pkg.dev/$PROJECT_ID/build-lab/web:${_TAG}'
options:
  logging: CLOUD_LOGGING_ONLY
timeout: 600s
EOF
gcloud builds submit . --region="$REGION" --config=cloudbuild.yaml \
  --service-account="projects/$PROJECT_ID/serviceAccounts/$BUILD_SA" \
  --gcs-source-staging-dir="gs://$BUILD_BUCKET/source" \
  --substitutions="_REGION=$REGION,_TAG=lab-v1"
gcloud builds list --region="$REGION" --limit=5
gcloud artifacts docker images list \
  "${REGION}-docker.pkg.dev/${PROJECT_ID}/build-lab/web" --include-tags
```

Expect the syntax check to pass before the image build, then a successful push with a digest. The syntax check is intentionally small; it does not prove application correctness. Replace it with meaningful unit and integration tests in the supply-chain tutorial. A failed step stops the normal pipeline unless explicitly configured otherwise. Parallel steps require explicit dependency design and must avoid racing over shared workspace files.

Use `.gcloudignore` to keep credentials, virtual environments, logs, and unrelated files out of the uploaded archive. Review the file list before submitting sensitive projects. An image listed under `images` is associated with build output metadata; a random shell push may not produce equivalent provenance behavior.

## Triggers and private pools

A trigger connects repository events to a configuration and execution identity. Choose branch or tag filters, included/ignored paths, substitutions, and approval settings deliberately. Pull-request code is untrusted input: do not let a fork modify a production-privileged build and then execute it automatically. Separate validation triggers from release triggers, protect the release branch, and constrain who may edit trigger configuration.

Private pools provide additional worker and network configuration for builds requiring private resources or controlled egress. They do not automatically solve repository trust, dependency integrity, or IAM. Design VPC connectivity, DNS resolution, firewall paths, service perimeter compatibility, and artifact access before migrating a build. A private database integration test needs a dedicated test database and synthetic data, not production credentials. [Private pools](https://docs.cloud.google.com/build/docs/private-pools/private-pools-overview)

## Troubleshoot and clean up

For a 403, identify whether failure occurs during source upload, source read, image push, or log writing; each uses a different permission path. If a trigger behaves differently from a manual build, compare its account, substitutions, source revision, and region. Log commands and exit codes, but redact tokens and secret values. Avoid printing entire environment maps.

Delete the lab repository after dependent delivery exercises are complete. Remove staged source objects, then delete the lab source bucket. Remove the Logging Log Writer binding before deleting the build account. Retain audit evidence according to your organization's policy rather than erasing shared logs.

Exercise: make a syntax error and confirm no new image version is published. Then replace the mutable tag with a commit identifier and record the digest, source revision, build identity, and test result as a release evidence bundle.

## Official references

- [Build configuration schema](https://docs.cloud.google.com/build/docs/build-config-file-schema)
- [Build triggers](https://docs.cloud.google.com/build/docs/automating-builds/create-manage-triggers)
- [Default service accounts](https://docs.cloud.google.com/build/docs/cloud-build-service-account)
