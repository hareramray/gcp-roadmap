# MLOps, evaluation, monitoring, and responsible AI

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [AI and ML roadmap](../../roadmaps/09-ai-ml.md)

## Goal and prerequisites

Build a release gate that compares candidates, records provenance, and rejects regressions hidden by an average. Allow 90 minutes. Complete training/prediction, Gemini, and [lab setup](../../LAB-SETUP.md). The default lab uses standard-library Python and no cloud APIs. Managed pipeline/evaluation jobs, model-based judges, storage, monitoring, and inference can incur charges; choose a bounded dataset and explicit budget before running them.

MLOps combines reproducible data/model development with safe deployment and operational feedback. Version code, dependencies, data snapshots or immutable references, feature definitions, prompts, retrieval settings, model IDs, and evaluation suites. A model file without its inputs and training recipe is difficult to reproduce. A prompt change can be as consequential as a code change when it alters customer-facing behavior.

## Build a useful pipeline and release gate

A training pipeline commonly validates data, transforms features, trains candidates, evaluates them, registers a selected artifact, and conditionally deploys. Pipeline components should have explicit input/output artifacts and runtime identities. Caching helps when inputs and code are unchanged, but hidden mutable dependencies can make cached results invalid. Keep a human/business approval step where the application risk and organization policy require it rather than automatically deploying every statistically better score. [Platform Pipelines](https://docs.cloud.google.com/vertex-ai/docs/pipelines/introduction)

For predictive ML, evaluate discrimination, calibration, threshold decisions, slice performance, robustness, and operational latency. For generative applications, evaluate task success, factual support, schema validity, instruction following, unsafe behavior, leakage, and cost. RAG needs separate retrieval and answer-grounding checks. Agents need tool-selection, argument, authorization, and trajectory evaluation as well as final-answer scoring.

Human judgments and model-based judges can both be inconsistent. Write rubrics, use blinded comparisons where useful, calibrate judges against human examples, and investigate disagreement. A model judging another model is not an independent oracle. Protect held-out test cases from repeated prompt/tuning exposure and include failure cases rather than only representative easy examples. [Gen AI evaluation overview](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/evaluation-overview)

## Lab: expose a subgroup regression

```bash
mkdir -p mlops-lab
cat > mlops-lab/gate.py <<'PY'
import json
from pathlib import Path

cases=[{'id':f'case-{i}','slice':'common' if i<8 else 'rare','label':1}
       for i in range(10)]
predictions={
    'baseline':[1,1,1,1,1,1,0,1,1,1],
    'candidate':[1,1,1,1,1,1,1,1,1,0]
}
report={}
for name,values in predictions.items():
    scores={}
    for group in ['all','common','rare']:
        selected=[i for i,c in enumerate(cases) if group=='all' or c['slice']==group]
        scores[group]=sum(values[i]==cases[i]['label'] for i in selected)/len(selected)
    report[name]=scores
candidate=report['candidate']
approved=(candidate['all']>=report['baseline']['all'] and candidate['rare']>=0.8)
manifest={'suite_version':'synthetic-v1','metrics':report,'approved':approved,
          'reason':'Rare-slice minimum must pass, not only overall accuracy'}
assert report['baseline']['all']==report['candidate']['all']==0.9
assert report['baseline']['rare']==1.0 and candidate['rare']==0.5
assert not approved
Path('mlops-lab/release-report.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps(manifest,indent=2))
PY
python3 mlops-lab/gate.py
```

Expect both models to score `0.9` overall, but the candidate's rare slice drops to `0.5` and release is rejected. This tiny fixture demonstrates logic only; two rare examples are far too few to estimate a real production rate reliably.

1. Add a latency/cost threshold and a schema-validity metric. Explain whether a candidate must pass every gate or whether some tradeoffs can be explicitly approved.
2. Replace hardcoded fixture predictions with outputs from two versions of your local classifier or a small, budgeted model evaluation. Preserve input IDs and version metadata so every result is traceable.
3. Add confidence intervals or repeated sampling appropriate to the metric and sample size. A one-point difference on a small dataset may not be meaningful.
4. Define a canary plan with traffic fraction, minimum observation period, comparison metric, and automatic rollback trigger. Protect users from experiments whose failure cost is unacceptable.
5. Write a deletion propagation checklist covering raw data, feature tables, model artifacts where applicable, retrieval indexes, prompts/logs, evaluation exports, and backups according to the actual retention obligations.

## Monitoring and retraining

Data drift is a change in input distribution; prediction drift is a change in outputs; concept drift is a change in the relationship between inputs and targets. None can be diagnosed solely by one histogram. Label delay complicates quality monitoring, so combine immediate health signals with later outcome measurements. A drift alert should start investigation; automatic retraining on corrupted data can make the system worse. [Model Monitoring overview](https://docs.cloud.google.com/vertex-ai/docs/model-monitoring/overview)

Monitor request errors, latency, feature missingness, score distributions, slice quality, cost, and business outcomes. Compare training and serving preprocessing to detect skew. Track model/prompt/index versions on requests and maintain a rollback path with compatible schemas. For generative systems, periodically rerun adversarial and domain-specific evaluation because model updates, retrieval changes, and tool changes can alter behavior independently.

## Responsible development and security

Document intended use, excluded use, affected users, known limitations, escalation options, and who owns failures. Evaluate data representativeness and subgroup performance where relevant. Give users a way to correct or contest significant mistakes when the product needs it. Avoid collecting unnecessary sensitive data, and use de-identification only with an understanding of re-identification risk. Content filters, explainability tools, and documentation are useful layers but do not independently establish that a system is safe or fair.

Separate pipeline deployment privileges from model invocation privileges. Use signed/reviewed artifacts, vulnerability scanning for images, least-privilege identities, protected evaluation datasets, and redacted logs. An evaluation fixture containing prompt injection should remain inert data; never execute instructions embedded in a test case.

## Cleanup and assessment

Remove `mlops-lab` when the report is saved. For optional managed experiments, delete temporary evaluation outputs, pipeline runs/artifacts as appropriate, unused models/endpoints, and schedules. Retain only the approved audit evidence required by your policy; do not erase a production audit trail as routine lab cleanup.

Exercise: a new model raises average accuracy but doubles false negatives for a critical subgroup. A worked decision withholds rollout, investigates data and threshold behavior, and uses an explicit fallback until evidence supports release. You pass when a bad candidate is rejected automatically, the reason is visible, and another engineer can reproduce the exact evaluation.
