# Git, Python, configuration, and API clients

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Track a small Python application in Git, separate configuration from code, write a meaningful test, and reason about API calls. Use Bash, Git, and Python 3 in a new local directory. No external repository, package installation, or cloud deployment is required.

## Concepts before commands

Git records snapshots of tracked files. The working tree contains edits; the index stages a proposed commit; the repository holds history. Branches identify lines of development. A code review should explain a behavioral change, its evidence, and its risks. `.gitignore` prevents ordinary accidental additions of matching untracked files; it does not erase files already committed. If a secret enters history, revoke or rotate it and follow repository remediation procedures.

A reliable application has explicit inputs and outputs, useful errors, tests, bounded resource use, and configuration supplied by its environment. Avoid using a global project ID hardcoded throughout source. Use a dependency environment for third-party packages and lock versions for a reproducible application. Do not install arbitrary packages globally into a shared machine just to try a sample.

An API has a contract: operation, endpoint, authentication, authorization, request schema, response schema, quota, pagination, timeout, and errors. REST commonly encodes JSON over HTTP; gRPC exposes typed remote procedures. Prefer a supported client library when it handles pagination, transport, and authentication correctly. Retries need bounded exponential backoff and jitter, and only apply safely when the operation is idempotent or has a documented request identifier.

## Lab: create and test a small event validator

1. Create a new, uniquely named directory and initialize a repository. Do not reuse an existing application directory: the next steps write sample files.

```bash
export PYTHON_LAB="$(mktemp -d "$HOME/gcp-study-python.XXXXXX")"
cd "$PYTHON_LAB" || exit 1
git init
printf '.venv/\n__pycache__/\n.env\n*.tfstate*\n' > .gitignore
```

2. Write a deterministic function. Monetary values are integer minor units to avoid binary floating-point rounding surprises.

```bash
cat > order.py <<'PY'
def validate_order(event):
    if not isinstance(event.get('id'), str) or not event['id'].strip():
        raise ValueError('order id must be a non-empty string')
    amount = event.get('amount_cents')
    if type(amount) is not int or amount < 0:
        raise ValueError('amount_cents must be a non-negative integer')
    return {'id': event['id'], 'amount_cents': amount, 'currency': 'USD'}
PY
cat > test_order.py <<'PY'
import unittest
from order import validate_order

class OrderTests(unittest.TestCase):
    def test_valid(self):
        result = validate_order({'id': 'order-1', 'amount_cents': 1250})
        self.assertEqual(result['amount_cents'], 1250)

    def test_negative_rejected(self):
        with self.assertRaises(ValueError):
            validate_order({'id': 'order-1', 'amount_cents': -1})

    def test_boolean_rejected(self):
        with self.assertRaises(ValueError):
            validate_order({'id': 'order-1', 'amount_cents': True})

if __name__ == '__main__':
    unittest.main()
PY
python3 -m unittest -v
git status --short
git diff
```

3. Inspect the three tests. The Boolean test matters because Python considers `bool` a subclass of `int`; the exact type check is intentional for this schema. Decide whether a real API should allow zero-value orders and how it represents other currencies.

4. Stage only the known files, inspect the staged diff, and optionally commit using your own Git identity:

```bash
git add .gitignore order.py test_order.py
git diff --cached
```

Do not configure an invented author identity. If your Git identity is already set, a local commit with a descriptive message is appropriate. Publishing to a remote is a separate action.

## Verification, troubleshooting, and extensions

All tests should pass. Deliberately remove the negative-value check and rerun; a test must fail, proving it protects actual behavior. Restore it before continuing. An import error usually means the command ran outside the intended directory or names differ. A failed commit due to identity configuration is unrelated to the application's correctness.

Sketch an HTTP wrapper: `POST /orders`, input JSON, validation error response, generated or client-supplied idempotency key, durable write, and response. Decide whether duplicate keys return the existing result or an explicit conflict. Logging the entire request could expose customer data; log a correlation ID and selected safe fields instead.

## Cleanup and practice

Keep the directory as a portfolio artifact or remove its known files after checking the path with `printf '%s\n' "$PYTHON_LAB"`. No billable resources were created. Add a missing-ID test, a maximum amount boundary, and a readme explaining the schema. Then describe how you would paginate a cloud resource list without silently returning only the first page.

## References

- [Git book](https://git-scm.com/book/en/v2)
- [Python tutorial](https://docs.python.org/3/tutorial/)
- [Python unittest](https://docs.python.org/3/library/unittest.html)
- [Google Cloud client libraries](https://docs.cloud.google.com/apis/docs/cloud-client-libraries)
- [Google API design guide](https://cloud.google.com/apis/design)
