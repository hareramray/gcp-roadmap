# Database selection and data modeling

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Database roadmap](../../roadmaps/07-databases.md)

## Goal and prerequisites

Choose a database from access patterns, correctness requirements, scale, and operating cost. Then express the same small business domain as relational tables, documents, and wide-column keys. This 75-minute lab runs locally in Cloud Shell Bash using Python's standard library. It creates no cloud database and requires no database API or paid database role. `PROJECT_ID`, `REGION`, and `ZONE` come from [lab setup](../../LAB-SETUP.md) for the deployment design you write afterward.

## Start with questions, not product names

An operational database serves application requests: fetching one customer's order, updating inventory, or recording a payment. An analytical system scans and aggregates many records. These have different latency, concurrency, schema, and cost patterns. Exporting operational data into BigQuery often gives a cleaner architecture than running expensive reporting joins on the production writer.

Write your five most important queries, peak writes per second, growth rate, record size, transaction boundary, geography, acceptable staleness, and required recovery objectives. Distinguish average throughput from bursts. Document the largest tenant: an even distribution assumption often hides a future hotspot. A managed service reduces infrastructure work but leaves modeling, application authorization, indexes, recovery validation, and query efficiency with you.

## Map requirements to services

| Service | Common fit | Question that can disqualify it |
|---|---|---|
| Cloud SQL | Familiar MySQL, PostgreSQL, or SQL Server application | Can the primary and supported replicas meet write scale and availability needs? |
| AlloyDB for PostgreSQL | Demanding PostgreSQL-compatible transactional and analytical workloads | Are required extensions, behavior, and economics compatible? |
| Spanner | Relational transactions with horizontal scale and chosen regional/global topology | Can keys, access paths, and transaction scope avoid distributed hotspots? |
| Firestore | Document applications, especially real-time client experiences | Can queries and document boundaries satisfy the required invariants? |
| Bigtable | Large key-oriented, time-series, or wide-column workloads | Can most reads use known row keys or efficient ranges? |
| Memorystore | Low-latency caching and supported in-memory patterns | What happens when an entry disappears or the cache fails? |
| BigQuery | Analytical scans and transformations | Is the workload actually high-frequency operational point access? |

This is a starting point, not a universal ranking. SQL and NoSQL are data models, not shorthand for strong and weak consistency. Many managed databases offer transactions; their scope and failure behavior differ. Check the precise product contract. [Google Cloud database catalog](https://cloud.google.com/products/databases) · [Spanner transaction scope](https://docs.cloud.google.com/spanner/docs/transactions) · [Firestore data model](https://firebase.google.com/docs/firestore/data-model)

## Model one business process three ways

Suppose a shop has customers, orders, and line items. In a relational model, use separate tables and foreign keys. Store the price charged on each line item rather than looking up today's product price when calculating historical revenue. Use integer minor currency units or an appropriate exact decimal type instead of binary floating point for money.

In a document model, an order can contain a bounded collection of items so a reader retrieves a useful aggregate. Keep unbounded audit history in separate documents. Duplication is a deliberate read optimization that requires an update strategy; it is not a substitute for defining ownership of each fact. In a wide-column model, a key such as `customer#order_time#order_id` supports customer-history scans, while order-ID lookup needs a second access path. Neither model automatically provides every relational join.

## Lab: enforce invariants and observe a bad model

```bash
mkdir -p database-model-lab
cat > database-model-lab/model.py <<'PY'
import sqlite3
db = sqlite3.connect(':memory:')
db.execute('PRAGMA foreign_keys = ON')
db.executescript('''
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  status TEXT NOT NULL CHECK(status IN ('new','paid','cancelled')));
CREATE TABLE items(
  order_id INTEGER NOT NULL REFERENCES orders(id),
  sku TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  unit_price_minor INTEGER NOT NULL CHECK(unit_price_minor >= 0),
  PRIMARY KEY(order_id, sku));
INSERT INTO customers VALUES (1, 'Synthetic Customer');
INSERT INTO orders VALUES (101, 1, 'new');
INSERT INTO items VALUES (101, 'book', 2, 1500);
INSERT INTO items VALUES (101, 'pen', 3, 100);
''')
total = db.execute('SELECT SUM(quantity*unit_price_minor) FROM items WHERE order_id=101').fetchone()[0]
assert total == 3300
try:
    db.execute("INSERT INTO items VALUES (101, 'bad', -1, 100)")
except sqlite3.IntegrityError:
    print('Invalid negative quantity rejected')
else:
    raise AssertionError('Constraint missing')
print('Order total in minor units:', total)
PY
python3 database-model-lab/model.py
```

1. Verify the printed total is `3300` and the invalid quantity is rejected. Explain what each key and constraint protects.
2. Add an `order_events` table with an event ID and unique idempotency key. Try inserting the same payment event twice. Your application should recognize the duplicate without charging twice.
3. Write an equivalent order JSON document. Keep the line prices and quantities; explain whether an inventory decrement and order creation require a transaction spanning multiple records.
4. Propose Bigtable row keys for customer order history. Add a very large tenant and explain whether the prefix causes all writes to target one narrow range. Hashing can distribute load but increases fan-out reads; show that tradeoff explicitly.
5. Create `decision.md` with one selected service, one runner-up, rejected alternatives, cost units, backup strategy, migration path, and a measurable scale threshold for reconsidering the decision.

## Reliability, security, and troubleshooting

Separate identity authentication from database authorization. A connection may be encrypted and authenticated while still having excessive SQL privileges. Use parameterized queries, bounded connection pools, query timeouts, and retries only when operations are safe to repeat. Keep customer identifiers out of public logs and use synthetic fixtures for performance tests.

An application bug that reads then writes without a transaction can oversell inventory despite a healthy database. An index can speed reads while increasing write latency and storage. A global transaction can improve correctness while adding coordination latency. Test failure cases, not just successful reads. SQLite in this lab demonstrates constraints; it does not simulate distributed locking, cloud availability, or managed database performance.

## Cleanup and completion criteria

Remove the local `database-model-lab` directory when your notes are saved. There are no cloud resources to delete. You pass when your selection memo includes actual access patterns, schema examples, an invariant test, expected growth, and a recovery design. A worked recommendation for a small existing PostgreSQL shop is often Cloud SQL first, with analytical exports to BigQuery; globally distributed write requirements may justify evaluating Spanner, while a browser-heavy real-time document application may justify Firestore. State evidence for your particular case instead of treating these as universal answers.
