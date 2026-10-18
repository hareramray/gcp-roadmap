# Custom training, model artifacts, and prediction

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [AI and ML roadmap](../../roadmaps/09-ai-ml.md)

## Goal and cost boundary

Train a reproducible small model, save its preprocessing and parameters together, and define a serving contract. Allow 90 minutes. The default lab runs in Cloud Shell with a local Python virtual environment and does not create cloud training jobs or endpoints. Optional managed execution requires billing, `aiplatform.googleapis.com`, storage and artifact access, model/job administration permissions, and a dedicated runtime service account. Complete [lab setup](../../LAB-SETUP.md) and ML foundations; `PROJECT_ID` and `REGION` are used in the deployment design.

Managed training and serving documentation now appears under Gemini Enterprise Agent Platform; older Vertex AI URLs redirect. Select runtime images and machine types from the current compatibility lists. Training containers, prediction containers, and model artifact formats must agree on framework/library versions. [Training overview](https://docs.cloud.google.com/vertex-ai/docs/training/overview) · [Inference overview](https://docs.cloud.google.com/vertex-ai/docs/predictions/overview)

## Distinguish training from serving

Training consumes labeled data to produce learned parameters. Hyperparameter tuning runs multiple candidate jobs and can multiply cost quickly. Use an objective metric, search bounds, maximum trials, early stopping where supported, and a budget. Accelerators only help suitable workloads; a tiny linear model does not need a GPU.

A model artifact is more than weights. It needs preprocessing, feature ordering/types, label mapping, dependency versions, evaluation results, and provenance. If training scales features but serving omits scaling, the endpoint can return valid-looking wrong predictions. Store preprocessing in the same pipeline or enforce a shared tested transform.

Online prediction prioritizes request latency and capacity for bursts; a deployed endpoint can charge for provisioned resources while idle. Batch prediction handles a collection asynchronously and is often appropriate for periodic scoring. Endpoint autoscaling must consider minimum replicas, cold starts, quotas, maximum capacity, and latency SLOs. A traffic split supports staged rollout only when both versions share a compatible contract and monitoring can compare their outcomes.

## Lab: train and validate locally

```bash
mkdir -p training-lab
cd training-lab
python3 -m venv .venv
source .venv/bin/activate
python -m pip install scikit-learn joblib
cat > train.py <<'PY'
import json
from pathlib import Path
import joblib
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score

X,y=make_classification(n_samples=500,n_features=4,n_informative=3,
    n_redundant=0,random_state=42)
X_train,X_test,y_train,y_test=train_test_split(X,y,test_size=0.25,
    random_state=42,stratify=y)
model=make_pipeline(StandardScaler(),LogisticRegression(max_iter=300))
model.fit(X_train,y_train)
metrics={'accuracy':float(accuracy_score(y_test,model.predict(X_test))),
         'roc_auc':float(roc_auc_score(y_test,model.predict_proba(X_test)[:,1])),
         'train_rows':len(y_train),'test_rows':len(y_test)}
Path('artifacts').mkdir(exist_ok=True)
joblib.dump(model,'artifacts/model.joblib')
Path('artifacts/metrics.json').write_text(json.dumps(metrics,indent=2))
Path('request.json').write_text(json.dumps({'instances':X_test[:2].tolist()}))
reloaded=joblib.load('artifacts/model.joblib')
assert (reloaded.predict(X_test)==model.predict(X_test)).all()
print(json.dumps(metrics,indent=2))
print('Two prediction probabilities:',reloaded.predict_proba(X_test[:2])[:,1].tolist())
PY
python train.py
python -m pip freeze > artifacts/requirements-tested.txt
```

Verify `train_rows=375`, `test_rows=125`, the artifact exists, and reloaded predictions match. Metric values can vary slightly by dependency version; record them with the lock/version evidence instead of promising an exact score. This synthetic model has no real business usefulness.

1. Inspect `request.json`: each instance must contain exactly four numeric features in the expected order. Write validation that rejects missing fields, strings, extra dimensions, and non-finite numbers before prediction.
2. Shuffle feature order at inference and observe the result change. Document feature names and order in a model contract, then prefer named input validation in the application layer.
3. Add a baseline classifier and require the candidate to improve an appropriate held-out metric. Keep the test set out of repeated tuning decisions.
4. Record a model card containing intended use, excluded use, training source, split, metrics, limitations, artifact checksum, and serving dependencies. Load serialized Python artifacts only from trusted sources; deserialization is code-capable.

## Optional managed training and deployment

Package the training application with a supported prebuilt image or a custom container. For cloud training, write artifacts to the platform's documented output location using supported Cloud Storage libraries/filesystem handling; a local `joblib.dump` cannot directly write an arbitrary `gs://` URI. Give the job identity read access to training data and write access to the designated artifact prefix.

In Training → Create job, choose `REGION`, container/runtime, machine type, worker count, service account, timeout, and output bucket. Inspect the estimate and cancel for the default lab. A funded trial should begin with one small CPU job, capture logs and metrics, and register the resulting model with its artifact URI and compatible prediction container. [Prebuilt training containers](https://docs.cloud.google.com/vertex-ai/docs/training/pre-built-containers)

For batch scoring, supply a tiny test input file and a unique output prefix, then validate record count and schema. For an online endpoint, explicitly set machine type and minimum/maximum replica counts, review idle cost, deploy, and send the two fixture instances. Compare endpoint outputs with local predictions within a defined tolerance. Test malformed inputs and request timeouts, not just the happy path. Do not enable public unauthenticated access for this lab.

## Operations, cleanup, and exercise

A model upload is not a deployment; a deployed model and endpoint are separate lifecycle resources. Health-check failures often involve serving port/route expectations, missing dependencies, artifact paths, or incompatible serialization. Training failures may be data IAM, quota, unsupported accelerator/region, out-of-memory, or a program exception. Inspect the first causal error rather than only the final job status.

Monitor p95/p99 prediction latency, request errors, throughput, replica saturation, feature quality, and outcome metrics. Log request metadata and version IDs without unnecessarily storing sensitive feature values. Use a controlled canary and keep the previous compatible version available for rollback until validation passes.

Deactivate and remove the local lab when finished. For optional cloud work, cancel unfinished jobs, undeploy models before deleting endpoints, remove registry versions/artifacts only after confirming they are unused, and inspect batch outputs and notebook disks. Exercise: scoring one million customers once per night does not need a permanently running interactive endpoint; compare batch prediction with an endpoint using end-to-end completion time, cost, and recovery behavior.
