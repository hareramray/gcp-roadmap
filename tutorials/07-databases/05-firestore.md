# Firestore: documents, queries, indexes, and security rules

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [Database roadmap](../../roadmaps/07-databases.md)

## Goals and product choices

Model a small user-owned document collection, test authorization locally, and plan queries and indexes. Allow 90 minutes. Firestore's terminology has evolved: current editions include Standard and Enterprise, and API modes include Native, Datastore, and MongoDB compatibility. Edition and mode are separate decisions; current documentation lists Native support in both editions. This lab teaches Native-mode Core operations and Firebase Security Rules, not MongoDB compatibility or every Enterprise Pipeline capability. Check supported combinations before creating a database because mode choices are consequential. [Editions and modes](https://docs.cloud.google.com/firestore/native/docs/editions-overview)

Documents contain typed fields and live in collections. A document can own subcollections, but deleting the parent does not imply all descendants are automatically deleted. Design document boundaries around bounded aggregates. A chat room can have a metadata document plus separate message documents rather than a single endlessly growing array. Use stable random-style IDs when appropriate; concentrated writes to one document or sequential key range can create contention.

## Queries, indexes, and transactions

Core queries typically use indexes. Composite indexes support combinations of filters and ordering, while single-field index exemptions can reduce unwanted storage and write work. An index is part of the application's deployment artifact, not an emergency console click that only exists in production. Query pricing and index-entry reads depend on the edition and query shape; inspect current pricing and Query Explain rather than equating a query with one billed read. [Index overview](https://firebase.google.com/docs/firestore/query-data/index-overview)

Transactions atomically read and write supported groups of documents and can retry. Avoid external side effects inside a transaction callback. Batched writes apply a known group of writes without first performing transactional reads. Real-time listeners improve responsiveness but create ongoing read activity; detach listeners when they are no longer needed. Offline client state is not proof that the server accepted a write.

Security Rules govern supported mobile/web client requests. Server/Admin libraries use IAM and bypass those client rules, so an Admin SDK test cannot demonstrate that browser access is safe. Rules are not filters: a query must be provably allowed for its potential result set. Validate both identity and allowed fields, and prevent clients from assigning themselves privileged roles. [Rules conditions](https://firebase.google.com/docs/firestore/security/rules-conditions)

## Prerequisites and cost

Use [lab setup](../../LAB-SETUP.md), Cloud Shell Bash, Node/npm, and a Java version supported by the current Firebase emulator release. The emulator runs locally with a `demo-` project ID and incurs no Firestore usage charge. It is not a complete production replica, especially for index requirements, performance, IAM, and edition-specific behavior. A real extension needs `firestore.googleapis.com`, a deliberately chosen new sandbox database/location, billing where required, and Firestore IAM permissions.

## Lab: prove an owner boundary

```bash
mkdir -p firestore-rules-lab
cd firestore-rules-lab
npm init -y
npm install --save-dev firebase-tools @firebase/rules-unit-testing firebase
cat > firebase.json <<'JSON'
{"firestore":{"rules":"firestore.rules"},"emulators":{"firestore":{"host":"127.0.0.1","port":8080},"ui":{"enabled":false}}}
JSON
cat > firestore.rules <<'RULES'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/notes/{noteId} {
      allow read, delete: if request.auth != null && request.auth.uid == uid;
      allow create, update: if request.auth != null
        && request.auth.uid == uid
        && request.resource.data.keys().hasOnly(['text'])
        && request.resource.data.text is string
        && request.resource.data.text.size() <= 500;
    }
  }
}
RULES
cat > rules-test.mjs <<'JS'
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc } from 'firebase/firestore';
const env = await initializeTestEnvironment({
  projectId: 'demo-gcp-roadmap',
  firestore: { rules: readFileSync('firestore.rules', 'utf8') }
});
try {
  const alice = env.authenticatedContext('alice').firestore();
  const bob = env.authenticatedContext('bob').firestore();
  const guest = env.unauthenticatedContext().firestore();
  const path = 'users/alice/notes/one';
  await assertSucceeds(setDoc(doc(alice, path), {text: 'private note'}));
  await assertSucceeds(getDoc(doc(alice, path)));
  await assertFails(getDoc(doc(bob, path)));
  await assertFails(getDoc(doc(guest, path)));
  await assertFails(setDoc(doc(alice, path), {text: 'x', role: 'admin'}));
  console.log('Owner, cross-user, anonymous, and field-validation tests passed');
} finally { await env.cleanup(); }
JS
npx firebase emulators:exec --only firestore --project demo-gcp-roadmap \
  'node rules-test.mjs'
```

1. Confirm all assertions pass. Make one rule deliberately permissive and observe the cross-user test fail; restore the secure rule before continuing.
2. Add an oversized string test and a non-string test. Both should be denied.
3. Design a `tasks` collection with `ownerId`, `status`, and `createdAt`. Specify the query for one user's open tasks ordered by creation time. Record its composite index requirements from the real service documentation; the emulator does not guarantee production index enforcement.
4. In a separate funded sandbox, create the intended Native database, deploy reviewed rules/indexes, and validate the same browser-client scenarios. Use a distinct test identity for each user. A successful privileged console read does not prove end-user access works.

## Operations and failure modes

Permission denied can be expected rule behavior, missing auth, unsupported fields, or a query whose constraints do not match the rule. A failed-precondition query may require an index that is still building. Hot documents require redesign, not unlimited retries. Backups/PITR, exports, TTL deletion, and retention have different purposes and billing; a TTL field does not promise immediate deletion. Monitor reads, writes, storage, rejected requests, listener churn, and business-level error rates.

## Cleanup and exercises

The emulator exits after the command; local files remain for learning. Remove the lab directory only after preserving useful rules and the package lockfile. If you created a real database, delete only synthetic documents, review descendants/indexes/backups, and follow the database deletion workflow for the disposable database.

A worked design for private notes keeps ownership in the document path and restricts fields, as above. For team notes, add server-controlled membership and test removed-member access; never let a user write their own membership claim. You pass when both allowed and denied actions are tested and you can explain which requests use Rules versus IAM. [Emulator setup](https://firebase.google.com/docs/emulator-suite/install_and_configure)
