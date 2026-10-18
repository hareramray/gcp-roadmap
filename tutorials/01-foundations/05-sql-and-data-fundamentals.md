# SQL, data modeling, transactions, and analytical thinking

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Model related entities, query them with SQL, identify data-quality problems, and distinguish transactional from analytical systems. Use Python's built-in SQLite module locally. This lab needs no Google Cloud account and avoids scanning paid warehouse data while you learn query semantics.

## Understand the data model

A relational table has named columns and rows representing facts at a defined **grain**. A customer row and an order row represent different things. Primary keys identify rows; foreign keys express relationships. Normalization reduces update anomalies by avoiding unnecessary duplication. Analytical models may deliberately denormalize or use fact and dimension tables for reporting. The correct design depends on access patterns, correctness rules, and lifecycle.

Transactions group operations into a unit of work. ACID describes atomicity, consistency of defined constraints, isolation, and durability. Isolation levels determine what concurrent transactions may observe; do not assume every SQL engine behaves identically. An index can speed selected reads but consumes storage and adds write overhead. A table scan is not always bad, especially in columnar analytics.

SQL's logical processing and `NULL` semantics often surprise beginners. `WHERE` filters input rows; `GROUP BY` creates groups; `HAVING` filters groups. `NULL` represents missing or unknown information and is tested with `IS NULL`, not `= NULL`. An inner join drops non-matching rows; a left join preserves rows from its left side. Joining two one-to-many relationships can multiply rows and inflate totals.

OLTP favors short transactions and operational correctness. OLAP favors aggregation over substantial historical data. Streaming processes ongoing events; batch processes bounded sets. Event time describes when something happened; processing time describes when it was handled. Schema evolution, late data, duplicates, and data lineage matter in either mode.

## Lab: join, aggregate, and verify

Run the following self-contained local example:

```bash
python3 - <<'PY'
import sqlite3
db = sqlite3.connect(':memory:')
db.execute('PRAGMA foreign_keys=ON')
db.executescript('''
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(
  id INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  amount_cents INTEGER NOT NULL CHECK(amount_cents >= 0)
);
INSERT INTO customers VALUES (1, 'Asha'), (2, 'Ravi'), (3, 'Mina');
INSERT INTO orders VALUES (101,1,1200), (102,1,800), (103,2,500);
''')
query = '''
SELECT c.name, COUNT(o.id) AS orders,
       COALESCE(SUM(o.amount_cents),0) AS spend_cents
FROM customers c LEFT JOIN orders o ON o.customer_id=c.id
GROUP BY c.id,c.name ORDER BY spend_cents DESC;
'''
rows = db.execute(query).fetchall()
print(rows)
assert rows == [('Asha', 2, 2000), ('Ravi', 1, 500), ('Mina', 0, 0)]
try:
    db.execute('INSERT INTO orders VALUES (104,99,100)')
except sqlite3.IntegrityError as exc:
    print('Expected invalid customer rejection:', exc)
else:
    raise AssertionError('Foreign key should reject this row')
db.close()
PY
```

The row for Mina remains because of the left join. `COUNT(o.id)` returns zero for her missing order; `COUNT(*)` would count the preserved joined row. `COALESCE` turns a missing aggregate into the reporting value zero. The foreign-key failure proves the database is enforcing the chosen relationship in this session.

Now modify the query to use an inner join and predict the missing customer before executing it. Add a `HAVING SUM(o.amount_cents) >= 1000` clause and explain why it belongs after grouping. Design a `payments` table with multiple payments per order, then explain why directly joining both payments and line items may duplicate monetary totals.

## Verification and troubleshooting

Record expected row counts before each transformation. Reconcile aggregate totals to the source amount of 2,500 cents. If totals grow unexpectedly, inspect join cardinality before blaming the database. If a query returns no null rows, check whether a `WHERE` condition on the right side has effectively converted a left join into an inner join.

SQLite is a teaching environment here. BigQuery uses GoogleSQL and has different data types, execution economics, partitioning, and transaction capabilities. Cloud SQL and AlloyDB inherit engine-specific behavior. Repeat performance and concurrency experiments in the actual chosen engine before drawing production conclusions.

## Cleanup, security, and exercises

The database exists only in memory and is closed at the end. No resource cleanup or payment is required. Use synthetic customer names. Practice defining data retention and access requirements, a composite uniqueness constraint, and a transaction that creates an order and its line items together. Write three data-quality assertions: uniqueness, referential integrity, and non-negative amounts. Completion evidence is the query output and a short explanation of grain and join cardinality.

## References

- [SQLite SQL reference](https://www.sqlite.org/lang.html)
- [Python sqlite3](https://docs.python.org/3/library/sqlite3.html)
- [BigQuery GoogleSQL reference](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax)
- [Google Cloud database products](https://cloud.google.com/products/databases)
