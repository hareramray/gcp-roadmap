# Batch, HPC, GPUs, TPUs, and capacity planning

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Workload first, hardware second

This tutorial teaches batch scheduling with a small CPU job, then develops an accelerator and high-performance-computing design exercise. The GPU and TPU portions are intentionally planning labs because scarce capacity and expensive accelerators should not be created as incidental examples. Run commands in Cloud Shell Bash with the shared setup. The optional Batch run uses billable VMs and logs. Allow 60 minutes.

Batch accepts a job specification, schedules tasks, provisions compatible Compute Engine resources, and records execution. A job contains task groups, tasks, and runnables. A runnable is a script or container operation. Task count describes the total work; parallelism bounds how much runs at once. Allocation policy constrains resources, while the service account supplies API permissions. Batch's control plane does not remove the costs or quotas of underlying VMs, storage, and networking. [Job execution model](https://docs.cloud.google.com/batch/docs/create-run-job)

HPC is a workload category, not a synonym for “use a GPU.” Embarrassingly parallel simulation might suit independent Batch tasks. Tightly coupled MPI jobs need coordinated placement, low-latency networking, and collective communication. Large-memory analytics may be constrained by RAM; checkpoint-heavy workloads by storage throughput. Benchmark elapsed time, cost per completed task, and failure recovery before selecting hardware.

## Optional hands-on: a bounded Batch job

Use a dedicated service account with Batch Agent Reporter and Logging Log Writer, plus only application-specific access. The caller needs Batch Job Editor and permission to act as that account. Your administrator should authorize these scoped grants.

```bash
gcloud services enable batch.googleapis.com compute.googleapis.com \
  logging.googleapis.com
gcloud iam service-accounts create batch-lab-runtime
export BATCH_SA="batch-lab-runtime@${PROJECT_ID}.iam.gserviceaccount.com"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$BATCH_SA" --role=roles/batch.agentReporter
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$BATCH_SA" --role=roles/logging.logWriter
cat > batch-job.json <<EOF
{
  "taskGroups": [{
    "taskCount": 4,
    "parallelism": 2,
    "taskSpec": {
      "runnables": [{"script": {"text": "echo task=\$BATCH_TASK_INDEX; sleep 5; echo complete"}}],
      "computeResource": {"cpuMilli": 1000, "memoryMib": 512},
      "maxRetryCount": 1,
      "maxRunDuration": "120s"
    }
  }],
  "allocationPolicy": {
    "instances": [{"policy": {"machineType": "e2-standard-2", "provisioningModel": "SPOT"}}],
    "serviceAccount": {"email": "$BATCH_SA"}
  },
  "logsPolicy": {"destination": "CLOUD_LOGGING"}
}
EOF
gcloud batch jobs submit batch-lab --location="$REGION" --config=batch-job.json
gcloud batch jobs describe batch-lab --location="$REGION"
gcloud batch tasks list --job=batch-lab --location="$REGION"
```

This simple example relies on a usable default network and its normal outbound connectivity. If your organization removes default networks or prohibits external addresses, first configure an approved subnet, Private Google Access, and the required egress; use the Batch networking guide rather than opening unrestricted inbound rules. No inbound application connection is needed for this job.

Expect queued/scheduled/running transitions followed by `SUCCEEDED` and four task completions. A scheduled task can wait for capacity even when quota is available. Logs should contain task indexes and completion lines. Spot VMs can be interrupted and have no availability guarantee, so a successful run is not proof that retries are unnecessary. [Basic job guide](https://docs.cloud.google.com/batch/docs/create-run-basic-job)

## GPU and TPU planning lab

Build a resource worksheet before requesting an accelerator:

| Decision | Evidence to collect |
| --- | --- |
| Framework compatibility | CUDA/cuDNN and driver requirements for GPUs; supported JAX, TensorFlow, or PyTorch/XLA path for TPUs |
| Memory | Model weights, gradients, optimizer state, activations, batch size, and headroom |
| Placement | Supported region/zone, machine family, accelerator count, network topology, storage proximity |
| Capacity | Project quota, regional availability, reservation or supported capacity procurement method |
| Recovery | Checkpoint interval, durable checkpoint location, resume time, duplicate-output handling |
| Economics | Utilization, host CPU/RAM cost, data transfer, storage throughput, and cost per result |

GPU quota does not reserve physical hardware. Reservations and capacity options are separate decisions, and supported combinations vary by accelerator family. GPU drivers and container runtime libraries must match the chosen platform. A container can import a framework successfully while silently running on CPU; verify device visibility and actual utilization.

TPUs use purpose-built accelerators with topology and software requirements. Do not translate a GPU count directly into a TPU choice. Measure model compatibility, compilation overhead, input pipeline throughput, and distributed scaling efficiency. For multi-host work, one slow input worker can limit all workers. [Cloud TPU overview](https://docs.cloud.google.com/tpu/docs/intro-to-tpu)

## Reliability, troubleshooting, and cleanup

Use checkpointing for long-running work and partition output names by stable job/task identifiers. A retry should overwrite safely or commit results atomically. Keep training data and checkpoints private; do not embed credentials in container images. For MPI, test failure behavior across the entire group instead of assuming per-task retries repair a broken communicator.

If a Batch job remains queued, inspect status events for quota, capacity, IAM, image-pull, and networking failures. If it repeatedly fails, read per-task exit codes before raising retry counts. Excessive retries can multiply costs while hiding deterministic application errors.

```bash
gcloud batch jobs delete batch-lab --location="$REGION"
gcloud projects remove-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$BATCH_SA" --role=roles/batch.agentReporter
gcloud projects remove-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$BATCH_SA" --role=roles/logging.logWriter
gcloud iam service-accounts delete "$BATCH_SA"
```

Check that Batch-managed VMs finish deletion and remove only lab-created output artifacts. Exercise: compare a four-hour checkpointless Spot job with a checkpointed version, calculating lost work for an interruption at hour three.

## Official references

- [Batch prerequisites](https://docs.cloud.google.com/batch/docs/get-started)
- [Batch networking](https://docs.cloud.google.com/batch/docs/networking-overview)
- [Compute Engine GPUs](https://docs.cloud.google.com/compute/docs/gpus)
- [HPC cluster architecture and management](https://docs.cloud.google.com/compute/docs/hpc/overview-hpc-clusters)
