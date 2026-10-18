# Cloud Deploy: promotion, approval, canary, and rollback

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Delivery objects and responsibilities

Cloud Build creates and tests artifacts. Cloud Deploy delivers a selected release through defined targets. A delivery pipeline describes progression; a target identifies an environment; a release captures deployable content; a rollout represents deployment of that release to a target. Skaffold renders manifests and drives supported deployment operations. Keep build identity, deployment identity, runtime identity, and approver identity distinct. [Cloud Deploy concepts](https://docs.cloud.google.com/deploy/docs/overview)

This is a **gated cloud lab**: prepare files locally first, then execute only in an authorized disposable project with the required IAM configured. Use Cloud Shell Bash and the shared setup. It can create two Cloud Run services plus Cloud Deploy, Cloud Build, artifact storage, and logs. Allow 90 minutes. An approval requirement here is a product feature you configure for the lab, not a request for the assistant to perform a deployment.

## Prerequisites and release identity

Enable Cloud Deploy, Cloud Run, Cloud Build, and Artifact Registry APIs. Create a deployment execution service account with Cloud Deploy Job Runner, Cloud Run Developer, required access to release artifacts, and Service Account User on the intended runtime account. Configure service-agent impersonation as required by the execution-environment guide. Your caller needs permissions to register pipelines and create releases; a separate approver needs the appropriate approval permission. Use a reviewed image digest from the container/build tutorials.

```bash
: "${DEPLOY_SA:?Set the authorized Cloud Deploy execution account email}"
: "${RUNTIME_SA:?Set the minimally privileged Cloud Run runtime account email}"
: "${RELEASE_IMAGE:?Set a complete Artifact Registry image reference with @sha256 digest}"
mkdir -p "$HOME/gcp-roadmap-labs/cloud-deploy"
cd "$HOME/gcp-roadmap-labs/cloud-deploy"
```

For a tutorial, dev and prod are separate service names in the same disposable project. Real environments normally need stronger isolation, often separate projects and execution accounts. The label `prod` does not itself provide any isolation.

## Prepare target-specific manifests

```bash
for STAGE in dev prod; do
cat > "run-$STAGE.yaml" <<EOF
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: delivery-lab-$STAGE
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: '2'
    spec:
      serviceAccountName: $RUNTIME_SA
      containers:
      - image: app-image
        ports:
        - containerPort: 8080
EOF
done
cat > skaffold.yaml <<'EOF'
apiVersion: skaffold/v4beta7
kind: Config
metadata:
  name: delivery-lab
profiles:
- name: dev
  manifests:
    rawYaml: [run-dev.yaml]
- name: prod
  manifests:
    rawYaml: [run-prod.yaml]
deploy:
  cloudrun: {}
EOF
cat > clouddeploy.yaml <<EOF
apiVersion: deploy.cloud.google.com/v1
kind: DeliveryPipeline
metadata:
  name: delivery-lab
serialPipeline:
  stages:
  - targetId: delivery-dev
    profiles: [dev]
  - targetId: delivery-prod
    profiles: [prod]
---
apiVersion: deploy.cloud.google.com/v1
kind: Target
metadata:
  name: delivery-dev
run:
  location: projects/$PROJECT_ID/locations/$REGION
executionConfigs:
- usages: [RENDER, DEPLOY]
  serviceAccount: $DEPLOY_SA
---
apiVersion: deploy.cloud.google.com/v1
kind: Target
metadata:
  name: delivery-prod
requireApproval: true
run:
  location: projects/$PROJECT_ID/locations/$REGION
executionConfigs:
- usages: [RENDER, DEPLOY]
  serviceAccount: $DEPLOY_SA
EOF
```

The placeholder image is replaced with the immutable release reference. Inspect rendered output for environment mistakes, accidental public exposure, excessive resources, and wrong runtime identities. The manifests do not grant anonymous invocation. Verify that the selected Skaffold API version remains supported by Cloud Deploy before executing a maintained pipeline. [Cloud Run delivery quickstart](https://docs.cloud.google.com/deploy/docs/deploy-app-run)

## Create, verify, and promote

```bash
gcloud deploy apply --file=clouddeploy.yaml --region="$REGION"
gcloud deploy releases create release-001 \
  --delivery-pipeline=delivery-lab --region="$REGION" \
  --images="app-image=$RELEASE_IMAGE"
gcloud deploy rollouts list --delivery-pipeline=delivery-lab \
  --release=release-001 --region="$REGION"
```

Expect rendering and a first rollout to the dev target. Wait for success, inspect the Cloud Run revision's image digest, and run an authenticated smoke test. A deploy operation completing does not prove business correctness. Record release name, digest, source commit, test evidence, and environment.

```bash
gcloud deploy releases promote --release=release-001 \
  --delivery-pipeline=delivery-lab --region="$REGION" \
  --to-target=delivery-prod
gcloud deploy rollouts list --delivery-pipeline=delivery-lab \
  --release=release-001 --region="$REGION"
```

The production rollout should wait for approval. An authorized approver reviews evidence and approves the specific rollout in the console or with `gcloud deploy rollouts approve`. Approval records responsibility; it is not a substitute for automated testing. Denied or stale evidence should stop progression.

## Canary and rollback exercise

After establishing a successful baseline, configure a canary strategy for the production stage following the Cloud Run canary guide. Define percentages such as 10 and 50, observation duration, minimum request count, error-rate and latency thresholds, and who advances or aborts phases. The first deployment has no previous revision to split against, so canary phases can be skipped. Test canary behavior on a second release. [Cloud Run canaries](https://docs.cloud.google.com/deploy/docs/deployment-strategies/canary/cloud-run)

Rollback creates a rollout of a previously successful release to the affected target. Keep its image and configuration available. Database migrations, messages, emails, and other external side effects are not undone by reverting a container. Use backward-compatible schema changes and compensating operations where necessary.

## Troubleshooting and cleanup

A render failure points toward Skaffold/manifests or artifact access; a deploy failure can involve target IAM, runtime-account actAs, image access, or invalid Cloud Run configuration. An approval wait is expected state, not a hung build. Inspect the rollout's associated build logs before retrying.

Delete both lab Cloud Run services, then delete the delivery pipeline with its releases/rollouts and the two lab targets using the documented console or CLI deletion workflow. Remove only lab-specific artifact objects after checking retention requirements. Do not delete shared execution accounts or shared buckets. Exercise: simulate a release that passes startup but fails a business smoke test, and document exactly where promotion stops.

## Official references

- [Configuration schema](https://docs.cloud.google.com/deploy/docs/config-files)
- [Execution environments](https://docs.cloud.google.com/deploy/docs/execution-environment)
- [Roll back a target](https://docs.cloud.google.com/deploy/docs/roll-back)

