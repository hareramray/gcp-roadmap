# Cloud Storage: objects, access, lifecycle, and recovery

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Storage roadmap](../../roadmaps/06-storage.md)

## What you will learn

Store application artifacts safely, select locations and storage classes, protect against accidental changes, and explain why object storage is different from a disk. Allow 90–120 minutes. This tutorial uses a few tiny objects; storage, requests, retrieval, and network transfer can still be billed. Commands below are instructions for your own sandbox, not actions already performed.

## Understand the resource model

A bucket belongs to a project and has a globally unique name, location, access policy, and default storage class. An object has a name, bytes, metadata, and a generation identifying a particular data version. A name such as `orders/2026/10/a.json` is commonly a prefix in a flat namespace; do not assume all tools provide directory rename or POSIX filesystem behavior. Hierarchical namespace, managed folders, and Cloud Storage FUSE solve different problems. FUSE adapts object access for applications but should not be assumed to behave like a general purpose database filesystem.

Successful object writes, reads, deletes, and listings are strongly consistent. IAM changes and public caches have different propagation behavior. A successful upload does not make a multi-object business transaction atomic. Use generation preconditions for concurrent updates and pin a generation when a multi-request reader must see one version. [Consistency documentation](https://docs.cloud.google.com/storage/docs/consistency)

Standard suits frequent access. Nearline, Coldline, and Archive exchange lower storage prices for retrieval charges and minimum storage durations. Minimum duration is a billing commitment for each stored object, not an access delay. Autoclass automates class transitions according to service rules; compare its management charges and constraints with a hand-written lifecycle policy. Location affects residency, availability design, proximity, and transfer cost. A multi-region bucket does not automatically meet every application recovery requirement. [Storage classes](https://docs.cloud.google.com/storage/docs/storage-classes)

Uniform bucket-level access centralizes authorization in IAM instead of mixing IAM and object ACLs. Public access prevention blocks public grants; it does not revoke valid authenticated access. Signed URLs grant temporary bearer access, so anyone holding the URL can use it until it expires or its effective permissions become invalid. Keep their lifetimes short and avoid putting them in logs. Encryption at rest is automatic; customer-managed keys introduce key IAM, rotation, location, and availability responsibilities.

## Prerequisites and permissions

Complete [lab setup](../../LAB-SETUP.md), export `PROJECT_ID`, `REGION`, and `ZONE`, and use Cloud Shell Bash. You need permission to enable `storage.googleapis.com`, create a bucket, and manage objects. A sandbox Storage Admin role is convenient for this lab; production applications should receive narrower object roles on the specific bucket. Keep the project and bucket private and use synthetic files.

## Lab: write, version, recover, and inspect

1. Create a unique private bucket and explicitly choose protection settings. Disabling soft delete here avoids retaining this disposable lab's deleted versions; do not copy that decision into production without a recovery assessment.

```bash
gcloud services enable storage.googleapis.com --project="$PROJECT_ID"
export BUCKET="${PROJECT_ID}-storage-lab-$(date +%s)"
gcloud storage buckets create "gs://$BUCKET" \
  --project="$PROJECT_ID" --location="$REGION" \
  --uniform-bucket-level-access --public-access-prevention
gcloud storage buckets update "gs://$BUCKET" --clear-soft-delete
gcloud storage buckets update "gs://$BUCKET" --versioning
```

2. Wait at least 30 seconds after enabling versioning before replacing objects. While waiting, inspect `gcloud storage buckets describe "gs://$BUCKET"` and its IAM policy. Then upload two generations:

```bash
printf '%s\n' '{"status":"draft"}' > storage-order.json
gcloud storage cp storage-order.json "gs://$BUCKET/orders/order.json"
printf '%s\n' '{"status":"approved"}' > storage-order.json
gcloud storage cp storage-order.json "gs://$BUCKET/orders/order.json"
gcloud storage ls --all-versions "gs://$BUCKET/orders/order.json"
gcloud storage cat "gs://$BUCKET/orders/order.json"
```

3. The listing should contain two generation-qualified objects. Copy the older generation number from the output; replace the placeholder before running:

```bash
export OLD_GENERATION="REPLACE_WITH_OLDER_GENERATION"
gcloud storage cp "gs://$BUCKET/orders/order.json#$OLD_GENERATION" \
  "gs://$BUCKET/orders/recovered.json"
gcloud storage cat "gs://$BUCKET/orders/recovered.json"
```

The recovered object must say `draft`; the current original must still say `approved`. This restores into a separate object so you can validate before replacing live data.

4. Create a lifecycle policy for **noncurrent** versions only and inspect the result:

```bash
cat > storage-lifecycle.json <<'JSON'
{"rule":[{"action":{"type":"Delete"},"condition":{"isLive":false,"daysSinceNoncurrentTime":7}}]}
JSON
gcloud storage buckets update "gs://$BUCKET" \
  --lifecycle-file=storage-lifecycle.json
gcloud storage buckets describe "gs://$BUCKET"
```

Lifecycle execution is asynchronous. Do not expect the older generation to disappear immediately. Retention policies and object holds can prevent otherwise eligible deletion. Locking retention can be irreversible and is deliberately excluded from this lab. Versioning preserves replaced versions; soft delete retains deleted data for a configured period; retention prevents deletion before a deadline. These are complementary mechanisms with distinct cost effects. [Lifecycle](https://docs.cloud.google.com/storage/docs/lifecycle) · [Soft delete](https://docs.cloud.google.com/storage/docs/soft-delete) · [Retention policies](https://docs.cloud.google.com/storage/docs/bucket-lock)

## Diagnose and operate

A `409` on creation usually means the name exists; generate a new one. A `403` may be IAM, an organization policy, VPC Service Controls, or a disabled encryption key rather than a missing object. A deletion failure can be a hold or retention policy. An unexpected bill often comes from retained generations, early deletion charges, retrieval, or cross-location traffic. Track object count, bytes by class, request errors, and audit events; enable Data Access logs deliberately because their volume and cost can be significant.

## Cleanup and exercises

```bash
# Delete only this uniquely named disposable bucket and every stored generation.
gcloud storage rm --recursive --all-versions "gs://$BUCKET"
rm -f storage-order.json storage-lifecycle.json
```

Verify the bucket is absent with `gcloud storage buckets list --project="$PROJECT_ID"`. If retention blocks deletion, document the expiration instead of trying to bypass protection.

Design an archive for invoices read once a year but deleted after 45 days. A worked answer rejects a class with a long minimum duration unless the savings outweigh early deletion charges. Design another bucket for deployment artifacts: use Standard, private IAM, versioned names or generation preconditions, and a policy that removes obsolete versions after rollback windows. Explain which control protects against a mistaken overwrite, an attacker with deletion privileges, and an expired signed URL; no single control covers all three.
