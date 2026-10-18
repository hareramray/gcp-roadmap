# AI and machine learning roadmap

[Home](../README.md) · [Lab setup](../LAB-SETUP.md)

## Prerequisites and current platform names

Learn Python, statistics, SQL, IAM, storage, APIs, and data quality first. Plan 12–20 hours for the seven tutorials plus substantial project practice. Current documentation verified on 2026-10-18 calls Vertex AI Platform **Gemini Enterprise Agent Platform**. Familiar filenames and API identifiers remain useful; the tutorials distinguish branding from executable service names and use current Google Gen AI SDK guidance. Model versions, locations, quotas, and prices must be rechecked at execution time.

| Step | Topics | Tutorial and evidence |
|---|---|---|
| 1 | Supervised/unsupervised learning, forecasting/recommendation, reinforcement/generative distinctions, baselines, labels/features, splits/leakage, precision/recall/threshold costs, notebooks, datasets, experiments, feature management and Model Garden | [Platform and ML foundations](../tutorials/09-ai-ml/01-vertex-ai-and-ml-foundations.md): an experiment card and threshold analysis |
| 2 | Custom/managed training, preprocessing consistency, runtime containers, artifacts/dependencies, hyperparameter tuning, registry, batch versus online inference, endpoints/autoscaling, canaries and rollback | [Training and prediction](../tutorials/09-ai-ml/02-training-and-prediction.md): reproducible model and validated serving contract |
| 3 | Gemini model lifecycle, Google Gen AI SDK, authentication/location, prompts/examples, structured output, tokens/cost, limits/retries, tuning choices, safety and prompt injection | [Gemini and generative AI](../tutorials/09-ai-ml/03-gemini-and-generative-ai.md): one bounded request and a held-out prompt test set |
| 4 | RAG ingestion/parsing/chunking, metadata/ACLs, lexical/dense embeddings, dimensions/metrics, approximate search, hybrid/reranking, RAG Engine, Vector Search, database alternatives, citations, freshness/deletion and retrieval evaluation | [RAG and vector search](../tutorials/09-ai-ml/04-rag-and-vector-search.md): authorized retrieval with no-evidence behavior |
| 5 | Function schemas, trusted dispatch, tenant authorization, tool output trust, ADK, agent loops/budgets, sessions/memory, managed runtime, MCP/agent-to-agent identity, idempotent actions and traces | [Agents and tool use](../tutorials/09-ai-ml/05-agents-and-tool-use.md): executable positive and adversarial tool tests |
| 6 | Pipeline components/artifacts, versioning/provenance, release gates, classical/generative/agent evaluation, judge calibration, subgroup metrics, drift/skew, monitoring/retraining, responsible use, privacy and rollback | [MLOps and evaluation](../tutorials/09-ai-ml/06-mlops-evaluation-and-responsible-ai.md): regression-rejecting release report |
| 7 | Vision/OCR, Speech-to-Text, Text-to-Speech, Translation, Natural Language, Document AI, Dialogflow/Conversational Agents, Video Intelligence, commerce search/recommendations, Healthcare API interoperability, BigQuery GIS/Earth Engine/Maps workflows | [Pretrained and industry APIs](../tutorials/09-ai-ml/07-pretrained-ai-and-industry-apis.md): bounded API call plus task-specific validation designs |

## Suggested specializations

For predictive ML engineering, deepen data splits, feature consistency, custom training, deployment contracts, monitoring, and pipeline reproducibility. For generative application engineering, focus on model selection, evaluation, RAG, tool authorization, cost controls, and model upgrades. For data/industry integration, start with the pretrained API contracts and add reliable ingestion, domain validation, privacy, and human review where needed.

Do the local fixtures before paid accelerator, vector endpoint, agent runtime, or notebook deployments. Every cloud extension should have an owner, maximum runtime/capacity, estimated cost, scoped identity, and explicit deletion plan. Usage-based model calls and continuously provisioned endpoints have different cost behavior.

## Capstone choices

Build either a synthetic churn classifier with reproducible training, batch scoring, release gates, and drift investigation; or a policy assistant with private-source retrieval, citations, a read-only order tool, unknown-answer behavior, and adversarial authorization tests. Add a small translation/document workflow only when it improves a real user task.

The deliverable is a working experiment and an evidence package: data/model/prompt versions, evaluation fixtures, baseline comparison, slice metrics, latency and cost, IAM diagram, failure modes, rollback, retention, and cleanup inventory. Explain which claims are proven locally and which require a managed production-shaped test.

## Exit criteria

You can justify ML over a simpler rule, identify leakage, compare candidates on an appropriate held-out suite, validate serving inputs, scope a generative model's limitations, enforce permissions outside model text, detect retrieval versus generation failures, and remove all billable resources. A plausible demo answer is not sufficient evidence of a reliable system.
