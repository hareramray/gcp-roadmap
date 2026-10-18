# Retrieval-augmented generation and vector search

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [AI and ML roadmap](../../roadmaps/09-ai-ml.md)

## Goal and prerequisites

Build a local retrieval baseline with authorization filtering, evaluate whether the right source is returned, and design a managed RAG pipeline. Allow 90 minutes. Complete ML foundations, Gemini, Cloud Storage, and [lab setup](../../LAB-SETUP.md). The default lab uses local TF-IDF vectors and makes no model API call or managed index deployment. Cloud extensions can incur embedding, indexing, storage, serving, retrieval, and generation charges; a deployed vector endpoint can have ongoing costs independent of query count.

## Understand the full pipeline

RAG retrieves relevant source material and supplies it to a generator. Its major stages are ingestion, parsing, chunking, metadata/ACL assignment, embedding or lexical indexing, retrieval, reranking, prompt construction, generation, and evaluation. A poor answer may originate in any stage. If the correct document never reaches the model, rewriting the answer prompt cannot reliably fix the retrieval failure.

Chunking should preserve meaningful units such as sections, tables, or procedures. Very small chunks can lose context; very large chunks can dilute relevance and consume tokens. Add stable source IDs, document version, chunk offsets, titles, timestamps, and access metadata. Deduplicate boilerplate, preserve links, and maintain deletion/update propagation. An employee losing access to a source must also lose access through search results, cached prompts, and generated citations.

Dense embeddings represent text in a learned vector space. Keep the same compatible embedding model, dimensionality, normalization, and distance metric for indexed documents and queries. Changing a model often requires re-embedding/reindexing; similar dimension counts do not imply compatible spaces. Approximate nearest-neighbor indexes trade retrieval recall, latency, memory, and cost. Hybrid retrieval combines lexical and semantic signals; a reranker can improve ordering at additional latency/cost. [Vector Search overview](https://docs.cloud.google.com/vertex-ai/docs/vector-search/overview)

## Choose the managed component deliberately

Managed enterprise search products can provide ingestion and search workflows. RAG Engine provides supported corpus/retrieval integration; its location, quotas, backend choices, and lifecycle behavior must be checked. Vector Search is a lower-level similarity search building block and does not by itself parse documents or enforce every application policy. BigQuery vector search can suit analytical data already in the warehouse; supported database vector features can fit operational application data. Compare freshness, scale, filtering, authorization, cost, and existing data location before introducing another store. [RAG Engine API](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/rag-api-v1) · [BigQuery vector search](https://docs.cloud.google.com/bigquery/docs/vector-search-intro)

## Lab: retrieval before generation

```bash
mkdir -p rag-lab
cd rag-lab
python3 -m venv .venv
source .venv/bin/activate
python -m pip install scikit-learn
cat > retrieve.py <<'PY'
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

docs=[
 {'id':'refunds-v1','groups':['support'],
  'text':'Refunds are available within 30 days of purchase with a receipt.'},
 {'id':'shipping-v1','groups':['support'],
  'text':'Standard shipping normally takes five business days.'},
 {'id':'finance-v1','groups':['finance'],
  'text':'Internal refund reserves and bank reconciliation details are private.'}
]

def retrieve(query, trusted_groups, k=2):
    allowed=[d for d in docs if set(d['groups']) & set(trusted_groups)]
    if not allowed: return []
    vectorizer=TfidfVectorizer()
    matrix=vectorizer.fit_transform([d['text'] for d in allowed])
    scores=cosine_similarity(vectorizer.transform([query]),matrix)[0]
    ranked=sorted(zip(allowed,scores),key=lambda pair:pair[1],reverse=True)
    return [(d['id'],d['text'],float(s)) for d,s in ranked[:k] if s>0]

results=retrieve('How many days are refunds available?',{'support'})
assert results[0][0]=='refunds-v1'
assert all(r[0]!='finance-v1' for r in results)
assert retrieve('refunds',set())==[]
assert retrieve('volcano geology',{'support'})==[]
print(results)
print('Authorized retrieval and no-evidence tests passed')
PY
python retrieve.py
```

This is a lexical-vector baseline, not a dense semantic embedding model. Rebuilding its vectorizer per authorized subset keeps the tiny example simple; production implementations need a designed indexing/filtering strategy and a trusted authorization source.

1. Verify the refund policy ranks first and the finance document never appears for the support principal. Do not accept group membership supplied by a user prompt; it must come from authenticated application context.
2. Add paraphrases such as “Can I return something after a month?” and record failures. Compare lexical retrieval with dense embeddings on the same fixtures instead of assuming a model upgrade always improves results.
3. Create ten query-to-source judgments and compute recall@k. Add an unanswerable question and require a no-evidence path rather than inventing a policy.
4. Assemble a prompt containing only allowed retrieved passages, source IDs, and a request to cite evidence. Treat passage text as data, since it may contain malicious instructions. Check the final answer's claims against the actual cited passage.
5. Change the refund policy to 14 days with a new document version. Define how the old index entry, caches, and citations are invalidated, then test that stale policy is no longer returned.

## Gated managed experiment

Choose a currently supported embedding model and location, set a strict maximum corpus size, and estimate embedding plus serving cost. Create a corpus or vector index only in a dedicated sandbox with scoped service accounts. Store original documents privately and attach authorization metadata during ingestion. Use the service's supported filtering/ACL mechanisms and independently enforce application access rules.

Import three synthetic documents, wait for indexing completion, query with known test identities, and compare managed results with the baseline. For a hosted vector index, explicitly record dimensions, distance metric, update mode, deployment capacity, and cleanup commands from current documentation. For RAG Engine, record corpus/backend billing and deletion behavior. Avoid granting a generator broad direct access to every enterprise document simply because retrieval is convenient.

## Failures, cleanup, and assessment

Zero matches can mean wrong embedding model, index dimension mismatch, stale ingestion, restrictive filters, or an unsupported location. Good retrieval with poor answers may reflect contradictory context, missing instructions, excessive context length, or weak answer evaluation. Plausible citations can still reference irrelevant sources; validate relevance and factual entailment separately.

Remove local files/virtual environment after preserving the test set. For optional cloud work, delete or undeploy indexes/endpoints, remove corpus files, and inspect original storage, embeddings, caches, and logs separately. Exercise: a RAG assistant leaks a restricted document title without revealing its body. A worked fix treats metadata and citations as protected data too and enforces access before returning any search result. You pass when retrieval quality, answer grounding, and authorization are evaluated as separate requirements.
