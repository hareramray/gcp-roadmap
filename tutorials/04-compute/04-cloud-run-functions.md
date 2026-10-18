# Cloud Run functions and Eventarc

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Naming, execution, and prerequisites

Cloud Run functions is the current function-oriented experience on Cloud Run. Older material uses Cloud Functions, first generation, and second generation. Existing resources managed through the Cloud Functions API can retain that management path; `gcloud functions deploy --gen2` is still relevant to those workflows. For new examples here, use `gcloud run deploy --function`, which builds function source into a Cloud Run service. Do not assume two deployment commands create identically managed resources. [Deployment paths](https://docs.cloud.google.com/run/docs/deploy-functions)

You will write an HTTP function, test it locally, and design an event-triggered variant. Use Cloud Shell Bash with the shared setup. The local portion needs no deployed resource. The optional cloud portion incurs Cloud Build, Artifact Registry, Cloud Run, Eventarc, Pub/Sub, and logging costs. You need the source-deployment roles described in the official deployment guide; runtime, build, deployer, and trigger identities are separate.

An HTTP function receives a request and returns a response. An event function receives a CloudEvent envelope containing an identifier, source, type, timestamp, and event-specific data. Eventarc routes matching events to a destination using its configured service account. Filters determine routing, while IAM determines whether delivery is authorized. Neither mechanism replaces application validation.

## Local hands-on

```bash
mkdir -p "$HOME/gcp-roadmap-labs/function-http"
cd "$HOME/gcp-roadmap-labs/function-http"
python3 -m venv .venv
source .venv/bin/activate
cat > requirements.txt <<'EOF'
functions-framework==3.*
EOF
cat > main.py <<'EOF'
import functions_framework

@functions_framework.http
def hello(request):
    name = request.args.get("name", "learner")
    if len(name) > 80:
        return {"error": "name is too long"}, 400
    return {"message": f"Hello, {name}"}, 200
EOF
pip install -r requirements.txt
functions-framework --target=hello --port=8080 > function.log 2>&1 &
FUNCTION_PID=$!
curl --retry 5 --retry-connrefused --retry-delay 1 \
  'http://localhost:8080/?name=cloud'
kill "$FUNCTION_PID"
```

Expect JSON containing `Hello, cloud`. Test the length-validation branch as well. The dependency major-range keeps the example readable; a production repository should lock reviewed exact dependency versions and update them deliberately.

## Optional cloud deployment

Enable required APIs, create a runtime account, and identify a build service account authorized for source builds. Follow the setup's IAM procedure; never grant broad Editor just to make a build pass. Cloud Run source builds require the documented builder permissions, and the deployer needs permission to act as the selected accounts.

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com logging.googleapis.com eventarc.googleapis.com
gcloud iam service-accounts create function-lab-runtime
export FUNCTION_SA="function-lab-runtime@${PROJECT_ID}.iam.gserviceaccount.com"
# BUILD_SA is the explicitly authorized source-build identity described above.
: "${BUILD_SA:?Set the authorized source-build service-account email}"
gcloud run deploy function-lab --source=. --function=hello \
  --base-image=python312 --region="$REGION" \
  --service-account="$FUNCTION_SA" \
  --build-service-account="projects/$PROJECT_ID/serviceAccounts/$BUILD_SA" \
  --no-allow-unauthenticated --max-instances=2
FUNCTION_URL="$(gcloud run services describe function-lab \
  --region="$REGION" --format='value(status.url)')"
curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  "$FUNCTION_URL/?name=cloud"
```

Check the supported runtime list before deploying if the named base image has retired. Expect a successful authenticated response when your user has Invoker permission. Inspect the source-build logs and resulting Artifact Registry image; function deployment does not remove the container supply chain.

## Event exercise: implement the processing boundary

Create a separate directory and replace `main.py` with a CloudEvent handler. Do not deploy this version over the HTTP exercise without also changing its entry point and trigger design.

```python
import base64
import functions_framework

@functions_framework.cloud_event
def receive_message(event):
    message = event.data["message"]
    payload = base64.b64decode(message.get("data", "")).decode("utf-8")
    print({"event_id": event["id"], "payload_length": len(payload)})
```

For a gated event lab, deploy this entry point as a separate private function, create a Pub/Sub topic, create an Eventarc trigger for `google.cloud.pubsub.topic.v1.messagePublished`, and give the trigger identity Cloud Run Invoker on the destination plus the event-receiver permissions required by that provider. Follow the official Pub/Sub walkthrough for service-agent initialization and regional requirements. Publish a harmless message and correlate its event ID with logs. [Pub/Sub function walkthrough](https://docs.cloud.google.com/run/docs/tutorials/pubsub-eventdriven)

Assume events may be redelivered. Store a durable deduplication key and business result atomically when needed; an in-memory set fails when another instance handles the retry. Return success only after required durable work completes. Define retry limits and dead-letter handling where the underlying transport supports them. Ordering must be designed explicitly and is not guaranteed simply because functions execute quickly.

## Troubleshooting and cleanup

An entry-point error means the named function is missing or import failed. A delivered event with 403 indicates trigger-to-service authorization. No events can mean the wrong event type, region, source filter, or service-agent initialization. Validate the provider's delivery semantics before debugging application code.

Delete the Eventarc trigger before its topic or destination, then delete the lab services and runtime account. Inspect the `cloud-run-source-deploy` repository before deleting only this lab's image versions; it may contain other services. Local source files can remain as learning artifacts. Exercise: specify exactly how you would prevent a duplicated payment-notification event from creating two invoices.

## Official references

- [Function triggers](https://docs.cloud.google.com/run/docs/function-triggers)
- [Functions Framework](https://github.com/GoogleCloudPlatform/functions-framework-python)
- [Eventarc overview](https://docs.cloud.google.com/eventarc/docs/overview)

