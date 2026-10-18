# Capstone: a secure serverless order application

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Goal, prerequisites, and scope

Build a small order API that accepts synthetic orders, persists state, and processes a background action safely. This capstone integrates [Cloud Run](../04-compute/03-cloud-run.md), [Firestore](../07-databases/05-firestore.md), [Cloud Tasks](../13-integration/03-cloud-tasks-and-cloud-scheduler.md), [Secret Manager](../02-identity-security/04-secret-manager.md), [Cloud Build](../10-devops/03-cloud-build.md), and [Monitoring](../11-observability-sre/02-cloud-monitoring-and-alerting.md). Complete those tutorials first; they provide foundations and service-specific exercises. This capstone requires implementing the order API, worker, and their integration; the hello container and Firestore client-rule fixture are not that application.

Plan 12–20 focused hours, adjusted to experience. Use a dedicated project, synthetic records, a current cost estimate, and the deployer/runtime permissions from each prerequisite. Managed resources can incur charges even when the application is small. A design-only submission is acceptable when access or budget is unavailable, but label it explicitly and do not claim live validation.

## Architecture and data contract

Use an authenticated Cloud Run API, Firestore for order state, a bounded Cloud Tasks queue, and a separate authenticated Cloud Run worker. The API runtime needs the required Firestore operations and task-enqueue permissions; the worker needs the required job-state operations; the task invocation identity can invoke only the worker. Deployment and build identities remain separate. Firestore server libraries use IAM and bypass Firebase Security Rules. Do not assume a database IAM role limits the API to one collection or to one customer's orders: enforce business authorization and allowed fields in application code, and use separate database/project boundaries where required. The prerequisite's browser-client rules tests do not prove this server-side boundary.

Define an order with `order_id`, `amount_cents`, `status`, `created_at`, `request_key`, and a schema version. A request key must produce one business order even if the client retries. Order status transitions should be explicit: accepted → processing → completed, with a repairable failed state. Do not put a real payment system or email recipient into this learning project.

Close the gap between saving an order and creating its task. A Firestore transaction cannot atomically enqueue a Cloud Task, and transaction callbacks may run more than once. Write the order, request-key mapping, and an outbox record in one transaction. A retryable dispatcher enqueues pending outbox records, and a reconciliation pass finds records missed during an interruption. Task creation can still be repeated after an ambiguous response, so the worker must deduplicate by the durable order/job key. Keep external API calls outside the Firestore transaction callback.

## Build in verifiable stages

1. **Local API:** implement input validation and persistence behind an interface. Add tests for a valid order, invalid amount, missing identifier, duplicate request key, and unauthorized access. Start with an emulator or test double and explain its limits.
2. **Local worker:** implement a simulated fulfillment operation. Commit durable completion before acknowledging success. Inject a failure before and after the state change and show how retries avoid a second business effect.
3. **Infrastructure:** create narrowly scoped service accounts, the database in an appropriate location/mode, queue, artifact repository, and deployment targets using the prerequisite tutorials. Record every created resource in the lab ledger.
4. **Deployment:** build and deploy a versioned image. Use a digest or an immutable release reference. Configure environment values and only necessary secrets through their intended mechanisms; do not bake credentials into the image.
5. **Invocation:** use a permitted identity to create one synthetic order and poll its final status. Invoke the worker through the queue's authenticated delivery path. Confirm that an unauthorized direct request fails.
6. **Observability:** add structured logs containing order/request IDs without customer payloads. Define request success and latency measurements, queue age/backlog monitoring, and a small dashboard. Trigger one controlled failure and verify the signal.
7. **Delivery:** add a build pipeline with unit tests, image creation, and deployment to a test target. Demonstrate a previous revision rollback without losing durable order state.
8. **Recovery:** export or otherwise back up synthetic data using the service's supported method, restore to a disposable target, and verify record counts and status. Document what was and was not included in the recovery.

## Acceptance tests

| Test | Required evidence |
| --- | --- |
| Valid order completes | API response, one stored order, one final business effect |
| Same request sent twice | Same logical result, no duplicate effect |
| API stops after saving the order | Pending outbox record is recovered and dispatched without a second order |
| Worker fails transiently | Retry observed, eventual success or documented terminal failure |
| Unauthorized invocation | Denial at intended boundary |
| Bad release | Failed health/functional check and successful rollback |
| Recovery | Restored synthetic data reconciles to the source |
| Spending control | Resource ledger, estimate, budget alert configuration, cleanup proof |

Performance numbers are measurements, not targets copied from marketing. Record input rate, concurrency, payload size, test duration, latency percentiles, errors, and database behavior. Keep load small enough for your approved budget.

## Troubleshooting and hardening

Separate API authorization, outbox dispatch, task creation, task invocation, worker execution, and database writes when diagnosing a stuck order. A successful enqueue is not successful fulfillment. A Cloud Run maximum-instance setting does not alone bound every downstream operation; reuse Firestore clients, avoid hot documents, and control task dispatch and concurrent writes. Consider timeouts across the whole request chain rather than independently setting each to its maximum.

For production, add lifecycle policies, a data deletion process, abuse controls, change review, dependency updates, and an incident runbook. Explain which additional requirements would justify an external load balancer or API-management layer.

## Cleanup and portfolio

Disable scheduled/event inputs, drain or deliberately discard pending test tasks, remove services/jobs, delete queue/database test data and owned resources, remove images/secrets/temporary IAM, and review billing. Keep source, architecture diagram, decision records, sanitized acceptance-test evidence, runbook, cost assumptions, and limitations. Never publish tokens, credentials, or raw personal data.

## References

- [Cloud Run architecture](https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run)
- [Firestore documentation](https://docs.cloud.google.com/firestore/docs)
- [Firestore server-library security](https://docs.cloud.google.com/firestore/docs/security/iam)
- [Cloud Tasks documentation](https://docs.cloud.google.com/tasks/docs)
- [Architecture Framework](https://docs.cloud.google.com/architecture/framework)
