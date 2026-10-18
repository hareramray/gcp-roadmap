# Vertex AI foundations and Gemini Enterprise Agent Platform

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [AI and ML roadmap](../../roadmaps/09-ai-ml.md)

## Current names and learning goal

As checked on 2026-10-18, Google documents Vertex AI Platform as **Gemini Enterprise Agent Platform**. The name map also changes Vertex AI Studio to Agent Studio and describes corresponding model, API, and deployment names. Existing URLs, SDK packages, resource identifiers, and CLI groups can retain older strings. This folder keeps familiar filenames for discoverability and uses current primary documentation for product details. The service endpoint remains `aiplatform.googleapis.com`; do not invent an API name from a marketing rename. [Official name map](https://docs.cloud.google.com/gemini-enterprise-agent-platform/vertex-ai-name-changes) · [API reference](https://docs.cloud.google.com/gemini-enterprise-agent-platform/reference/rest)

Your goal is to translate a business problem into a measurable ML experiment and select an appropriate managed workflow. Allow 90 minutes. Complete [lab setup](../../LAB-SETUP.md), Python basics, IAM, Cloud Storage, and BigQuery. The default lab runs locally without a model API call, notebook VM, accelerator, or endpoint charge. Real managed experiments need billing, `aiplatform.googleapis.com`, scoped platform permissions, and data access for the actual runtime service account.

## Know what kind of problem you have

Supervised learning predicts labeled outcomes, such as a category or numeric quantity. Unsupervised methods identify structure, such as clusters or anomalies. Recommendation ranks items for a user/context. Forecasting predicts future time-indexed values. Reinforcement learning optimizes sequential decisions using rewards and requires a carefully defined environment and evaluation. Generative models produce content and can also perform structured extraction or classification, but their fluent responses are not automatically correct probabilities or verified facts.

Begin with a simple baseline: a majority classifier, last-value forecast, rules engine, or keyword retrieval. Choose a more complex model only when it improves the metric that matters under realistic constraints. For rare defects, 99% accuracy may be useless if 99% of items are normal. Precision measures how many predicted positives are correct; recall measures how many actual positives are found. The threshold converts scores to decisions and should reflect false-positive versus false-negative cost.

Split data before fitting preprocessing. Time-dependent problems often need chronological splits; repeated users or devices may need grouped splits. Randomly placing nearly identical records in train and test can inflate results. Features must be available at prediction time: a refund flag recorded after a purchase cannot legitimately predict whether the purchase will later be refunded. This is target leakage.

## Map the lifecycle to platform components

Managed datasets or data in BigQuery/Cloud Storage feed notebook exploration, AutoML where supported, or custom training jobs. Experiments record parameters and metrics. Model Registry tracks model artifacts and versions. Batch inference processes sets of inputs; online endpoints serve interactive predictions. Pipelines orchestrate reproducible steps and metadata. Monitoring compares production behavior with expectations and triggers investigation rather than automatically proving a model needs retraining. [Machine learning overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/machine-learning)

Notebook environments such as supported Workbench or Colab Enterprise offerings are development tools, not a production scheduling strategy. Stop or delete billable runtimes when idle. Feature-management services can support reusable online/offline features, but point-in-time correctness and ownership remain design responsibilities. Model Garden helps discover Google, partner, and open models with differing licenses, deployment modes, locations, and pricing. A hosted API model and a self-deployed accelerator endpoint have very different operating economics.

## Lab: evaluate a decision threshold

```bash
mkdir -p ml-foundations-lab
cat > ml-foundations-lab/evaluate.py <<'PY'
labels = [0,0,0,0,0,0,0,0,1,1]
scores = [0.05,0.1,0.2,0.25,0.3,0.4,0.55,0.7,0.6,0.9]
for threshold in [0.5,0.8]:
    predicted = [int(s >= threshold) for s in scores]
    tp=sum(y==1 and p==1 for y,p in zip(labels,predicted))
    fp=sum(y==0 and p==1 for y,p in zip(labels,predicted))
    fn=sum(y==1 and p==0 for y,p in zip(labels,predicted))
    tn=sum(y==0 and p==0 for y,p in zip(labels,predicted))
    precision=tp/(tp+fp) if tp+fp else 0
    recall=tp/(tp+fn) if tp+fn else 0
    cost=fp*1+fn*10
    print(threshold, {'tp':tp,'fp':fp,'fn':fn,'tn':tn,
          'precision':precision,'recall':recall,'cost':cost})
PY
python3 ml-foundations-lab/evaluate.py
```

At threshold `0.5`, expect precision `0.5`, recall `1.0`, and cost `2`. At `0.8`, expect precision `1.0`, recall `0.5`, and cost `10`. The higher precision setting is worse under this deliberately chosen cost model. These ten synthetic examples teach metric arithmetic; they do not support a production threshold decision.

1. Change the false-positive cost to 20 and reconsider the threshold. Write the business reason for the new tradeoff.
2. Propose a train/validation/test split for predicting next month's customer churn. List features that are unavailable at prediction time and exclude them.
3. Create an experiment card with objective, baseline, data version, split, metric, subgroup checks, latency budget, maximum training cost, and rollback trigger.
4. In the platform console, inspect Model Garden and training options without deploying. Record one candidate model/workflow and why its input/output contract fits the problem. Confirm current region availability and terms.

## Reliability, security, and completion

Separate the developer identity, training runtime, pipeline orchestrator, and serving runtime. Grant each only the source, artifact, and output permissions it needs. Avoid production sensitive data in learning notebooks and disable unnecessary public sharing. Document data ownership, consent/allowed use, retention, and deletion propagation through feature datasets, artifacts, logs, and embeddings.

If validation is unexpectedly excellent, investigate leakage before celebrating. If online quality drops while offline metrics look good, inspect training-serving skew, missing features, changed populations, and label delay. If a job fails before training, check API access, quotas, supported machine/region combinations, image compatibility, and runtime identity. Use actual service errors to distinguish permissions from capacity shortages.

## Cleanup and exercise

Remove `ml-foundations-lab` after saving the experiment card. There are no cloud resources in the default lab. If you opened an optional notebook runtime, verify that it is stopped/deleted and review disks and artifacts separately. Exercise: a classifier beats the baseline overall but fails for a low-volume customer segment. A worked answer adds slice-specific evaluation and a safe fallback, then gathers representative data; an overall average alone is insufficient for launch.
