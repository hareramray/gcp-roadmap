# Cloud Tasks, Cloud Scheduler, retries, and background jobs

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Choose between explicit task dispatch, recurring scheduling, and event distribution. Configure a bounded queue and design an authenticated scheduled invocation. Complete IAM, HTTP, and idempotency basics. Queue creation and scheduled jobs require the relevant admin permissions and APIs; processing, targets, logs, and Scheduler jobs can incur charges. The scheduler portion is a design exercise unless you already have an approved test target.

## Concepts

Cloud Tasks is useful when your application explicitly creates work for a particular supported handler and needs dispatch rate, retry, or scheduling controls. Pub/Sub is useful for distributing messages to independently managed subscribers. Cloud Scheduler starts work on a cron-style schedule. None of these choices removes the need for idempotency, deadlines, monitoring, and graceful failure handling.

A queue's dispatch rate and concurrency protect the downstream service. A worker acknowledges successful HTTP task handling with the expected success response. A failed or timed-out request can be retried, so the worker must not assume the previous attempt had no effect. Task-name-based deduplication is bounded by documented behavior and does not replace permanent business idempotency.

Scheduler jobs can use HTTP or other supported targets with appropriate authentication. An OIDC token suits many authenticated HTTP applications; a Google API target may require OAuth. The invoking service account needs target access, while the person creating the job needs the relevant deployment permissions. A timezone is part of the schedule: use `Asia/Kolkata` for Indian civil time, or UTC when you want a schedule independent of daylight-saving changes elsewhere.

## Lab: create a tightly bounded queue

```bash
gcloud services enable cloudtasks.googleapis.com --project="$PROJECT_ID"
gcloud tasks queues create gcp-study-queue --location="$REGION" \
  --max-dispatches-per-second=1 --max-concurrent-dispatches=1 \
  --max-attempts=3 --min-backoff=10s --max-backoff=60s \
  --project="$PROJECT_ID"
gcloud tasks queues describe gcp-study-queue --location="$REGION" \
  --project="$PROJECT_ID"
```

Inspect the rate limits and retry configuration. No tasks have been created yet. The chosen limits are for learning, not a universal production recommendation. Maximum attempts and retry-duration interactions should be checked in the current queue reference; do not use an assumed retry bound as your only spending control.

Design a worker input such as `{"job_id":"invoice-42","amount_cents":1250}`. Its durable state machine should distinguish pending, processing, completed, and failed/repairable work. Two attempts with `job_id: invoice-42` must not issue two invoices. The handler should validate the invoking identity and payload, avoid logging financial details, and return success only after the intended durable effect is established.

For an optional managed dispatch test, adapt the authenticated Cloud Run service from its tutorial into a handler that validates the task payload and implements the durable state machine. The tutorial's hello container proves connectivity only; it does not implement invoice processing or a controlled retry failure. Follow the HTTP task creation guide to create exactly one task with a dedicated invocation service account in the queue's project. The enqueuer needs permission to create tasks and `iam.serviceAccounts.actAs` on that account; the account needs Cloud Run Invoker on the target. Verify the Cloud Tasks service agent retains `roles/cloudtasks.serviceAgent` and has the documented service-account access needed to generate authentication tokens. Set the audience to the intended service URL according to the target's authentication requirements. Make the test handler fail once before succeeding, observe retries, and verify a single business effect; do not generate a large backlog.

## Scheduler design exercise

Write a job specification for a daily report at 09:00 India time: cron `0 9 * * *`, timezone `Asia/Kolkata`, authenticated target, small synthetic input, bounded attempt deadline, and owner. Define what happens if yesterday's job is still running. Include a run key based on the reporting date so retries do not create duplicate reports.

Use the console creation flow to inspect fields without saving if you do not have a target. For an actual lab job, enable `cloudscheduler.googleapis.com` and use a dedicated caller service account belonging to the Scheduler job's project. The job creator needs `iam.serviceAccounts.actAs` on that account, and the account needs the target's invocation permission. Keep the Google-managed Scheduler service agent separate and retain its `roles/cloudscheduler.serviceAgent` role so it can mint tokens. Set an OIDC audience without query parameters where required by the target. Create the job with the exact intended timezone, invoke it once manually, inspect execution logs and target behavior, then pause/delete it immediately after verification. A scheduled job that remains enabled is ongoing infrastructure even if you forget about it.

## Verification and troubleshooting

Distinguish enqueue success from successful business processing. Inspect queue depth/oldest task age, attempts, target status, and durable job state. A 403 often points to token audience, invoker permissions, or identity setup. Repeated 5xx may indicate a poison task, overload, or unavailable dependency. Throttling protects the target but can increase backlog latency.

## Cleanup and exercises

```bash
gcloud tasks queues delete gcp-study-queue --location="$REGION" --project="$PROJECT_ID"
```

Delete or pause any Scheduler job you actually created, remove test targets and identity grants, and inspect whether pending tasks were discarded. Queue deletion/recreation has documented restrictions; use distinct names rather than assuming instant recreation is always allowed. Completion evidence is the queue configuration, worker state machine, schedule spec, and a retry timeline. Compare a payment task, broadcast event, nightly report, and multi-step approval workflow.

## References

- [Cloud Tasks overview](https://docs.cloud.google.com/tasks/docs/dual-overview)
- [Create HTTP tasks](https://docs.cloud.google.com/tasks/docs/creating-http-target-tasks)
- [Queue configuration](https://docs.cloud.google.com/tasks/docs/configuring-queues)
- [Cloud Scheduler overview](https://docs.cloud.google.com/scheduler/docs/overview)
- [Scheduler authentication](https://docs.cloud.google.com/scheduler/docs/http-target-auth)
