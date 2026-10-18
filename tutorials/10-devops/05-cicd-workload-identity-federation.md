# Keyless external CI with Workload Identity Federation

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Trust model

External CI needs an identity, not a permanent Google service-account key. An OIDC-capable CI system issues a short-lived token containing claims about the running job. A workload identity provider verifies the issuer, audience, and claim conditions. Security Token Service exchanges the accepted assertion for Google credentials. The federated principal can access supported resources directly or impersonate a narrowly scoped service account. [Federation overview](https://docs.cloud.google.com/iam/docs/workload-identity-federation)

The critical question is which jobs you trust. An issuer such as GitHub hosts many unrelated organizations. Trusting its issuer alone is far too broad. Bind numeric owner/repository identifiers and constrain branch, event, workflow, or protected environment as required. Names can be renamed or reused; stable numeric IDs reduce that ambiguity. A branch named `main` in an attacker's repository is not your trusted branch.

This is a **gated integration lab** requiring a GitHub repository you administer and an authorized disposable Google Cloud project. Use Cloud Shell Bash for setup, and GitHub Actions for the workflow. No workflow is sent or run by these documentation files. Allow one hour. The identity configuration does not provision compute, but CI execution and any accessed resources can carry charges.

## Prepare a read-only proof

Choose an existing empty lab bucket and set `CI_BUCKET` to its name. Obtain your repository's numeric `repository_id` and owner's numeric `repository_owner_id` from GitHub's API or repository metadata; do not substitute the text name. An administrator needs Workload Identity Pool Admin plus permissions to create and authorize the lab service account.

```bash
export GH_OWNER_ID='REPLACE_WITH_NUMERIC_OWNER_ID'
export GH_REPOSITORY_ID='REPLACE_WITH_NUMERIC_REPOSITORY_ID'
: "${CI_BUCKET:?Set the authorized test bucket name without gs://}"
gcloud services enable iam.googleapis.com iamcredentials.googleapis.com \
  sts.googleapis.com cloudresourcemanager.googleapis.com
export PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
gcloud iam workload-identity-pools create ci-lab --location=global \
  --display-name='Roadmap external CI lab'
gcloud iam workload-identity-pools providers create-oidc github-lab \
  --location=global --workload-identity-pool=ci-lab \
  --issuer-uri='https://token.actions.githubusercontent.com' \
  --attribute-mapping='google.subject=assertion.sub,attribute.repository_id=assertion.repository_id,attribute.repository_owner_id=assertion.repository_owner_id,attribute.ref=assertion.ref,attribute.event_name=assertion.event_name' \
  --attribute-condition="assertion.repository_owner_id=='${GH_OWNER_ID}' && assertion.repository_id=='${GH_REPOSITORY_ID}' && assertion.ref=='refs/heads/main' && assertion.event_name=='push'"
gcloud iam service-accounts create ci-lab-reader
export CI_SA="ci-lab-reader@${PROJECT_ID}.iam.gserviceaccount.com"
gcloud iam service-accounts add-iam-policy-binding "$CI_SA" \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/ci-lab/attribute.repository_id/${GH_REPOSITORY_ID}"
gcloud storage buckets add-iam-policy-binding "gs://$CI_BUCKET" \
  --member="serviceAccount:$CI_SA" --role=roles/storage.objectViewer
```

The provider condition rejects other repositories, owners, branches, and event types. The service-account binding authorizes impersonation; the bucket binding authorizes the resulting API operation. Neither grant alone completes the chain. Propagation can take time; avoid responding to a transient failure by widening the trust policy. [Deployment-pipeline federation](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines)

## Prepare the workflow

Set repository variables `GCP_PROJECT_ID`, `WIF_PROVIDER`, `CI_SERVICE_ACCOUNT`, and `CI_BUCKET`. The provider value has the form `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/ci-lab/providers/github-lab`. These identifiers are not private keys.

```yaml
name: keyless-cloud-read
on:
  push:
    branches: [main]
permissions:
  contents: read
  id-token: write
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: google-github-actions/auth@v3
      with:
        project_id: ${{ vars.GCP_PROJECT_ID }}
        workload_identity_provider: ${{ vars.WIF_PROVIDER }}
        service_account: ${{ vars.CI_SERVICE_ACCOUNT }}
    - uses: google-github-actions/setup-gcloud@v3
    - name: List authorized bucket
      env:
        CI_BUCKET: ${{ vars.CI_BUCKET }}
      run: gcloud storage ls "gs://$CI_BUCKET"
```

Before production use, replace action tags with reviewed full commit SHAs and update them through a controlled process. `id-token: write` allows requesting an OIDC token; it does not itself grant write access to Google Cloud. The authentication action creates short-lived credential configuration used by supported tools. Use `gcloud storage` rather than assuming every older storage client consumes those credentials identically. [Authentication action](https://github.com/google-github-actions/auth)

## Verify success and intentional denial

Push a harmless change to the authorized main branch after reviewing the workflow. Expect an empty successful bucket listing. Test a copied workflow on a non-authorized branch or event and expect federation rejection. This negative test is essential: a broad trust policy also passes a positive test. Inspect audit logs for the federated subject and impersonated account without printing tokens.

For production delivery, use separate service accounts and trust conditions per environment. Protect workflow files and release branches, require appropriate environment approvals, and prevent untrusted pull-request code from executing with deployment credentials. Short-lived credentials reduce secret persistence, but compromised trusted workflow code can still use its active privileges.

## Troubleshooting and cleanup

An audience error points to the provider resource or token audience. A condition rejection points to claim mismatch. Impersonation denial points to the service-account policy or principal identifier. A later bucket 403 points to resource permissions. Diagnose those stages separately and never paste raw OIDC tokens into an issue.

Disable or remove the lab workflow before removing the provider. Remove the bucket IAM binding, delete the lab service account, then delete the `ci-lab` pool once no other lab uses it. Deleting a pool affects its providers; inventory dependencies first. Exercise: extend the trust policy to a protected production environment and explain how GitHub changes the subject claim when environments are used.

## Official references

- [Workload identity security practices](https://docs.cloud.google.com/iam/docs/best-practices-for-using-workload-identity-federation)
- [GitHub OIDC documentation](https://docs.github.com/en/actions/concepts/security/openid-connect)
- [Set up gcloud action](https://github.com/google-github-actions/setup-gcloud)

