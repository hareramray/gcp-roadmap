# Workflows and reliable service orchestration

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Deploy a small workflow, pass runtime arguments, inspect execution results, and design retries and compensation. Complete IAM and basic YAML/JSON. Enable the Workflows and Executions APIs. The deployer needs workflow administration and permission to act as the runtime service account; executing needs the appropriate invocation permission. This tiny lab can incur execution charges. It does not call external business systems.

## Concepts

Orchestration makes the sequence of a process explicit: validate, call a service, wait, branch, retry, and produce a result. Choreography distributes reactions among event consumers. Both can work; choose based on visibility, coupling, ownership, and recovery needs. Workflows is useful for coordinating services, while substantial application logic belongs in code owned by the relevant service.

A workflow definition is versioned configuration; an execution is one run with its own input and state. Connectors simplify supported Google API calls, but their availability does not grant permissions. The workflow's runtime identity needs access to every called resource. Calling Google APIs and invoking an authenticated HTTP application can require different authentication mechanisms.

A workflow spanning multiple services is not automatically a distributed database transaction. If payment succeeds and shipping fails, an application-specific compensating action might refund or hold the order. Compensation can fail too; record state, retry deliberately, and provide an operator repair path. Do not blindly retry non-idempotent business operations.

## Lab: deploy a deterministic decision workflow

Use an unused service-account name. The sample performs only arithmetic and branching, so the runtime account needs no application data roles.

```bash
gcloud services enable workflows.googleapis.com workflowexecutions.googleapis.com \
  iam.googleapis.com --project="$PROJECT_ID"
gcloud iam service-accounts create gcp-study-workflow --project="$PROJECT_ID" \
  --display-name='Study workflow runtime'
export WORKFLOW_SA="gcp-study-workflow@${PROJECT_ID}.iam.gserviceaccount.com"
cat > study-workflow.yaml <<'YAML'
main:
  params: [input]
  steps:
    - validate:
        switch:
          - condition: ${input.amount_cents < 0}
            next: reject
    - accept:
        return:
          order_id: ${input.order_id}
          amount_cents: ${input.amount_cents}
          status: accepted
    - reject:
        raise: "amount_cents must be non-negative"
YAML
gcloud workflows deploy gcp-study-workflow --source=study-workflow.yaml \
  --service-account="$WORKFLOW_SA" --location="$REGION" --project="$PROJECT_ID"
gcloud workflows run gcp-study-workflow --location="$REGION" \
  --data='{"order_id":"sample-1","amount_cents":1250}' --project="$PROJECT_ID"
```

Expected result: a successful execution returning the supplied order ID and amount with `status: accepted`. Then run with `amount_cents: -1` and expect a failed execution carrying your validation error. Missing fields or wrong types are not fully handled in this intentionally small schema; record how you would add input validation before production use.

Open the workflow's Executions view and inspect both runs. Distinguish user input, step failure, runtime error, and deployment syntax error. Do not include secrets or full customer records in execution inputs merely because the workflow can carry JSON.

## Extend the design

Add a paper step that calls an authenticated Cloud Run inventory service. Specify the runtime identity's invoker permission, intended audience, timeout, idempotency key, and bounded retry conditions. A 400 caused by invalid data should not receive the same retry policy as a transient 503. When a connector starts a long-running operation, inspect its waiting/polling behavior and cost rather than building an uncontrolled tight loop.

For human approval, model a secured callback with an expiration and audit trail. For parallel work, define a maximum concurrency and how partial failures affect the final result. A loop over millions of records may belong in a data-processing service rather than workflow steps.

## Verification and troubleshooting

Check execution state, result/error, runtime identity, region, and logs. A permission failure inside a successful deployment usually concerns the runtime account or target resource. A failed deployment may concern your deployer permissions or YAML expressions. If execution retries create duplicate side effects, fix idempotency and business state handling before increasing retry counts.

## Cleanup and exercises

```bash
gcloud workflows delete gcp-study-workflow --location="$REGION" --project="$PROJECT_ID"
gcloud iam service-accounts delete "$WORKFLOW_SA" --project="$PROJECT_ID"
```

Remove the local YAML only if you do not want it as evidence. Preserve a sanitized success/failure pair and a compensation diagram. Explain why Workflows, Airflow, and Cloud Tasks are different: service-process orchestration, data-pipeline scheduling/dependencies, and explicit asynchronous task dispatch address different needs.

## References

- [Workflows overview](https://docs.cloud.google.com/workflows/docs/overview)
- [Workflow syntax](https://docs.cloud.google.com/workflows/docs/reference/syntax)
- [Workflow authentication](https://docs.cloud.google.com/workflows/docs/authentication)
- [Retry steps](https://docs.cloud.google.com/workflows/docs/reference/syntax/retrying)
