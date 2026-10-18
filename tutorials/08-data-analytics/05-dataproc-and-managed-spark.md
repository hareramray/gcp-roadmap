# Dataproc and Managed Service for Apache Spark

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Analytics roadmap](../../roadmaps/08-data-analytics.md)

## Goal and naming

Run a small Spark transformation locally and choose between a managed cluster and serverless batch execution. Allow 90 minutes. Current documentation uses Managed Service for Apache Spark; existing tutorials, APIs, CLI groups, and resources may still use Dataproc terminology. The serverless overview now lives under `managed-spark`. Follow the current product documentation while preserving the actual documented API/CLI identifiers. [Serverless overview](https://docs.cloud.google.com/managed-spark/docs/serverless-overview) · [Deployment comparison](https://docs.cloud.google.com/managed-spark/docs/concepts/serverless-spark-compare)

Complete [lab setup](../../LAB-SETUP.md). The local lab needs Cloud Shell Bash, a Java version supported by the selected PySpark release, Python, and enough memory for a tiny local process. It creates no managed Spark resources. A cloud run needs billing, `dataproc.googleapis.com`, a supported region/runtime, job submission permissions, service-account impersonation where applicable, and runtime access to source/output storage. Serverless removes cluster administration, not resource charges or IAM responsibilities.

## Learn the execution model

A Spark application has a driver that plans work and executors that process partitions. DataFrame operations build a lazy logical plan; actions such as `count`, `collect`, and `write` trigger execution. Shuffles redistribute records across workers for joins and aggregations and can dominate network, disk, and memory costs. A large `collect()` brings data to the driver and can crash it even if the workers have ample aggregate memory.

Use DataFrame/Spark SQL operations when possible so the optimizer can understand the plan. Python UDFs can add serialization and execution overhead and may prevent some optimizations. Partition counts affect concurrency and file sizes: too few partitions underutilize workers, while too many create scheduling overhead and tiny output files. Cache only data reused enough to justify memory pressure; unpersist when finished. [Apache Spark SQL guide](https://spark.apache.org/docs/latest/sql-programming-guide.html)

Managed clusters fit workloads requiring cluster customization, multiple related jobs, specific ecosystem services, or long-lived interactive environments. Serverless batches fit supported Spark jobs without a persistent cluster. Compare startup latency, runtime support, dependencies, private networking, autoscaling, and cost per completed workload. Ephemeral clusters can provide isolation while preserving cluster-level control. Do not leave an idle cluster running because the last job finished successfully.

## Lab: validate, aggregate, and inspect a plan

```bash
mkdir -p spark-lab
cd spark-lab
python3 -m venv .venv
source .venv/bin/activate
python -m pip install pyspark
cat > orders.py <<'PY'
from pyspark.sql import SparkSession, functions as F
spark = SparkSession.builder.appName('roadmap-orders').getOrCreate()
rows = [('a',100),('a',50),('b',80),('b',-2)]
df = spark.createDataFrame(rows, 'customer_id string, amount_minor long')
valid = df.filter(F.col('amount_minor') >= 0)
invalid = df.filter(F.col('amount_minor') < 0)
result = valid.groupBy('customer_id').agg(F.sum('amount_minor').alias('revenue_minor'))
result.explain(mode='formatted')
actual = {r['customer_id']:r['revenue_minor'] for r in result.collect()}
assert actual == {'a':150,'b':80}, actual
assert invalid.count() == 1
result.orderBy('customer_id').show()
result.write.mode('overwrite').parquet('output/orders-summary')
assert spark.read.parquet('output/orders-summary').count() == 2
spark.stop()
PY
spark-submit --master 'local[2]' orders.py
python -m pip freeze > requirements-tested.txt
```

The `collect()` here is safe only because the fixture has two aggregate rows. Expect one invalid record and output totals `a=150`, `b=80`. The isolated local output path is overwritten on reruns; never change it to a shared production prefix without a reviewed write strategy.

1. Inspect the plan and find the aggregation and exchange/shuffle stages. Explain which work can happen independently in partitions.
2. Add a small customer dimension and join it to the aggregate. Compare an ordinary join with a justified broadcast of the small side; do not broadcast a large table merely to remove a shuffle.
3. Generate a heavily skewed customer distribution. Describe salting or partial aggregation options and their effect on correctness.
4. Change the output to partition by date and discuss the number/size of files produced by repeated small jobs. Plan compaction for a lakehouse rather than writing thousands of tiny files indefinitely.

## Gated cloud deployment

Write a deployment manifest recording `PROJECT_ID`, `REGION`, runtime version, main script URI, dependency artifacts, service account, subnet, input/output URIs, and maximum runtime/capacity. Place source and sink data in compatible locations. If private workers need Google APIs, verify Private Google Access or the documented connectivity option; dependency downloads may need approved egress or prepackaged artifacts.

Open the managed Spark console's batch creation workflow, select PySpark, review runtime and networking parameters, and record the estimate before cancelling the design-only run. For a funded test, upload the script to a dedicated private bucket, change the output to a unique `gs://` prefix, submit a batch with the documented `gcloud dataproc batches submit pyspark` workflow, and inspect driver logs and Spark UI stages. Do not carry `--master local[2]` into cloud execution. [Submit a PySpark batch](https://docs.cloud.google.com/sdk/gcloud/reference/dataproc/batches/submit/pyspark)

For a cluster comparison, create an ephemeral cluster with deletion limits, run the same dataset and runtime-compatible code, and measure total wall time including provisioning. Compare total job cost, not only executor throughput after warm-up.

## Reliability, security, cleanup, and assessment

Design output commits and partition replacement so retries cannot publish partial or duplicate results. Preserve raw input and a run ID. An out-of-memory driver often points to `collect`, oversized broadcast data, or excessive metadata. Slow stages can come from skew, spill, many small files, or remote storage. Missing files may be a wrong prefix or worker IAM issue rather than a Spark syntax problem.

Grant the runtime identity read access to source prefixes and write access only to output/staging locations. Review third-party dependencies and avoid putting secrets in Spark configuration visible in logs. Set job timeouts and alert on failed or unusually long batches.

The local Spark process ends automatically; deactivate the environment and remove only `spark-lab` when done. Delete optional cloud clusters, inspect batch state, and remove staging/output artifacts when no longer needed. Exercise: a nightly 20-minute ETL currently keeps a cluster running all day. A worked evaluation compares serverless and ephemeral clusters with startup time, dependency support, and measured cost; it does not assume either option wins before testing.
