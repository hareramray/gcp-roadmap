# Firebase, application identity, and business integrations

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Design a client-facing application and a controlled integration with an external business system. Understand HTTP, IAM, data modeling, and event processing. The default exercise uses synthetic records and a local editor. Optional Firebase emulators require supported CLI/runtime tooling. Managed Firebase services, Identity Platform features, connectors, integration executions, and third-party systems can incur charges.

## Understand product boundaries

A Firebase project is associated with an underlying Google Cloud project. Firebase supports application development capabilities such as Authentication, hosting options, Firestore, Cloud Storage integration, messaging, remote configuration, app quality tools, and product-specific analytics/integration workflows. Each service has its own access, pricing, and lifecycle model. Firebase Hosting and App Hosting address different deployment workflows; choose based on your framework and server requirements.

Firebase Authentication and Identity Platform address application end-user identity. Cloud IAM governs access by cloud principals to Google Cloud resources. They are connected in some architectures but not interchangeable. A customer logged into your app should not receive project Editor just to read their profile. Browser/mobile access rules and server-side IAM paths must each be reviewed.

Security Rules authorize supported client accesses to products such as Firestore and Cloud Storage for Firebase. Server SDKs commonly use privileged IAM credentials and do not rely on the same client-rule path. App Check can help establish that requests come from attested application contexts for supported services; it is not a replacement for user authentication or authorization. Client configuration values such as a project identifier are not a substitute for access controls.

Application Integration coordinates business integration flows using supported triggers, tasks, mappings, and execution state. Integration Connectors provide connections to supported external or internal systems. Availability, authentication, private connectivity, licensing, connection capacity, and operations differ per connector. A connector can read or modify business records according to its credentials, so least privilege and change control are essential.

## Guided lab: customer profile and CRM synchronization

1. Define a synthetic profile schema: `customer_id`, `display_name`, `marketing_opt_in`, `updated_at`, and `source_version`. Keep personal identifiers out of example data.
2. Draw browser/mobile client → application authentication → authorized profile access. Define who can read or change each field; never let a user assign their own administrator role.
3. Write a policy test table: anonymous denied, owner allowed on permitted fields, another user denied, administrative server allowed only for its documented task. Include malformed data and attempted privilege escalation.
4. If using the Firebase Local Emulator Suite, initialize only the required emulators in a disposable directory with a demo project configuration. Follow the current emulator setup documentation, seed synthetic data, and execute both allow and deny rule tests. Keep live project configuration separate and verify the CLI project before any deployment.
5. Define an outbound CRM event containing only the necessary fields and a stable event ID. Compare polling with a supported event/webhook trigger. Model duplicates, late events, deletion propagation, and API rate limits.
6. In Application Integration, inspect the relevant connector's setup and authentication requirements before provisioning. Design an integration: receive event → validate schema → map fields → upsert CRM record → persist result. Use a test tenant and a credential scoped to the specific object/operation.
7. Add a reconciliation job that detects records missed during downtime. Store a cursor/watermark and distinguish event time from synchronization time. Write a repair procedure for a failed record without replaying every customer update.

## Worked failure example

Version 12 of a profile arrives after version 13 because a retry was delayed. If the CRM blindly overwrites on arrival, stale data wins. Compare source versions or use an authoritative update timestamp with a defined conflict policy. For deletion, a later replay must not recreate a record that policy required to be removed. These are business consistency decisions, not features a connector automatically resolves.

## Verification and troubleshooting

For emulator work, record the exact allowed and denied assertions rather than merely observing the UI. For a managed integration, inspect execution status, input mapping, connector response, target record, and idempotency store. An authenticated connection can still fail due to object-level permissions, schema changes, pagination, rate limits, or private-network reachability. Logs should use record IDs and sanitized errors rather than full customer payloads.

## Cleanup and exercises

Stop emulators and remove only disposable local data. Delete test integrations, connector connections/capacity, test credentials, synthetic target records, and optional hosting resources when done. Disable recurring triggers before removing destinations. Completion evidence is an authorization matrix, synchronization state machine, field mapping, duplicate/stale-event tests, and a deletion/reconciliation plan. Extend it to a two-way sync and explain how you prevent loops and conflicting ownership.

## References

- [Firebase projects](https://firebase.google.com/docs/projects/learn-more)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Identity Platform](https://docs.cloud.google.com/identity-platform/docs)
- [Application Integration](https://docs.cloud.google.com/application-integration/docs/overview)
- [Integration Connectors](https://docs.cloud.google.com/integration-connectors/docs/overview)
