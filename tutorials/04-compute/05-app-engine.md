# App Engine: standard, flexible, and existing applications

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Why learn it

App Engine remains important when operating an existing application, evaluating its managed runtime model, or planning a migration. Learn its application → service → version → instance hierarchy. A project has an App Engine application with a selected location; services divide the application, and versions support release management. Choosing that application location is a lasting decision: do not create it casually in a shared project. Use a dedicated disposable project for this optional deployment lab. Commands use Cloud Shell Bash, including for Windows users.

Standard and flexible environments have different scaling and runtime contracts. Standard offers supported managed runtimes with fast instance lifecycle and automatic scaling options. Flexible uses VM-backed containers, supports custom runtimes, and provides different resource and networking flexibility. Flexible active versions retain running VM capacity; do not assume idle traffic means zero cost. Current runtime support, scaling defaults, and quotas change, so inspect the product documentation before deployment. [Environment comparison](https://docs.cloud.google.com/appengine/docs/the-appengine-environments)

The right choice depends on requirements rather than an old product ranking. Compare supported language versions, custom native dependencies, background execution, startup time, network access, observability, and the team's existing deployment system. For a new generic HTTP container, evaluate Cloud Run alongside App Engine. For an existing App Engine application, account for migration risk and dependencies on bundled services before rewriting anything.

## Local tutorial: a standard-style application

Allow 45 minutes for local learning and another 30 minutes for the optional cloud deployment. No production data is needed.

```bash
mkdir -p "$HOME/gcp-roadmap-labs/appengine"
cd "$HOME/gcp-roadmap-labs/appengine"
python3 -m venv .venv
source .venv/bin/activate
cat > requirements.txt <<'EOF'
Flask==3.*
gunicorn==23.*
EOF
cat > main.py <<'EOF'
import os
from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def index():
    return jsonify(service=os.getenv("GAE_SERVICE", "local"),
                   version=os.getenv("GAE_VERSION", "local"))

@app.get("/health")
def health():
    return {"healthy": True}
EOF
cat > app.yaml <<'EOF'
runtime: python312
entrypoint: gunicorn -b :$PORT main:app
instance_class: F1
automatic_scaling:
  min_instances: 0
  max_instances: 2
EOF
pip install -r requirements.txt
gunicorn --bind 127.0.0.1:8080 main:app > appengine-local.log 2>&1 &
APP_PID=$!
curl --retry 5 --retry-connrefused --retry-delay 1 http://localhost:8080/
kill "$APP_PID"
```

Expect `local` for both fields. Check the currently supported Python runtime before deploying; the file is an example to review, not a promise that a runtime remains supported forever. Pin exact dependency versions in a maintained repository. Exclude `.venv`, credentials, tests with sensitive fixtures, and unrelated files using `.gcloudignore`.

## Optional deployment and version inspection

App Engine serves public web applications by default. This demo contains only harmless metadata. A private enterprise application needs an appropriate authentication and access design before deployment.

```bash
gcloud services enable appengine.googleapis.com cloudbuild.googleapis.com
gcloud app regions list
# Select an App Engine-supported location explicitly; it may differ in naming.
export APP_LOCATION='us-central'
gcloud app create --region="$APP_LOCATION"
gcloud app deploy app.yaml --version=lab-v1
gcloud app versions list
gcloud app browse --no-launch-browser
```

Open the reported URL and confirm that service and version values now identify the deployed environment. A default service must exist before some additional-service workflows. For the second release, change a response field and deploy with `--version=lab-v2 --no-promote`; inspect that version's URL before changing traffic. This avoids interpreting “deployment succeeded” as “all users received the release.”

```bash
gcloud app services set-traffic default --splits=lab-v1=0.9,lab-v2=0.1 \
  --split-by=cookie
```

Run that command only after both versions exist. Cookie-based splitting helps a browser remain on one version; IP splitting has different behavior behind shared proxies. Promote or roll back by assigning all traffic to the chosen version. Database changes must remain compatible with simultaneously serving versions. [Traffic splitting](https://docs.cloud.google.com/appengine/docs/standard/splitting-traffic)

## Operations, legacy dependencies, and failures

Keep application state in durable services, and distinguish application logs from request logs. A successful local response with a failing cloud deployment can indicate runtime incompatibility, an invalid entrypoint, missing build permissions, or an application that does not bind the supplied port. A scaling cap can protect resource usage but also cause queuing and errors under load; load-test against an explicit latency target.

Inventory legacy APIs such as bundled datastore, task queues, users, and memcache dependencies in older applications. Map each dependency to a supported compatibility path or replacement, and test behavior rather than only import compatibility. Flexible custom containers shift more responsibility for image patching and boot behavior to the team. Runtime lifecycle dates are operational deadlines, not merely documentation details.

## Cleanup and exercises

Route traffic away before deleting unused versions. App Engine has constraints around the default service and last serving version, so deleting every version is not a universal cleanup method. In a dedicated lab project, disable the App Engine application or delete the disposable project through the documented project-cleanup procedure. Review build artifacts, buckets, and retained logs as well; stopping traffic alone does not remove all charges.

Exercise: prepare a migration matrix for one existing application with columns for runtime, bundled API, target replacement, data migration, rollback, and acceptance test. Explain how a session stored only in process memory behaves during autoscaling.

## Official references

- [Standard environment](https://docs.cloud.google.com/appengine/docs/standard/overview)
- [Flexible environment](https://docs.cloud.google.com/appengine/docs/flexible/overview)
- [Manage instances, services, and versions](https://docs.cloud.google.com/appengine/docs/standard/how-instances-are-managed)

