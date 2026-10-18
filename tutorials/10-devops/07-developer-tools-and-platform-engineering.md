# Developer tools and platform engineering

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Match the environment to the task

Cloud Shell provides an authenticated browser-accessible development shell and editor, useful for learning and short administration sessions. Its session VM is not a production application host. Understand persistent home-directory behavior, quotas, inactivity handling, and the difference between files saved in persistent storage and temporary VM paths. Windows users can run this curriculum's Bash commands there without translating them into PowerShell. [Cloud Shell overview](https://docs.cloud.google.com/shell/docs/overview)

Cloud Code adds supported development workflows for Cloud Run and Kubernetes in compatible editors, including project templates, local iteration, debugging, and deployment assistance. It does not remove the need to understand generated Dockerfiles, manifests, IAM, and the selected cloud project. Cloud Workstations supplies centrally managed development environments inside an organization's configured cloud/network boundaries. It introduces cluster/configuration/workstation resources, runtime and disk costs, image maintenance, and access policy.

This tutorial builds a small local developer workflow, then designs a platform service. No Cloud Workstation is provisioned by the commands below. Allow one hour. Optional Workstations evaluation is a paid, administrator-prepared lab with explicit networking, identity, timeout, and storage decisions.

## Hands-on: make the next developer productive

Use Cloud Shell Bash after the shared setup. Create a self-checking project that documents and verifies its requirements. A useful starter should fail clearly when configuration is missing and should avoid deploying resources as a surprise side effect of running tests.

```bash
mkdir -p "$HOME/gcp-roadmap-labs/developer-workflow/scripts"
cd "$HOME/gcp-roadmap-labs/developer-workflow"
cat > app.py <<'EOF'
def greeting(name):
    return f"Hello, {name.strip() or 'learner'}"

if __name__ == "__main__":
    print(greeting("cloud"))
EOF
cat > test_app.py <<'EOF'
import unittest
from app import greeting

class GreetingTest(unittest.TestCase):
    def test_trims_name(self):
        self.assertEqual(greeting(" cloud "), "Hello, cloud")
    def test_uses_fallback(self):
        self.assertEqual(greeting("  "), "Hello, learner")
EOF
cat > scripts/check.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
command -v python3 >/dev/null || { echo 'python3 is required' >&2; exit 1; }
python3 -m unittest -v
python3 -m py_compile app.py
EOF
cat > scripts/context.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
command -v gcloud >/dev/null || { echo 'Google Cloud CLI is required' >&2; exit 1; }
printf 'Active project: '
gcloud config get-value project
printf 'Active account: '
gcloud auth list --filter=status:ACTIVE --format='value(account)'
EOF
chmod +x scripts/check.sh scripts/context.sh
./scripts/check.sh
./scripts/context.sh
```

Expect passing tests and the intended lab identity/project. Keep this context command read-only; it should never switch projects silently. Open the directory in Cloud Shell Editor, set a breakpoint in a supported Python debugging workflow, and inspect the normalized name. Then modify the function, run checks again, and compare the feedback cycle with a remote build.

Add a project README describing the supported runtime, setup command, test command, local run command, configuration variables, ownership, and cleanup. Add `.gitignore` entries for virtual environments, caches, credentials, and generated artifacts. Make dependency installation reproducible through a lockfile or equivalent reviewed version specification. Test onboarding from a fresh directory, not only your already-configured session.

## Evaluate managed workstations deliberately

A workstation configuration determines machine resources, container image, persistent directories, service account, startup behavior, and timeouts. A user workstation instantiates that configuration. Centralized images can standardize tools, but an outdated image can spread vulnerable tools to every developer. Assign an owner and patch cadence, and separate base-image updates from project dependency updates. [Workstations overview](https://docs.cloud.google.com/workstations/docs/overview)

For a gated evaluation, ask the platform administrator to provide a configuration with a small machine, limited idle/running timeouts, approved egress, a minimally privileged service account, and a documented persistent-disk policy. Start one workstation, clone a harmless test repository, run the checks above, disconnect, and verify the configured stop behavior. Confirm which files survive a stop and which disappear after deletion. Stopping a workstation can leave storage and other platform costs; deleting a workstation is not the same as deleting its configuration or cluster.

Inspect private access, package-registry reachability, Git authentication, extension policy, audit logging, and data export requirements. Do not solve a package-install failure by granting the workstation broad project administration. An editor's AI or extension integration also needs a clear policy for what source and data may be shared.

## Build a useful internal platform

A platform should offer a supported path from repository to production: starter project, tested build, immutable artifact, deployment workflow, identity, secrets, observability, budget labels, ownership, and recovery documentation. These are often called paved roads because they make the approved path easy to follow. A template without ongoing maintenance is only a snapshot.

Define a small service interface: application name, owner, runtime, exposure, environment, resource budget, and dependency needs. Validate these inputs, generate reviewed configuration, and expose status and costs. Separate platform-owned foundations from application-owned code. Provide an exception process for requirements the standard path cannot meet; exceptions need an owner and maintenance plan.

Measure time to first successful deployment, build duration, failed-change rate, recovery time, adoption, and developer feedback. Do not maximize the number of platform features as a substitute for reducing developer friction. An internal portal is optional; a reliable documented CLI and templates can be a stronger first version.

## Troubleshooting, cleanup, and exercises

If local and CI behavior differ, compare runtime versions, dependency locks, environment variables, working directories, architecture, and credentials. If a workspace is inaccessible, separate user access, workstation lifecycle state, network path, and editor startup errors. Preserve useful diagnostic logs without recording secrets.

Stop any optional workstation, then follow the administrator's documented deletion and persistent-disk policy. Delete only this lab's resources; keep the local starter as a reusable learning artifact. Exercise: onboard another developer using only your README, record every unstated assumption, and improve the workflow until no manual explanation is required.

## Official references

- [Cloud Shell Editor](https://docs.cloud.google.com/shell/docs/editor-overview)
- [Cloud Code](https://docs.cloud.google.com/code/docs)
- [Workstations base editor](https://docs.cloud.google.com/workstations/docs/base-editor-overview)
- [Platform engineering guidance](https://cloud.google.com/solutions/platform-engineering)
