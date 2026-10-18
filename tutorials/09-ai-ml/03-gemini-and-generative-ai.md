# Gemini and generative AI with the Google Gen AI SDK

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [AI and ML roadmap](../../roadmaps/09-ai-ml.md)

## Goals and current API conventions

Make one bounded model request, validate structured output, and design an evaluation-driven prompt workflow. Allow 75 minutes. Current Google Gen AI Python documentation uses `google-genai` and `genai.Client(enterprise=True, project=..., location=...)` for Gemini Enterprise Agent Platform. Older examples may use Vertex AI naming or older generative modules. Use the current SDK documentation for your installed version and pin the tested dependency afterward. [Google Gen AI SDK](https://googleapis.github.io/python-genai/) · [Platform quickstart](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start)

Model IDs, versions, capabilities, prices, and regional availability change. This tutorial intentionally requires `MODEL_ID` rather than hardcoding a model that might be retired. Select a currently supported text model with structured-output support from the model lifecycle and model-specific documentation. Decide whether a regional or global endpoint satisfies your data-location requirements; global routing is not a promise that processing stays in your preferred region. [Model lifecycle](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/model-versions)

## Concepts that affect application behavior

A prompt combines instructions, examples, user input, and sometimes retrieved context or tool descriptions. Tokens drive context limits and much of usage cost, but images, audio, video, caching, reasoning, and other features can have different billing units. Cap output, limit request size, and measure usage rather than estimating cost only from visible words.

Temperature and sampling settings affect variation; a low temperature does not guarantee factual accuracy or perfect determinism. Structured output constrains shape, not truth. A JSON object can pass validation and still contain the wrong amount. Treat model responses as untrusted application input, validate types and business invariants, and handle empty/blocked/truncated responses explicitly.

Use retrieval for changing source knowledge, tools for authoritative calculations/actions, and tuning when supported and justified by repeated measured failures. Prompting is often the cheapest first experiment. Tuning is not a reliable substitute for a current document repository, and a longer prompt is not automatically a better prompt. Keep an evaluation set separate from prompt examples so you do not optimize only for the cases you show the model.

## Prerequisites and cost boundary

Complete [lab setup](../../LAB-SETUP.md), including Application Default Credentials for the execution environment. Use a dedicated sandbox with billing and `aiplatform.googleapis.com` enabled. The caller needs suitable platform inference permissions, commonly the scoped platform user role for a lab. Cloud Shell's credentials differ from a production service identity; production should use an attached identity or federation rather than downloaded keys.

The following script makes one real inference call when you run it and can incur usage charges. It creates no dedicated endpoint. Use only the synthetic order text provided. Before execution, choose an allowed model/location and confirm quota/pricing.

```bash
gcloud services enable aiplatform.googleapis.com --project="$PROJECT_ID"
mkdir -p gemini-lab
cd gemini-lab
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade google-genai pydantic
export MODEL_ID="REPLACE_WITH_CURRENT_SUPPORTED_MODEL_ID"
export GENAI_LOCATION="$REGION"
# If the chosen model requires another supported location, set it explicitly.
cat > extract.py <<'PY'
import os
from typing import Literal
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

class Order(BaseModel):
    order_id: str
    quantity: int = Field(ge=1, le=100)
    status: Literal['draft','paid']

model_id=os.environ['MODEL_ID']
if model_id.startswith('REPLACE_'):
    raise SystemExit('Choose an available model ID before calling the API')
with genai.Client(enterprise=True,project=os.environ['PROJECT_ID'],
        location=os.environ['GENAI_LOCATION'],
        http_options=types.HttpOptions(api_version='v1')) as client:
    response=client.models.generate_content(
        model=model_id,
        contents='Extract the order: order ID A-101, quantity 2, already paid.',
        config=types.GenerateContentConfig(
            system_instruction='Extract only facts explicitly present. Return the requested schema.',
            temperature=0,
            max_output_tokens=256,
            response_mime_type='application/json',
            response_schema=Order))
    if not response.text:
        raise RuntimeError('No usable text; inspect finish reasons and safety metadata')
    order=Order.model_validate_json(response.text)
    assert order.order_id=='A-101' and order.quantity==2 and order.status=='paid'
    print(order.model_dump_json())
    print('Usage:',response.usage_metadata)
PY
python extract.py
python -m pip freeze > requirements-tested.txt
```

## Verify and extend deliberately

1. Expect a valid order with ID `A-101`, quantity `2`, and status `paid`. Save the model ID, SDK version, request settings, usage, and latency with the result.
2. Add fixtures with missing quantity, contradictory status, and irrelevant instructions inside the source text. Revise the schema to allow an explicit unknown value where the business contract requires it; do not force a fabricated answer through a non-null schema.
3. Compare two prompts on the same held-out fixture set. Record exact field accuracy, refusal/unknown behavior, schema validity, latency, and cost. Repeatedly inspecting only the successful example is not evaluation.
4. Add bounded retries for retryable quota/availability failures with jitter, request deadlines, and a total retry budget. Do not retry invalid arguments or permission failures indefinitely. Avoid logging complete sensitive prompts merely to troubleshoot a status code.

## Security and operational design

Documents and retrieved passages can contain prompt injection. Keep authorization and tool permissions in application code; a prompt saying “ignore malicious instructions” is only one layer. Separate user text from system instructions, restrict tools, validate outputs, and require explicit application policy for consequential actions. Configure safety controls for the use case and measure false positives/negatives; filters are not complete business validation.

For model upgrades, rerun the same evaluation set and stage rollout. Aliases can simplify access but may move to new underlying versions; record the resolved version when available and use explicit versioning where reproducibility requires it. Monitor token usage, errors, latency, invalid responses, and domain-specific failure rates.

## Cleanup and exercise

There is no dedicated endpoint to undeploy in this lab. Remove local files/virtual environment when finished; delete any optional prompt caches, uploaded artifacts, or tuning jobs you later create. Review logs and usage charges separately. Exercise: a support bot returns valid JSON with an invented refund amount. A worked solution retrieves the authoritative transaction through a restricted tool, verifies ownership, and calculates policy outside the model; schema validation alone cannot establish truth.
