# Data protection, privacy, residency, and compliance

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Create a data classification, de-identification, and control-evidence plan. This local design lab uses synthetic records and requires no paid scan or regulated data. Use Cloud Shell Bash; use `PROJECT_ID`, `REGION`, and `ZONE` from the setup guide in the proposed architecture. A live Sensitive Data Protection exercise would require the DLP API, appropriate DLP and source-data roles, approved service-agent access, and a reviewed data location. Assured Workloads requires organization-level setup and an applicable control package. Do not infer compliance from a successful API call.

## Protect the complete data lifecycle

Classify data by sensitivity and business purpose before choosing controls. Inventory collection, storage, processing, sharing, logs, backups, analytics extracts, deletion, and recovery. Data minimization often removes risk more effectively than adding another encryption layer. Retention and legal holds can conflict with deletion requests; translate approved policy into specific technical actions and evidence rather than improvising a legal conclusion.

Sensitive Data Protection supports discovery, classification, inspection, and de-identification. Discovery profiles help locate high-risk datasets; inspection finds matching information within supported content; transformations can mask, redact, generalize, or tokenize data. Detector likelihood is not certainty, and custom identifiers require representative test data. [Sensitive Data Protection concepts](https://docs.cloud.google.com/sensitive-data-protection/docs/concepts).

Masking hides or replaces selected characters; redaction removes values; pseudonymization preserves a linkage through a controlled token or cryptographic transformation. Pseudonymized data can remain sensitive because re-identification may be possible. A plain unsalted hash of a low-entropy identifier is not a robust privacy boundary. Design access to re-identification keys separately from access to the transformed dataset. [De-identification overview](https://docs.cloud.google.com/sensitive-data-protection/docs/deidentify-sensitive-data).

Residency asks where particular data is stored or processed under a service's terms. Sovereignty may add operational access, personnel, jurisdiction, and key-control requirements. An organization location constraint alone does not answer every residency question. Assured Workloads applies control packages with product-specific coverage and monitoring, but customers still own application configuration, identity, data handling, and evidence. [Assured Workloads overview](https://docs.cloud.google.com/assured-workloads/docs/overview).

## Lab: build a protected analytics handoff

1. Create a local synthetic CSV. These are invented training values, not real customer records:

   ```bash
   cat > synthetic-customers.csv <<'EOF'
   customer_id,email,postcode,order_total
   C001,alice@example.invalid,560001,1250
   C002,bob@example.invalid,110001,750
   EOF
   ```

2. Define a classification table: customer ID is restricted linkage data; email is personal contact data; postcode may enable location inference; order total is commercial data. The analytical purpose is regional order totals, so explain why an email field should not reach the analytics copy at all.

3. Create a local minimized output using Python available in Cloud Shell:

   ```bash
   python3 - <<'PY'
   import csv
   with open('synthetic-customers.csv', newline='') as src, open('analytics.csv', 'w', newline='') as out:
       reader = csv.DictReader(src)
       writer = csv.DictWriter(out, fieldnames=['region_prefix', 'order_total'])
       writer.writeheader()
       for row in reader:
           writer.writerow({'region_prefix': row['postcode'][:2], 'order_total': row['order_total']})
   PY
   cat analytics.csv
   ```

   This illustrates minimization; it is **not** a production de-identification guarantee. A tiny dataset can remain identifying through combinations of attributes.

4. Draft a Sensitive Data Protection inspection specification: source, location, built-in and custom infoTypes, sampling policy, likelihood threshold, exclusion rules, output access, and response to findings. Define planted synthetic positives and benign negatives. Acceptance requires measuring missed detections and false positives, not just observing a completed job.

5. Draw the proposed storage, processing, logging, backup, and export regions. Choose a control package only after checking its supported products and required controls. Add a cross-region disaster recovery requirement and identify whether it conflicts with the chosen data boundary.

6. Build an evidence register with requirement, implementation, accountable owner, test, retained artifact, and review date. Include least privilege, consent or approved processing basis as supplied by the organization, retention enforcement, encryption access, deletion propagation, and recovery testing. Google certifications supply provider evidence; they do not certify your application automatically.

## Verification, cleanup, cost, and exercises

Check that `analytics.csv` has neither email nor original customer ID and that row totals remain unchanged. Document residual risks such as small groups and linkability. Real discovery and inspection can charge by scanned volume and generate additional storage or analytics costs; estimate the scope before scanning an organization.

Remove both synthetic files after review. Never substitute real patient, employee, payment, or customer information into the exercise. Extend the design with a deletion request affecting backups and derived tables, then show how retention policy, immutable backups, access controls, and eventual deletion are reconciled by the responsible privacy and security teams.

