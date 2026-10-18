# Cloud Run: services, jobs, and revisions

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## What you will learn

Deploy an authenticated container service, inspect its revisions, change concurrency, and run a separate batch job. Use Cloud Shell Bash after the shared setup. You need permission to deploy Cloud Run services and act as the chosen runtime service account. This lab can incur compute, logging, image-storage, and network charges; allow 45 minutes.

A Cloud Run service handles incoming requests using container instances. It has a stable service URL while immutable revisions capture configuration and image changes. A job runs containers to completion and records executions and tasks. A continuously running web server is therefore a poor job container: it never finishes. Conversely, a process that immediately exits cannot serve HTTP traffic.

The service container listens on `0.0.0.0` using the supplied `PORT`. Local filesystem writes are ephemeral and consume instance resources; store durable data externally. Instance reuse is an optimization, not a persistence guarantee. Design handlers for concurrent calls, retries, request deadlines, graceful shutdown, and dependency failures. [Container contract](https://docs.cloud.google.com/run/docs/container-contract)

Concurrency limits how many requests one instance handles at once. Raising it may improve utilization for I/O-bound code but overload CPU-bound code or database connection pools. Autoscaling reacts to demand within configured bounds. Minimum instances trade idle cost for reduced cold starts. Maximum instances limit scale but should not be treated as an absolute spending cap or a perfect downstream connection limit under every rollout condition. Choose request-based or instance-based billing according to processing behavior and current product rules.

## Hands-on: an authenticated service

```bash
gcloud services enable run.googleapis.com iam.googleapis.com
gcloud iam service-accounts create run-lab-runtime \
  --display-name='Cloud Run lab runtime'
export RUN_SA="run-lab-runtime@${PROJECT_ID}.iam.gserviceaccount.com"
gcloud run deploy run-lab \
  --region="$REGION" \
  --image=us-docker.pkg.dev/cloudrun/container/hello \
  --service-account="$RUN_SA" \
  --no-allow-unauthenticated --min-instances=0 --max-instances=2 \
  --concurrency=20 --cpu=1 --memory=256Mi --timeout=30s
export RUN_URL="$(gcloud run services describe run-lab \
  --region="$REGION" --format='value(status.url)')"
curl -i "$RUN_URL"
curl -i -H "Authorization: Bearer $(gcloud auth print-identity-token)" "$RUN_URL"
```

The first request should fail authorization. The second succeeds only if your current user has `roles/run.invoker` on this service, directly or through another role containing the permission. If necessary, an authorized administrator grants that service-level role. Runtime permissions and invoker permissions are separate: attaching a service account does not make incoming requests authenticated, and being an invoker does not grant access to the service's databases.

The Google sample image is convenient for learning. For a controlled production release, deploy your own Artifact Registry image by digest and document its provenance.

## Revisions and traffic

```bash
gcloud run services update run-lab --region="$REGION" \
  --update-env-vars=RELEASE_LABEL=v2 --concurrency=10 --no-traffic
gcloud run revisions list --service=run-lab --region="$REGION"
gcloud run services describe run-lab --region="$REGION" \
  --format='yaml(status.latestCreatedRevisionName,status.latestReadyRevisionName,status.traffic)'
```

Record the old serving revision and new ready revision from this output. Explicitly set `OLD_REVISION` and `NEW_REVISION` to those names, then shift traffic:

```bash
gcloud run services update-traffic run-lab --region="$REGION" \
  --to-revisions="${OLD_REVISION}=90,${NEW_REVISION}=10"
# After comparing error rate and latency, promote:
gcloud run services update-traffic run-lab --region="$REGION" \
  --to-revisions="${NEW_REVISION}=100"
```

A low-volume demo will not necessarily show a precise 90/10 split over a few requests. Use measured samples and production-specific success criteria. Roll back by assigning 100% to the old revision. Configuration rollback does not reverse a schema migration. [Traffic management](https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration)

## A finite job

Use an approved Python image copied into your own Artifact Registry for production. This public sample demonstrates task completion without creating application data:

```bash
gcloud run jobs create run-lab-job --region="$REGION" \
  --image=docker.io/library/python:3.12-slim --service-account="$RUN_SA" \
  --command=python --args='-c,print("job-completed")' \
  --tasks=2 --parallelism=1 --max-retries=1 --task-timeout=60s
gcloud run jobs execute run-lab-job --region="$REGION" --wait
gcloud run jobs executions list --job=run-lab-job --region="$REGION"
```

Expect a successful execution containing two completed tasks. Partition real work using task indexes, persist checkpoints, and make duplicate executions safe. Scheduler can initiate periodic executions, while Workflows can coordinate dependencies.

## Diagnose, clean up, and practice

Failure to listen on `PORT` appears as startup failure; a 403 generally points to IAM or ingress policy; a 429 can indicate capacity limits; an upstream timeout can outlive the caller's patience. Inspect revision logs and metrics before changing multiple settings. Restrict ingress where appropriate, protect secrets through Secret Manager, and keep runtime permissions minimal.

```bash
gcloud run jobs delete run-lab-job --region="$REGION"
gcloud run services delete run-lab --region="$REGION"
gcloud iam service-accounts delete "$RUN_SA"
```

Exercise: estimate database connections for two instances at concurrency 20, then redesign around a fixed connection pool. Compare a two-hour report-generation job with an HTTP endpoint that starts that job and immediately returns a tracking identifier.

## Official references

- [Concurrency](https://docs.cloud.google.com/run/docs/about-concurrency)
- [Authentication](https://docs.cloud.google.com/run/docs/authenticating/overview)
- [Execute jobs](https://docs.cloud.google.com/run/docs/execute/jobs)

