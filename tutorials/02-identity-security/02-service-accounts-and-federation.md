# Service accounts, ADC, impersonation, and federation

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Design a credential flow for a developer, a Google Cloud runtime, an external build system, and an employee using an external identity provider. The read-only Cloud Shell lab uses `PROJECT_ID`, `REGION`, and `ZONE` from the setup guide. Listing service accounts needs `iam.serviceAccounts.list`; reading their policies needs `iam.serviceAccounts.getIamPolicy`. The optional impersonation check needs Service Account Token Creator on a designated **existing lab service account**, the IAM Credentials API, and whatever resource-read role that account needs. Do not create downloaded private keys.

## Four different identity problems

A service account is both an identity and a resource with its own IAM policy. A role granted **to** the service account controls what it can do. A role granted **on** the service account controls who can use or administer it. Service Account User permits attachment in supported deployment workflows; it is different from Token Creator, which permits obtaining short-lived credentials. Scope both carefully because attaching a privileged identity can create an escalation path.

Application Default Credentials (ADC) is a discovery mechanism used by client libraries. It can locate configured credentials, a local ADC file, or an attached runtime identity. The active `gcloud` login and a local ADC file are different credential stores. An environment variable pointing at an old credential file can override the intended identity. On Google Cloud, prefer the runtime's attached identity; locally, prefer approved user credentials or supported impersonated ADC. [ADC discovery](https://docs.cloud.google.com/docs/authentication/application-default-credentials).

Workload Identity Federation is for software outside Google Cloud. An external assertion is exchanged through Security Token Service; access can be granted directly to a federated principal or through service-account impersonation when required. Bind an immutable repository or workload identity and restrict issuer, audience, and attributes. Trusting every identity in a pool is rarely appropriate. [Workload Identity Federation](https://docs.cloud.google.com/iam/docs/workload-identity-federation).

Workforce Identity Federation is for people using an external identity provider. It does not create a service account per employee, and its product compatibility must be checked. A workforce user project can supply quota and billing context for client-based APIs. [Workforce Identity Federation](https://docs.cloud.google.com/iam/docs/workforce-identity-federation).

## Lab: inspect identity boundaries

1. Inventory service accounts without displaying any credential:

   ```bash
   gcloud iam service-accounts list --project="$PROJECT_ID" \
     --format='table(email,disabled,displayName)'
   ```

2. Set `SA_EMAIL` to an existing disposable lab account supplied by your administrator. Inspect who can impersonate or attach it:

   ```bash
   export SA_EMAIL='replace-with-lab-account@example-project.iam.gserviceaccount.com'
   gcloud iam service-accounts get-iam-policy "$SA_EMAIL" \
     --project="$PROJECT_ID" --format=json > sa-policy.json
   gcloud iam service-accounts keys list --iam-account="$SA_EMAIL" \
     --project="$PROJECT_ID" --format='table(name,keyType,validAfterTime,validBeforeTime)'
   ```

   Key listing needs its own permission. Distinguish Google-managed keys from user-managed keys; do not delete either in this inspection exercise.

3. Inspect project bindings for that account with `gcloud projects get-iam-policy "$PROJECT_ID" --format=json`. Document its runtime powers separately from the principals allowed to impersonate it. Include resource-level and inherited policies in a real audit.

4. If the optional prerequisites are satisfied, run a read that the account is explicitly allowed to perform:

   ```bash
   gcloud projects describe "$PROJECT_ID" \
     --impersonate-service-account="$SA_EMAIL" --format='value(projectId)'
   ```

   Expected output is the project ID. Failure can be legitimate: Token Creator allows credential creation but does not grant the impersonated account project visibility. Avoid printing access tokens to diagnose this.

5. Draw a build flow with five labeled stages: trusted CI job, signed identity assertion, workload pool/provider, federated or impersonated principal, deployment resource. Define a negative case from a forked repository. The expected decision must be denial before deployment permissions are usable.

6. Draw the employee flow independently. Record IdP offboarding, group synchronization, session lifetime, MFA responsibility, and emergency access. A valid federation handshake is insufficient if an old privileged group remains mapped.

## Verification, cleanup, and practice

Your evidence should identify the caller and resulting principal without exposing secrets. Diagnose `invalid audience` as a trust-configuration issue, permission errors as an IAM/resource issue, and unexpected identities as a credential-selection issue. Check product support before replacing every integration with direct federation. [Federation compatibility](https://docs.cloud.google.com/iam/docs/federated-identity-supported-services).

The lab creates no cloud resources. Remove local policy exports; do not delete existing keys or accounts. For an extension, design a key retirement plan with inventory, application owners, federation rollout, overlapping verification, revocation, and audit evidence. Explain how disabling a service account affects workloads and why that can be an incident-response action requiring coordination.

