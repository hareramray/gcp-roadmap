# Tracing, profiling, and OpenTelemetry

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Generate local OpenTelemetry spans, interpret a request's critical path, and distinguish tracing from profiling. Use Bash in Cloud Shell and the setup guide's `PROJECT_ID`, `REGION`, and `ZONE` for any later exporter configuration. The local lab needs Python 3, pip, and permission to download packages. It does not send telemetry to Google Cloud. Cloud Trace export would require its API, Trace Agent or equivalent write permissions, supported exporter configuration, and billing review; Cloud Profiler has its own API and runtime-specific agent prerequisites.

## Pick the right signal

A trace represents a distributed operation; spans represent work within it. Parent/child relationships and propagated trace context connect services. The critical path is the sequence that controls end-to-end duration, not necessarily the sum of every span: concurrent calls overlap. A slow database span may indicate database execution, a connection wait, network delay, or instrumented wrapper time. Interpret what the instrumentation actually measures. [Cloud Trace overview](https://docs.cloud.google.com/trace/docs/overview).

OpenTelemetry standardizes instrumentation and telemetry pipelines. Applications create spans and metrics; a collector can receive, process, sample, and export telemetry. Choose semantic conventions, resource attributes such as service name/version, propagation format, and a sampling policy. Head sampling decides early; tail sampling can decide after seeing more of a trace but requires buffering and infrastructure. Neither guarantees that every rare failure is retained without an intentional policy. [Application instrumentation](https://docs.cloud.google.com/stackdriver/docs/instrumentation/overview).

Profiles attribute sampled CPU, allocation, or other supported runtime behavior to code. A trace tells you where a request waited; a profile helps identify code consuming resources across a workload. Supported profile types differ by language and environment. A CPU profile is a poor explanation for a request that mostly waits on a network socket. [Cloud Profiler overview](https://docs.cloud.google.com/profiler/docs/about-profiler).

## Lab: instrument a local request

1. Create an isolated environment and install the API and SDK. For a real repository, pin reviewed versions in its dependency lock file:

   ```bash
   python3 -m venv otel-lab-venv
   source otel-lab-venv/bin/activate
   python -m pip install opentelemetry-api opentelemetry-sdk
   ```

2. Run a local console-export example:

   ```bash
   cat > trace_lab.py <<'PY'
   import time
   from opentelemetry import trace
   from opentelemetry.sdk.resources import Resource
   from opentelemetry.sdk.trace import TracerProvider
   from opentelemetry.sdk.trace.export import SimpleSpanProcessor, ConsoleSpanExporter

   provider=TracerProvider(resource=Resource.create({"service.name":"orders-lab"}))
   provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))
   trace.set_tracer_provider(provider)
   tracer=trace.get_tracer("roadmap.lab")
   with tracer.start_as_current_span("checkout") as root:
       root.set_attribute("app.environment","training")
       with tracer.start_as_current_span("inventory"):
           time.sleep(0.03)
       with tracer.start_as_current_span("payment"):
           time.sleep(0.06)
   provider.shutdown()
   PY
   python trace_lab.py > spans.json.txt
   ```

3. Read the output. Expect three spans sharing a trace ID. The inventory and payment spans reference the checkout span as their parent; checkout has no parent in this local process. Durations should be approximately 30 ms, 60 ms, and at least 90 ms, with scheduling overhead. Console output is a sequence of JSON objects, not necessarily one JSON array.

4. Explain what changes across HTTP services: the caller injects context and the callee extracts it using compatible propagation. Simply logging a random request ID does not create parentage. For asynchronous messages, choose appropriate parent or span-link semantics and preserve the context safely in message metadata.

5. Add one error case in your design: payment times out. Record a sanitized exception and span status, preserve the trace ID in an operational log, and define whether retries are separate spans. Never attach payment details, bearer tokens, or customer payloads as span attributes.

6. Plan a performance investigation. If traces show long payment waits with low CPU, inspect downstream latency and connection pools. If profiles show a CPU hotspot during serialization, benchmark a change under representative load and compare latency distributions as well as CPU usage.

## Verification, cleanup, cost, and exercises

Success means you can explain parent IDs, resource attributes, durations, and the critical path from your local output. Missing spans in a cloud deployment can result from sampling, a broken propagator, absent export permission, queue drops, shutdown before flush, or querying the wrong project/service.

Deactivate the environment and remove the lab files and virtual environment after reviewing their exact paths. No cloud ingestion occurred. Real telemetry can create ingestion and storage costs, so control sampling and attribute cardinality. Extend the example with two parallel dependencies and demonstrate why adding their durations overestimates the user-visible request latency.

