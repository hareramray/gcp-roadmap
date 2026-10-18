# Pretrained AI and industry APIs

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [AI and ML roadmap](../../roadmaps/09-ai-ml.md)

## Goal and prerequisites

Select a task-specific API, make one bounded translation request, and design validation workflows for documents, media, conversations, commerce, healthcare data, and geospatial analysis. Allow two hours. Complete [lab setup](../../LAB-SETUP.md), IAM, API authentication, and Cloud Storage. A pretrained API avoids collecting a full custom training dataset, but its output still needs domain-specific validation. Different APIs have separate enablement, roles, locations, quotas, request limits, retention behavior, and billing units.

The translation lab calls a real API when you run it and may incur charges. All other workflows below are design exercises unless you intentionally provision their resources. Use synthetic/publicly permitted examples only; do not upload real customer documents, voices, health records, or precise personal locations for a learning exercise.

## Choose a service by output contract

**Cloud Vision** provides image analysis such as labels and OCR. OCR extracts text and layout signals; it does not automatically validate that an invoice is genuine or that a recognized number is correct. Choose task features explicitly, evaluate rotated/blurred images and language coverage, and preserve source coordinates for human review. For document fields and repeated forms, compare Document AI rather than reconstructing every layout rule yourself. [Vision quickstart](https://docs.cloud.google.com/vision/docs/detect-labels-image-api)

**Speech-to-Text** transcribes supported audio using synchronous, asynchronous, or streaming workflows depending on the API/version and limits. Sample rate, encoding, channel count, language, punctuation, and supported diarization options affect results. Measure word error rate on realistic accents and noise. **Text-to-Speech** synthesizes supported voices and formats; validate pronunciation, pacing, output encoding, and allowed voice use. Neither service's confidence score replaces a task-specific accuracy test. [Speech-to-Text](https://docs.cloud.google.com/speech-to-text/docs) · [Text-to-Speech](https://docs.cloud.google.com/text-to-speech/docs)

**Cloud Translation** handles translation workflows, with feature-specific support for glossaries, documents, batch jobs, and customization. Distinguish source-language detection from translation and choose region/model features deliberately. Domain terms and ambiguous names need an evaluation glossary and human review where mistakes are costly. **Natural Language API** offers supported entity, sentiment, syntax, and classification analyses; sentiment is a text-analysis signal, not a reliable conclusion about a person's mental state or intent. [Translation](https://docs.cloud.google.com/translate/docs/translate-text) · [Natural Language](https://docs.cloud.google.com/natural-language/docs)

**Document AI** uses processors and processor versions for OCR, parsing, extraction, and other supported document tasks. The processor location and type determine capabilities and limits. Preserve original document IDs, extracted field text, normalized values, page anchors, and confidence. Validate invoice totals mathematically and route uncertain fields for review rather than accepting every extraction. [Document AI overview](https://docs.cloud.google.com/document-ai/docs/overview)

**Dialogflow CX / Conversational Agents** combines explicit conversation flows with supported generative/playbook features. Flows, pages, intents, parameters, session state, fulfillment, and webhooks define behavior. Use deterministic transitions for strict business steps and test interruptions, corrections, no-match/no-input, and handoff. A webhook that creates an order must be idempotent because retries and repeated turns can occur. [Dialogflow CX](https://docs.cloud.google.com/dialogflow/cx/docs)

**Video Intelligence** analyzes supported video features such as labels, shots, objects, or text, depending on the chosen feature. Long-running operations require polling/callback design, output storage, retry handling, and a maximum input duration/cost. Evaluate temporal segments, not only whether a label appears somewhere in the clip. Generative video understanding is another option with a different output contract and pricing; compare the task rather than treating the APIs as interchangeable. [Video Intelligence](https://docs.cloud.google.com/video-intelligence/docs)

**Commerce search and recommendations** require a clean product catalog and correctly instrumented user events, not just an inference request. Current retail documentation redirects into AI Commerce Search under Gemini Enterprise for Customer Experience. Product IDs, availability, price, attribution, consent, and event ordering affect ranking and evaluation. Compare offline relevance with online conversion and guard against recommending unavailable products. [Commerce implementation](https://docs.cloud.google.com/retail/docs/overview)

**Cloud Healthcare API** manages interoperability-oriented data such as FHIR, HL7v2, and DICOM. It is a data platform, not itself a diagnostic model. A learning workflow can ingest synthetic FHIR resources, validate references, export approved analytical data, and apply separate authorized analytics. Data access, audit, de-identification, retention, and organizational compliance requirements must be designed end to end. [Healthcare API overview](https://docs.cloud.google.com/healthcare-api/docs/introduction)

**Geospatial workflows** combine BigQuery GIS for SQL over geographic data, Earth Engine for supported geospatial imagery/analysis, and Google Maps Platform APIs for task-specific location, routing, or place features. They have different terms and billing. Check coordinate order, coordinate reference systems, boundaries, resolution, and time validity. A point-in-polygon result can be numerically correct but answer the wrong business question if the polygon is outdated. [BigQuery geospatial analytics](https://docs.cloud.google.com/bigquery/docs/geospatial-intro) · [Earth Engine](https://developers.google.com/earth-engine/guides)

## Lab: call Cloud Translation with a bounded fixture

Use Cloud Shell Bash with `PROJECT_ID` from setup. The caller needs Cloud Translation usage permissions and permission to charge the selected project; an administrator may need to enable the API. This example uses the global basic text-translation workflow, not a regional glossary or document processor.

```bash
gcloud services enable translate.googleapis.com --project="$PROJECT_ID"
mkdir -p pretrained-api-lab
cat > pretrained-api-lab/request.json <<'JSON'
{
  "sourceLanguageCode": "en",
  "targetLanguageCode": "hi",
  "contents": ["The training order is ready."],
  "mimeType": "text/plain"
}
JSON
curl --fail-with-body --silent --show-error \
  -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "x-goog-user-project: $PROJECT_ID" \
  -H "Content-Type: application/json" \
  "https://translation.googleapis.com/v3/projects/$PROJECT_ID/locations/global:translateText" \
  --data-binary @pretrained-api-lab/request.json \
  > pretrained-api-lab/response.json
python3 - <<'PY'
import json
from pathlib import Path
data=json.loads(Path('pretrained-api-lab/response.json').read_text())
translated=data['translations'][0]['translatedText']
assert translated.strip()
print('Translation returned:',translated)
PY
```

1. Verify one nonempty translation returns. Do not require an exact string because multiple translations can be valid. Have a competent speaker evaluate meaning and terminology for a real use case.
2. Change the target to another supported language and compare whether proper names and quantities are preserved. Record API/model settings and request IDs where available.
3. Submit an invalid language code in a separate request and inspect the error. It should be handled as an input/configuration error, not retried forever.
4. Write a cost unit table for your chosen services: characters, audio duration, pages, video duration/features, queries, or provisioned resources as documented. Calculate a maximum workload before batch processing.

## Worked design exercises

For invoice intake, upload a synthetic invoice to a private bucket, select a supported Document AI processor/location, process a small sample, normalize currency/date fields, check `subtotal + tax = total`, and route low-confidence/mismatched records to review. Store the processor version and source page anchors. Cleanup includes processor resources if created, input/output files, and review artifacts.

For a voice order-status assistant, chain speech recognition to a Dialogflow/agent flow, authorize the caller, call a read-only order tool, then synthesize a response. Test noisy audio, a corrected order ID, cross-customer requests, and webhook retries. Keep transcripts and recordings only for an explicit retention purpose. Voice recognition alone is not sufficient authorization.

For a geospatial exercise, use synthetic warehouse points and a public licensed service-area polygon. Validate longitude/latitude order, run point-in-polygon and distance calculations, and compare a few points manually. Decide whether straight-line distance or a routing API answers the delivery question. A nearby point across a river may have a long driving route.

## Troubleshooting, security, and cleanup

A `403` can indicate API enablement, caller IAM, quota-project permission, or an organization policy. `400` often means invalid input encoding, model/processor location, field names, or request size. Long-running jobs need operation-status handling, not an assumption that initial acceptance means completion. Bound retries and preserve enough metadata to investigate without logging full sensitive payloads.

Delete `pretrained-api-lab` after saving only necessary learning evidence. The translation request creates no dedicated endpoint. For optional extensions, remove processors, agents, stores, uploaded documents/media, generated outputs, schedules, and dedicated credentials/resources according to each service's lifecycle. You pass when you can justify the selected API, state its input/output and billing contract, and demonstrate a domain-specific correctness check beyond “the request returned HTTP 200.”
