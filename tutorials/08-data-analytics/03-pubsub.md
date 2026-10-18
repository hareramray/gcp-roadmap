# Pub/Sub: delivery, retries, ordering, and dead-letter handling

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Analytics roadmap](../../roadmaps/08-data-analytics.md)

## Objectives and prerequisites

Publish a small event, observe redelivery, acknowledge it, and design a poison-message workflow. Allow 75–90 minutes. Complete [lab setup](../../LAB-SETUP.md), use Cloud Shell Bash with `PROJECT_ID`, and enable `pubsub.googleapis.com`. You need topic/subscription creation and publisher/subscriber permissions in the disposable project. The lab exchanges a few tiny messages; throughput, retained messages, and network transfer may still be billed. No long-running consumer is deployed.

## Resource and delivery model

A publisher sends messages to a topic. Each subscription maintains its own delivery state, so separate subscriptions provide independent fan-out. Multiple consumers of one subscription share the work. Creating several consumers does not create a broadcast to all of them. Pull/StreamingPull consumers request messages; push subscriptions deliver requests to an endpoint, which needs appropriate authentication, availability, and acknowledgment behavior.

The acknowledgment deadline is a lease, not a business transaction boundary. If processing fails or the lease expires, a message can be redelivered. Client libraries can extend leases, but a stuck worker must not retain work indefinitely. Default at-least-once delivery means consumers should tolerate duplicates. Store a business event ID or idempotency key with the resulting state change; the Pub/Sub message ID cannot deduplicate separately published copies of the same business event.

Exactly-once delivery is a subscription feature with documented limits, including pull-subscription support and regional scope. It prevents specified redeliveries after a successful acknowledgment within its contract; it does not make an external database update and acknowledgment one distributed transaction, and it does not deduplicate two separate publish operations. [Exactly-once delivery](https://docs.cloud.google.com/pubsub/docs/exactly-once-delivery)

Ordering is scoped to an ordering key and the service's regional publishing constraints, not an entire topic. Publisher and subscription configuration must support the intended behavior. A blocked hot key can limit throughput; ordering also changes retry behavior. Schemas can validate supported Avro or Protocol Buffer message formats and revisions, but business invariants still belong in the application. [Ordering](https://docs.cloud.google.com/pubsub/docs/ordering) · [Schemas](https://docs.cloud.google.com/pubsub/docs/schemas)

## Lab: demonstrate a duplicate delivery

```bash
gcloud services enable pubsub.googleapis.com --project="$PROJECT_ID"
export PUBSUB_SUFFIX="$(date +%s)"
export TOPIC="roadmap-orders-$PUBSUB_SUFFIX"
export SUB="roadmap-worker-$PUBSUB_SUFFIX"
gcloud pubsub topics create "$TOPIC" --project="$PROJECT_ID"
gcloud pubsub subscriptions create "$SUB" --topic="$TOPIC" \
  --ack-deadline=10 --project="$PROJECT_ID"
gcloud pubsub topics publish "$TOPIC" --project="$PROJECT_ID" \
  --message='{"event_id":"order-101-paid","order_id":101,"total_minor":2500}'
gcloud pubsub subscriptions pull "$SUB" --limit=1 \
  --format=json --project="$PROJECT_ID"
```

The pull intentionally omits automatic acknowledgment. Save the returned message ID. Wait beyond the acknowledgment deadline, then pull again; delivery timing is not an exact timer, so retry a bounded number of times if no message is immediately available.

```bash
gcloud pubsub subscriptions pull "$SUB" --limit=1 --auto-ack \
  --format=json --project="$PROJECT_ID"
```

The redelivered message should have the same message ID. Its acknowledgment ID can differ between deliveries. Once successfully acknowledged, later pulls should not return it under ordinary behavior. This small CLI exercise demonstrates leasing; it is not a full exactly-once client implementation.

1. Publish the same JSON payload again. Observe that this is a new publish with a new message ID but the same business `event_id`.
2. Write a consumer algorithm that starts a database transaction, inserts the event ID into a unique deduplication table, updates the order if new, commits, then acknowledges. If the process crashes after commit but before acknowledgment, the retry finds the event ID and avoids repeating the update.
3. Explain the remaining problem if an external payment API is called outside that transaction. Use its idempotency key or a transactional outbox and an idempotent dispatcher.

## Dead-letter and retry design

Create a dead-letter topic and a subscription on it before forwarding failed messages there. Configure the source subscription's dead-letter policy and the documented Pub/Sub service-agent permissions: publisher on the dead-letter topic and subscriber access on the source subscription. The maximum delivery-attempt setting is approximate and requires the permissions to work; it is not a precise counter-based SLA. [Dead-letter topics](https://docs.cloud.google.com/pubsub/docs/dead-letter-topics)

For a design-only extension, open the source subscription's edit page, choose exponential retry backoff, set a finite dead-letter attempt threshold, record the required IAM bindings, and cancel. For an intentionally funded tiny test, apply the settings, publish one invalid payload, reject it repeatedly with a real consumer, and verify it reaches the dead-letter subscription with context for diagnosis. Do not retry a permanently invalid schema forever.

Define an operator process: inspect redacted failure details, fix code or data, replay selected events with idempotency protection, and record the outcome. Dead-letter retention and access should be explicit; a queue of sensitive failed events is still sensitive data.

## Observe, secure, and troubleshoot

Monitor oldest unacknowledged message age, backlog, acknowledgment failures, consumer throughput, and end-to-end business delay. A growing backlog may mean slow processing, insufficient consumers, rate-limited dependencies, or a hot ordering key. Empty pulls do not prove the topic is empty: you may be using the wrong subscription, messages may be leased, or delivery may be delayed.

Give producers publish-only access and consumers access only to their subscriptions. Push endpoints should authenticate the service identity and validate payloads. Keep retries bounded with jitter and handle graceful shutdown so in-flight work is acknowledged only after durable completion.

## Cleanup and assessment

```bash
gcloud pubsub subscriptions delete "$SUB" --project="$PROJECT_ID" --quiet
gcloud pubsub topics delete "$TOPIC" --project="$PROJECT_ID" --quiet
```

Delete optional dead-letter subscriptions/topics too, and remove their dedicated IAM bindings if you added any. Exercise: one event is delivered twice and another arrives late. A worked design deduplicates by business event ID, uses event time for reporting, and treats arrival order separately from business sequence. You pass when you can state exactly which failures your acknowledgment and idempotency scheme covers.
