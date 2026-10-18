# gcloud configurations, authentication, ADC, and API inspection

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Use the CLI predictably, identify which credentials a command uses, inspect structured output, and understand client-library authentication. You need project read access and a supported Google Cloud CLI. Use Cloud Shell unless you have deliberately installed a local environment. This exercise lists configuration and resources; it does not deploy infrastructure.

## The three configurations people confuse

The active **gcloud configuration** stores properties such as account, project, region, and zone. Named configurations let you separate environments, but switching configuration does not magically change every application or shell variable. A `--project` flag overrides the relevant command's default project; a local `PROJECT_ID` environment variable changes only when you assign it.

The CLI credential store authenticates `gcloud` calls. **Application Default Credentials** are located by supported libraries using an environment-dependent discovery process. A local ADC login and a CLI login are distinct. In a Google Cloud runtime, an attached service account or federated identity usually provides credentials through the platform. A secret-bearing JSON key is not a prerequisite for automation.

**Authorization** follows authentication. Having a valid token does not grant permissions. The target resource's policy, hierarchy, conditional bindings, deny policies, service perimeter, and relevant API behavior may still block a request. The quota/billing consumer project can also differ from the resource project for some operations.

Access tokens typically call Google APIs. ID tokens identify a caller to an audience, such as an authenticated service endpoint. Swapping them can produce confusing 401 or 403 responses. An ordinary API key often identifies a consumer project and is not interchangeable with user or service-account IAM authentication; use the product's documented method.

## Lab: inspect before you mutate

1. Read your current state:

```bash
gcloud version
gcloud config configurations list
gcloud config list
gcloud auth list --filter=status:ACTIVE --format='table(account,status)'
gcloud projects describe "$PROJECT_ID" --format=json
```

2. Learn help and filtering rather than memorizing every flag:

```bash
gcloud projects describe --help
gcloud services list --enabled --project="$PROJECT_ID" \
  --filter='config.name:compute' --format='value(config.name)'
```

The help pager may require `q` to exit. Structured `json`, `yaml`, `value`, and `table` formats are safer to automate than parsing aligned text with fragile character positions. Filters reduce displayed results; always check whether a command filters client-side or server-side and whether pagination matters.

3. Optionally create a separate CLI configuration for this course. Record the previous active configuration first, then choose a new unused name:

```bash
gcloud config configurations create gcp-study &&
  gcloud config set project "$PROJECT_ID" &&
  gcloud config set compute/region "$REGION" &&
  gcloud config set compute/zone "$ZONE"
```

The `&&` chain applies settings only after configuration creation succeeds, so an existing-name error does not modify the previously active configuration. If `gcp-study` already exists, inspect it before activating it instead of overwriting settings blindly. Explicitly select the intended account if more than one is authenticated.

4. On a local workstation only, if a later client-library tutorial requires ADC, follow `gcloud auth application-default login` in your own browser. Set the ADC quota project only if your permissions and intended billing require it. In Cloud Shell, first use its documented environment authentication rather than redundantly exporting credential files.
5. Write an identity map for a future deployment: your human deployer, the runtime service account, and each service agent. Assign responsibilities, not broad Owner roles.

## Verification and troubleshooting

The CLI output should show the expected project and account, and project description should succeed. If your application fails while `gcloud` succeeds, compare ADC and CLI identity, project, API scope, and quota project. If impersonation fails, check the caller's token-creation permission on the target service account separately from the target account's permission on the resource.

Avoid running `print-access-token` merely to prove authentication: successful authorized API calls are better evidence and do not put tokens on screen. Do not enable shell tracing around credentials. When sharing errors, remove tokens, sensitive request payloads, and private identifiers where appropriate.

## Cleanup and practice

Reactivate your previous named configuration if you created a temporary one, then delete only the temporary configuration if desired. Revoke only credentials you intentionally want removed; do not invalidate a shared working environment without understanding the effect. No paid resources were created.

Practice producing JSON for a resource, selecting one field, and explaining what would change if an explicit `--project` flag differed from your default. Completion evidence is a sanitized identity/configuration diagram and a reproducible read-only command.

## References

- [gcloud configurations](https://docs.cloud.google.com/sdk/docs/configurations)
- [Authentication overview](https://docs.cloud.google.com/docs/authentication)
- [Application Default Credentials](https://docs.cloud.google.com/docs/authentication/application-default-credentials)
- [gcloud formats](https://docs.cloud.google.com/sdk/gcloud/reference/topic/formats)
- [gcloud filters](https://docs.cloud.google.com/sdk/gcloud/reference/topic/filters)
