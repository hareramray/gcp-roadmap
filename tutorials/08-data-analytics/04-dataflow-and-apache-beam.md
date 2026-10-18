# Dataflow and Apache Beam: batch and streaming pipelines

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Analytics roadmap](../../roadmaps/08-data-analytics.md)

## Goals and prerequisites

Build a local Beam pipeline, understand event-time windows, and plan a Dataflow deployment with explicit reliability and cost controls. Allow 90 minutes. Complete [lab setup](../../LAB-SETUP.md), Pub/Sub, and BigQuery fundamentals. Use Cloud Shell Bash and a Python version supported by the Beam release you install. The default DirectRunner exercise creates no Dataflow workers. Cloud execution requires billing, `dataflow.googleapis.com`, a staging/temp bucket, a worker service account, Dataflow job permissions, and data-source/sink access.

## Separate the programming model from execution

Apache Beam defines a pipeline as transforms over `PCollection` data. `Map` handles element-wise transformations, `ParDo` supports richer processing, and grouping/combining reorganize elements by key. A runner executes the graph; DirectRunner is useful for local correctness, while Dataflow provides managed cloud execution. A Python loop over all records on the driver is not a distributed transform. [Beam programming model on Dataflow](https://docs.cloud.google.com/dataflow/docs/concepts/beam-programming-model)

Batch inputs are bounded. Streaming inputs are unbounded, so a computation needs a strategy for deciding when to emit results. Event time is when a business event occurred; processing time is when the system handled it. Watermarks estimate event-time progress. Windows divide data into logical groups, triggers decide when results emit, allowed lateness describes how late data is handled, and accumulation mode determines whether later panes replace or add to prior results. A five-minute window does not guarantee a result exactly five minutes after the wall clock. [Beam programming guide](https://beam.apache.org/documentation/programming-guide/)

Exactly-once processing terminology must be scoped to the runner, source, sink, and connectors. An arbitrary HTTP request in a retryable transform can happen more than once. Use idempotency keys, transactional sinks, or a supported write protocol for external side effects. Bad records should go to a bounded, observable error path; logging every payload and silently dropping it is not a recovery strategy.

## Lab: aggregate event-time windows locally

```bash
mkdir -p beam-lab
cd beam-lab
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install apache-beam
cat > pipeline.py <<'PY'
import apache_beam as beam
from apache_beam.testing.util import assert_that, equal_to

events = [
    {'customer': 'a', 'value': 100, 'ts': 10},
    {'customer': 'a', 'value': 50, 'ts': 80},
    {'customer': 'b', 'value': 20, 'ts': 90},
    {'customer': 'a', 'value': 70, 'ts': 310},
]

class LabelWindow(beam.DoFn):
    def process(self, item, window=beam.DoFn.WindowParam):
        yield (item[0], int(window.start), item[1])

with beam.Pipeline() as p:
    output = (
        p
        | 'Read fixture' >> beam.Create(events)
        | 'Assign event time' >> beam.Map(
            lambda e: beam.window.TimestampedValue((e['customer'], e['value']), e['ts']))
        | 'Five minute windows' >> beam.WindowInto(beam.window.FixedWindows(300))
        | 'Sum by customer' >> beam.CombinePerKey(sum)
        | 'Add window label' >> beam.ParDo(LabelWindow())
        | 'Collect test output' >> beam.WindowInto(beam.window.GlobalWindows())
    )
    assert_that(output, equal_to([('a', 0, 150), ('b', 0, 20), ('a', 300, 70)]))
    output | 'Print results' >> beam.Map(print)
PY
python pipeline.py
python -m pip freeze > requirements-tested.txt
```

Expect three tuples with the stated values; output order is unspecified. The test compares contents rather than requiring deterministic ordering.

1. Change the final event timestamp from `310` to `299` and update the expected first-window total to `220`. This demonstrates that event timestamps, not list position, determine window membership.
2. Add a malformed event and create a parsing `DoFn` with a tagged error output. Count invalid records and retain a redacted reason and source identifier.
3. Use Beam's `TestStream` in a follow-up test to advance watermarks and inject late events. The bounded fixture above does not prove streaming trigger or late-data behavior.
4. Design a sink key containing customer and window start. Explain whether each emitted pane should overwrite a result or add a delta; using the wrong choice can double-count revenue.

## Gated Dataflow workflow

Create a deployment worksheet with `PROJECT_ID`, `REGION`, worker identity, private subnet, staging bucket, temp bucket, service account permissions, maximum workers, machine type, and estimated runtime. Co-locate compatible source/sink resources. Dataflow worker access differs from the user's permission to submit a job; the worker must read sources, write sinks, and access staging artifacts. Avoid relying on a broadly privileged default service account.

In Dataflow → Create job from template, inspect an appropriate supported template's parameters and validation, then cancel for the design-only path. A funded custom-pipeline trial should install Beam's Google Cloud extras, use `DataflowRunner`, set project/region/temp/staging/service-account options, and cap worker growth. Package dependencies reproducibly; a Flex Template can make runtime images and launch parameters reviewable. [Dataflow quickstarts](https://docs.cloud.google.com/dataflow/docs/quickstarts) · [Worker service account](https://docs.cloud.google.com/dataflow/docs/concepts/security-and-permissions)

Inspect graph stages, throughput, system lag, watermark lag, worker CPU/memory, shuffle, and errors. Inject one duplicate and one malformed event, then compare the sink with expected business totals. For streaming changes, decide whether update, drain, or cancel is appropriate. Drain attempts to finish buffered work according to service behavior; cancel stops the job and can abandon pending work.

## Failure modes, cleanup, and exercise

A stalled pipeline may be waiting on watermarks, a hot key, slow external calls, oversized elements, missing worker permissions, or network egress. Increasing workers cannot split one inherently serial hot-key operation without changing the algorithm. Keep secrets out of pipeline options and logs; use authorized identities and supported secret access.

The local run ends automatically. Deactivate the virtual environment and remove `beam-lab` if no longer needed. For optional Dataflow runs, stop the job, verify its terminal state, and remove dedicated staging/temp objects and sinks; streaming jobs continue billing while running. Exercise: late payments arrive a day after a dashboard window closes. A worked design preserves immutable events and has a correction/reconciliation path, with explicit allowed lateness and versioned aggregates. You pass when you can explain how each duplicate, late event, and failed sink write changes the final result.
