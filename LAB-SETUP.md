# Shared lab setup, access, costs, and cleanup

[Home](README.md) · [Learning sequence](ROADMAP.md)

Read this before any deployment tutorial. These instructions prepare a disposable learning environment; they are not a production landing zone. No command in this document has been executed against your account while creating this repository.

## 1. Choose an execution environment

The default is **Google Cloud Shell**, opened from the terminal icon in the Google Cloud console. It runs Linux and Bash and includes common Cloud tools. Complete its authorization prompt only in your own account. On Windows you can read the Markdown locally and execute examples in Cloud Shell. Bash constructs such as `export`, `$(...)`, backslash line continuation, and `cat <<'EOF'` are not PowerShell syntax.

If working locally, install the supported Google Cloud CLI and use Bash through WSL or another suitable environment. Install tutorial-specific tools only when needed. Check the local versions of `gcloud`, `python3`, `git`, `docker`, `terraform`, `kubectl`, and `bq`; Cloud Shell image versions change. Cloud Shell is a development workspace, not an always-on application host, private-network jump host, or production scheduler. Its network is not automatically inside your VPC.

## 2. Create or select a learning project

In the console, choose an account you control, create a project with a unique ID, and associate the appropriate billing account if a tutorial requires billing. The project display name, project ID, and numeric project number are different identifiers. In an organization, creation, billing linkage, location selection, API enablement, and IAM changes may require an administrator.

Do not grant yourself broad production permissions to make a tutorial work. Ask for the narrow relevant permission or use a separate approved lab. Organization-only topics offer design exercises if you do not have an organization. No tutorial requires creating a company identity tenant just to read it.

## 3. Establish a cost boundary you understand

Open Billing → Budgets & alerts. Create a budget scoped to your learning project, choose an amount you can afford, add threshold notifications, and confirm who receives them. A budget is **not a hard spending cap** and notifications can lag. Review the pricing calculator before resources with standing charges, including databases, GKE, load balancers, NAT, endpoints, accelerators, and enterprise products. Free-tier eligibility is service-, region-, account-, and usage-dependent.

Maintain a small resource ledger with name, region, owner, creation time, intended deletion time, and cleanup command. Check Billing reports after labs; usage reporting is not instantaneous. Lower quotas where appropriate, but do not assume quotas cover every possible billable SKU. A disabled API is not a universal resource cleanup mechanism.

## 4. Set shared variables in Bash

Replace the example project ID. `us-central1` is only a teaching default; choose a supported location that meets your requirements. A service's multi-region or global location is not interchangeable with a compute region.

```bash
export PROJECT_ID='replace-with-your-lab-project-id'
export REGION='us-central1'
export ZONE='us-central1-a'
export LAB_PREFIX='gcp-study'

gcloud config set project "$PROJECT_ID"
gcloud config set compute/region "$REGION"
gcloud config set compute/zone "$ZONE"
gcloud auth list --filter=status:ACTIVE --format='value(account)'
gcloud projects describe "$PROJECT_ID" \
  --format='yaml(projectId,projectNumber,lifecycleState)'
export PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
```

Check that the displayed account and project are correct. An empty project number means stop and investigate. The prefix does not make a name globally unique; bucket names and other global names need additional uniqueness. Most tutorial commands specify their project or inherit this active configuration. Recheck it after switching environments or accounts. Where a tutorial uses a different variable name, follow its local setup and keep the value consistent with this environment.

## 5. Understand credentials and permissions

`gcloud` CLI credentials and Application Default Credentials (ADC) are separate configurations. Locally, `gcloud auth login` authorizes CLI use; `gcloud auth application-default login` configures developer ADC for supported client libraries. Cloud Shell often already supplies the relevant environment credentials. Do not copy credential files between machines or upload them to repositories. Prefer attached service accounts in Google Cloud and federation for external workloads.

