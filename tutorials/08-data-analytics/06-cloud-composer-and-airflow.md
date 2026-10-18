# Cloud Composer and Managed Service for Apache Airflow

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Analytics roadmap](../../roadmaps/08-data-analytics.md)

## Objectives, naming, and prerequisites

Design an idempotent workflow, write a small DAG, and understand scheduling, retries, and backfills. Allow 90 minutes. Current Google documentation titles the service Managed Service for Apache Airflow; Cloud Composer remains common in existing resource names, API identifiers, CLI commands, and tutorials. Check the selected environment's Airflow version and provider packages before copying examples. [Managed Airflow overview](https://docs.cloud.google.com/composer/docs/composer-3/composer-overview)

Complete [lab setup](../../LAB-SETUP.md) and basic Python. The default lab writes and compiles local Python files without creating a managed environment. Environments can incur persistent charges even with no DAG running. A funded extension requires billing, `composer.googleapis.com`, environment provisioning permissions, an environment service account, suitable network capacity, and access to the data services its tasks invoke.

## Orchestration versus processing

Airflow coordinates tasks and their dependencies. It should submit a BigQuery job or Dataflow/Spark batch instead of loading a huge dataset into the scheduler or passing it through XCom. XCom is appropriate for small metadata such as an object URI or job ID. A DAG file is parsed repeatedly; avoid expensive API calls, secrets retrieval, or database queries at module import time.

A DAG run has a logical date/data interval, which is not necessarily its actual execution time. Partition-aware tasks should process the intended interval rather than call `datetime.now()` and hope retries land on the same day. Catchup controls historical scheduled runs; backfill is an explicit recovery/reprocessing activity. A retry runs a task again, so its writes must be idempotent or keyed by run/partition. [Write DAGs](https://docs.cloud.google.com/composer/docs/composer-3/write-dags)

Pools, concurrency controls, maximum active runs, and task timeouts protect downstream systems. A dependency graph expresses task ordering, not an automatic transaction spanning external services. Sensors wait for conditions; supported deferrable operators can avoid tying up workers while waiting. Alert on the business deadline and freshness, not only on task failures.

## Lab: separate tested logic from orchestration

```bash
mkdir -p airflow-lab
cd airflow-lab
cat > pipeline_logic.py <<'PY'
def summarize(rows):
    if any(r['amount_minor'] < 0 for r in rows):
        raise ValueError('Negative amount in synthetic fixture')
    return {'rows': len(rows), 'total_minor': sum(r['amount_minor'] for r in rows)}

if __name__ == '__main__':
    assert summarize([{'amount_minor':100},{'amount_minor':50}]) == {
        'rows':2,'total_minor':150}
    try:
        summarize([{'amount_minor':-1}])
    except ValueError:
        pass
    else:
        raise AssertionError('Bad input was accepted')
    print('Business logic checks passed')
PY
python3 pipeline_logic.py
cat > roadmap_orders.py <<'PY'
from datetime import datetime, timedelta, timezone
try:
    from airflow.sdk import dag, task
except ImportError:
    from airflow.decorators import dag, task
from pipeline_logic import summarize

@dag(
    dag_id='roadmap_orders',
    schedule=None,
    start_date=datetime(2026,1,1,tzinfo=timezone.utc),
    catchup=False,
    max_active_runs=1,
    default_args={'retries':2,'retry_delay':timedelta(seconds=30)},
    tags=['roadmap','synthetic'],
)
def orders_workflow():
    @task
    def extract_fixture():
        return [{'amount_minor':100},{'amount_minor':50}]

    @task
    def validate_and_sum(rows):
        return summarize(rows)

    @task
    def verify(result):
        assert result == {'rows':2,'total_minor':150}
        return 'verified'

    verify(validate_and_sum(extract_fixture()))

orders_workflow()
PY
python3 -m py_compile roadmap_orders.py pipeline_logic.py
```

The fallback import accommodates common Airflow major versions; use the target runtime's documented imports for production. Compilation verifies Python syntax only. It does **not** prove that Airflow/provider imports resolve or the DAG parses in a specific environment.

1. Draw the three task dependencies and identify the small XCom payloads. Replace them on paper with source object URI, transformation job ID, and validation table URI for a large-data version.
2. Make the fixture invalid and rerun `pipeline_logic.py` with an explicit negative-input test. Decide whether invalid business data should retry; usually it should be quarantined or fail with a clear operator action rather than waste repeated attempts.
3. Design an output key such as `summary/date=2026-10-01/run_id=...`, followed by validation and an atomic publication pointer or supported partition replacement. Explain how a retry avoids duplicate public outputs.
4. Write a backfill plan for three missing dates. Limit concurrency so recovery traffic does not overwhelm normal processing.

## Optional managed execution

Open Managed Airflow/Composer → Create environment. Record `REGION`, generation/runtime image, network, environment size, service account, dependency packages, maintenance preferences, and the cost estimate. Cancel for the default lab. For an approved funded exercise, deploy the smallest suitable environment with explicit lifecycle ownership.

Upload both files into its DAGs folder using the documented workflow. Open the Airflow UI, check import errors, unpause/trigger `roadmap_orders`, and inspect each task's log and result. Expect all three tasks to succeed and the final return value to be `verified`. Trigger the same fixture again and explain why this particular example is safe to repeat. A real pipeline must prove idempotence in its external writes too. [Add and update DAGs](https://docs.cloud.google.com/composer/docs/composer-3/manage-dags)

## Security, failures, and cleanup

The environment service account needs only the APIs and datasets its tasks use. Store credentials in a supported secrets backend, not DAG source, Airflow variables exposed broadly, or task logs. Restrict who can deploy DAG code because code execution can exercise the environment's privileges.

If a DAG is missing, inspect import errors, upload paths, runtime package compatibility, and synchronization delay. A queued task may reflect worker capacity or pools; a scheduled run that appears late may reflect data-interval semantics. Check retries, timeouts, and downstream job IDs before manually marking a task successful.

Remove local files when finished. For a cloud trial, delete the DAGs and the disposable environment, then inspect its associated buckets, logs, networking resources, and any downstream jobs/output. Environment deletion does not guarantee all external task resources disappear. Exercise: a task succeeds after writing half a partition and then crashes before reporting success. A worked design stages output, validates it, and publishes it through a controlled commit step; blind retry with append would double-count or expose partial data.
