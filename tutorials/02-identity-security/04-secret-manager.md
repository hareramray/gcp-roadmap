# Secret Manager and credential rotation

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Understand secret resources, immutable payload versions, access boundaries, replication, and the complete rotation lifecycle. Use Cloud Shell Bash and the setup guide's `PROJECT_ID`, `REGION`, and `ZONE`. The inspection lab requires the Secret Manager API and Secret Manager Viewer, or equivalent metadata permissions, on an existing lab secret. Accessing payloads requires the separate Secret Accessor permission; this lesson does not retrieve real payloads. An administrator can supply a synthetic secret for an optional controlled lifecycle exercise. Nothing is deployed automatically.

## Core concepts

A secret resource stores metadata and replication configuration. Secret versions hold payloads; adding a new version does not overwrite the old bytes. Enabled versions are accessible to authorized readers, disabled versions are temporarily unavailable, and destroyed versions have their payload removed according to the service's destruction behavior. Consumers may use version numbers or supported aliases. A stable deployment that pins a version gives predictable rollback, while an unqualified “latest” strategy can unexpectedly change credentials at restart. [Secret Manager overview](https://docs.cloud.google.com/secret-manager/docs/overview).

Use a dedicated runtime identity with Secret Accessor on the specific secret. Metadata viewers and version managers need not also read the payload. Avoid putting secrets in source code, container layers, build arguments, URLs, logs, or command history. Runtime environment injection and mounted secret files have different refresh behavior; read the consuming platform's documentation rather than assuming a version rotation immediately updates every process. [Secret Manager best practices](https://docs.cloud.google.com/secret-manager/docs/best-practices).

Replication location is a design decision involving availability, service support, and data requirements. CMEK adds key lifecycle and permission dependencies; it does not eliminate the need to control secret access. Applications should cache appropriately to reduce latency and dependency load, but a long cache can delay revocation. Define how a process responds when access is denied or the secret service is temporarily unavailable.

## Lab: inspect and rehearse a rotation

1. Inventory metadata only:

   ```bash
   gcloud secrets list --project="$PROJECT_ID" \
     --format='table(name,createTime,replication)'
   export SECRET_ID='replace-with-approved-lab-secret'
   gcloud secrets describe "$SECRET_ID" --project="$PROJECT_ID" --format=yaml
   gcloud secrets versions list "$SECRET_ID" --project="$PROJECT_ID" \
     --format='table(name,state,createTime,destroyTime)'
   ```

   Expected output is metadata, not credentials. If no lab secret exists, complete the following steps using the example version table locally.

2. Construct a fictional version table: version 1 is the current database password; version 2 is a newly issued password; version 3 is absent. List the database credential state independently of Secret Manager. Adding version 2 to Secret Manager does **not** change the password accepted by the database.

3. Write a rotation runbook: generate a replacement credential at the source system, allow overlap if supported, publish the new secret version, deploy or reload consumers, validate successful authentication, revoke the old credential at the source, then disable the obsolete secret version. Add a rollback branch before revocation. Where overlap is impossible, plan a coordinated change window.

4. Define four tests: a new process authenticates with version 2; an existing process refreshes as designed; failed authentication never logs the password; and version 1 stops working after revocation. Record which logs or metrics prove each result without recording payloads.

5. Inspect the secret policy:

   ```bash
   gcloud secrets get-iam-policy "$SECRET_ID" \
     --project="$PROJECT_ID" --format=json > secret-policy.json
   ```

   Identify the application reader, rotation worker, and administrator separately. Include inherited project grants when assessing who can read the secret. Removing a secret-level binding does not revoke inherited access.

6. Design an automated rotation trigger. Secret Manager rotation schedules generate notifications that your automation must process; they do not independently change a password in an external database. Include idempotency, retries, concurrency protection, a dead-letter or operator path, and notification delivery permission. [Rotation schedules](https://docs.cloud.google.com/secret-manager/docs/secret-rotation).

## Verification and troubleshooting

Success is a runbook with no interval where all consumers lose the only valid credential. A missing version, disabled version, wrong secret project, inherited deny, unavailable KMS key, or stale application cache can each produce different failures. Check identity and exact resource name before changing permissions. Never replace narrow Secret Accessor with project Owner to bypass a problem.

## Cleanup, cost, and exercises

The inspection has created no cloud resources. Delete local policy exports when finished. Real secrets can incur charges for active versions, accesses, replication options, and related KMS or notification operations; review current pricing before a live exercise. Do not destroy an existing version during training. As an extension, design rotation for a third-party API that supports only one active key, and explain the resulting availability tradeoff and recovery procedure.