The operator identity deploys resources. A runtime identity runs an application. A Google-managed service agent performs service operations. These identities need different permissions. A deployer may need `iam.serviceAccounts.actAs` on a chosen runtime account; that is separate from the runtime account's data permissions. Each tutorial names the relevant roles or permissions, but organization deny policies, service perimeters, API restrictions, and billing state can independently block an action.

Enable only required APIs, for example:

```bash
gcloud services enable compute.googleapis.com --project="$PROJECT_ID"
gcloud services list --enabled --project="$PROJECT_ID" \
  --format='table(config.name)'
```

API enablement requires Service Usage permissions and can create service identities. It does not grant you the right to use every resource in that API.

## 6. Run a lab in four stages

For a tutorial that generates standalone sample files, start in a fresh local directory so commands such as `cat > sample.json` do not overwrite earlier work:

```bash
export LAB_WORKDIR="$(mktemp -d "$HOME/gcp-study.XXXXXX")"
cd "$LAB_WORKDIR" || exit 1
```

If the tutorial creates its own temporary directory or explicitly works inside an existing sample repository, follow that tutorial's directory instructions instead. Keep the working path in your resource ledger; local files and cloud resources need separate cleanup.

1. **Plan:** read prerequisites, choose names and locations, estimate charges, identify data and identity boundaries.
2. **Build:** run one command or console operation at a time. Save non-secret configuration and sanitized output.
3. **Verify:** prove both expected success and an intentional denial or failure. Distinguish control-plane configuration from actual data-plane behavior.
4. **Clean up:** delete resources in reverse dependency order and verify deletion. Preserve only artifacts you intentionally want, with an owner and expiry.

Some walkthroughs are console-based because enterprise topology, region, edition, or provider configuration differs. Follow the named product page and verify the resulting settings rather than assuming console labels never move. Design exercises should be completed in writing; paid provisioning is an optional separate step.

## 7. Cleanup checklist

- Stop applications and scheduled invocations; remove event triggers before their destinations.
- Delete clusters, VMs, managed instance groups, jobs, services, databases, model endpoints and unused disks.
- Delete load-balancer forwarding rules and dependent proxies, backend services, health checks, certificates, and reserved IPs that belong to the lab.
- Delete NAT configurations, routers, VPN objects and unused network attachments before subnets and VPCs.
- Remove sample data, object versions where applicable, snapshots, image repositories, temporary datasets, and retained logs that you do not need.
- Remove temporary IAM grants, service accounts, secrets and federated trust created for the exercise.
- Check retention locks, deletion protection, organization policies, and asynchronous deletion before assuming cleanup completed.
- Review billing and your resource ledger. A stopped VM can still have chargeable disks or IP resources; a scaled-to-zero service can still leave data and images.

Deleting a dedicated project is a final cleanup option **only after reviewing everything inside it**. It is destructive and may affect shared integrations. Follow the official project shutdown workflow manually; this course does not automatically delete your project.

## Troubleshooting baseline

| Symptom | First checks |
| --- | --- |
| Authentication error | Active identity, expired login, intended CLI versus ADC configuration |
| Permission denied | Exact permission, resource scope, runtime versus deployer identity, policy denial |
| API disabled | Consumer project and service name; enablement permission |
| Quota exhausted | Metric, region, project, requested capacity and actual usage |
| Region/feature unsupported | Current service location and edition documentation |
| Timeout | DNS, route, firewall, private access, listener, backend readiness |
| Unexpected cost | Resource inventory, billing export/report, idle provisioned capacity, egress |

## Official references

- [Cloud Shell use](https://docs.cloud.google.com/shell/docs/using-cloud-shell)
- [Install the gcloud CLI](https://docs.cloud.google.com/sdk/docs/install-sdk)
- [Authentication methods](https://docs.cloud.google.com/docs/authentication)
- [Create and manage budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets)
- [Pricing calculator](https://cloud.google.com/products/calculator)
- [Create and manage projects](https://docs.cloud.google.com/resource-manager/docs/creating-managing-projects)
- [Shut down projects](https://docs.cloud.google.com/resource-manager/docs/creating-managing-projects#shutting_down_projects)
