# Eventarc, CloudEvents, and event-driven architecture

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Design event routing and write a local idempotent consumer. Understand Pub/Sub, runtime identities, and HTTP first. The local lab uses Python/SQLite and costs nothing. A managed extension requires a supported event source, Eventarc APIs and permissions, a destination such as Cloud Run or Workflows, and potentially transport, execution, and logging charges.

## Concepts

An event reports that something happened: an object was finalized, a business order was accepted, or a state changed. It differs from a command telling a named worker what to do. Producers should publish stable event contracts and avoid forcing every consumer to know their internal database schema.

Eventarc routes supported events to supported destinations using configured filters and identities. Standard and Advanced offerings have different routing models and capabilities; check current source, destination, region, and edition support rather than treating every event as universally available. Some integrations use direct events, others use audit-log signals with relevant logging configuration. Prefer the appropriate documented event source for the use case.

CloudEvents standardizes envelope fields such as ID, source, type, and spec version, with event-specific data. An event ID is meaningful within its documented source context. Delivery can involve retries and duplicates. Destination code must make business effects idempotent, define poison-message handling, and monitor backlog/failure behavior. Routing configuration does not guarantee exactly-once business processing.

Trigger location, source location, destination location, runtime service account, service-agent permissions, and invoker permissions all matter. A correctly deployed trigger may still fail at delivery if the destination rejects its identity or expects a different payload.

## Local lab: suppress duplicate processing transactionally

The example stores the received event and its business effect in the same SQLite transaction. It demonstrates the principle; it is not a distributed production deduplication service.

```bash
python3 - <<'PY'
import sqlite3
db = sqlite3.connect(':memory:')
db.executescript('''
CREATE TABLE seen(source TEXT, id TEXT, PRIMARY KEY(source,id));
CREATE TABLE effects(source TEXT, event_id TEXT, order_id TEXT);
''')
event = {'specversion':'1.0', 'source':'/study/orders',
         'id':'event-1', 'type':'study.order.accepted',
         'data':{'order_id':'order-1'}}
def consume(e):
    with db:
        cur = db.execute('INSERT OR IGNORE INTO seen VALUES (?,?)',
                         (e['source'], e['id']))
        if cur.rowcount == 0:
            return 'duplicate'
        db.execute('INSERT INTO effects VALUES (?,?,?)',
                   (e['source'], e['id'], e['data']['order_id']))
    return 'applied'
print(consume(event))
print(consume(event))
count = db.execute('SELECT COUNT(*) FROM effects').fetchone()[0]
assert count == 1
print('business effects:', count)
db.close()
PY
```

Expect `applied`, `duplicate`, and one effect. Now explain why recording “seen” in one database and sending an external email in another system cannot be atomically covered by this local transaction. Consider an outbox, a downstream idempotency key, and repairable business state.

## Managed extension: a storage event receiver

1. Use a synthetic-data bucket and a dedicated authenticated Cloud Run receiver that parses the documented CloudEvent format.
2. Enable required services and assign the trigger identity only the documented event-receiving/invocation permissions. Review source-specific service-agent requirements.
3. Create an Eventarc trigger for the supported object-finalization event, filtering to the exact bucket and appropriate location. Use the current storage-to-Cloud Run quickstart for the command and region constraints.
4. Upload one small test object, inspect trigger status and destination logs, and verify the expected object identity/generation.
5. Replay the same event into your test handler to prove duplicate safety. Replace the payload with an invalid one and verify the error does not silently lose work.

## Verification, troubleshooting, and cleanup

Troubleshoot in stages: did the source operation occur, did it produce the selected event, did the filter match, did the transport deliver, did authentication succeed, and did the handler commit its effect? For missing audit-log events, inspect the exact audit category and method rather than enabling every log indiscriminately.

The local example closes its in-memory database. For the managed extension, delete the trigger first, then destination, sample objects/bucket, test identities, and any separately owned transport resources. Check which resources Eventarc manages automatically before deleting shared topics. Completion evidence is an event contract, duplicate test, delivery timeline, and poison-message recovery plan.

## References

- [Eventarc overview](https://docs.cloud.google.com/eventarc/docs/overview)
- [Eventarc Standard](https://docs.cloud.google.com/eventarc/standard/docs/overview)
- [Cloud Storage events to Cloud Run](https://docs.cloud.google.com/eventarc/standard/docs/run/route-trigger-cloud-storage)
- [CloudEvents specification](https://github.com/cloudevents/spec)
