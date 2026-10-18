# Roadmap 02 — Identity, security, and data protection

[Curriculum home](../README.md) · [Lab setup](../LAB-SETUP.md)

Study this track before giving applications production access. The outcome is a defensible security design: you can explain who can perform an action, how credentials are obtained, which guardrails apply, what evidence exists, and how sensitive data is protected. The tutorials use read-only inspections and concrete local design exercises; organization-only or commercial capabilities are not disguised as universally available free labs.

## Preparation and sequence

Understand projects, organizations, resource hierarchy, basic networking, HTTP/TLS, and Cloud Shell. Use a designated training project and synthetic information. Never place a downloaded service-account key, token, secret value, or real personal dataset in this repository. Suggested effort is 18–30 hours including exercises; deeper enterprise implementation requires additional product-specific practice.

| Order | Tutorial and complete topic scope | Evidence of learning |
|---|---|---|
| 1 | [IAM roles and policies](../tutorials/02-identity-security/01-iam-roles-and-policies.md): principals, groups, permissions, basic/predefined/custom roles, resource scope, inheritance, allow/deny, conditions, policy versions, principal access boundaries, privileged elevation | Explain three allowed/denied requests from an access matrix. |
| 2 | [Service accounts and federation](../tutorials/02-identity-security/02-service-accounts-and-federation.md): runtime identities, attachment versus impersonation, ADC, user-managed keys, workload/workforce federation, attribute trust, compatibility | Produce separate human and workload authentication flows with negative tests. |
| 3 | [Organization policy and landing zones](../tutorials/02-identity-security/03-organization-policy-and-landing-zones.md): hierarchy, guardrails, constraints, inheritance, exceptions, rollout, shared foundations | Deliver a staged guardrail rollout and application onboarding design. |
| 4 | [Secret Manager](../tutorials/02-identity-security/04-secret-manager.md): versions, readers, replication, caching, application delivery, rotation triggers, source-system revocation | Rehearse a credential rotation with overlap, validation, and rollback. |
| 5 | [KMS and certificate authorities](../tutorials/02-identity-security/05-cloud-kms-and-certificate-authority.md): envelope encryption, CMEK, HSM, EKM, rotation, key recovery, PKI, CA pools, mTLS, certificate lifecycle | Restore the key dependency for old data and reject an unauthorized certificate subject. |
| 6 | [Perimeters and zero trust](../tutorials/02-identity-security/06-vpc-service-controls-and-zero-trust.md): VPC Service Controls, Access Context Manager, ingress/egress, dry-run, IAP, device/context controls | Define positive and negative data-flow tests with IAM and perimeter decisions. |
| 7 | [Security Command Center](../tutorials/02-identity-security/07-security-command-center-and-posture.md): findings, posture, detection coverage, prioritization, remediation, service-tier lifecycle | Close three synthetic findings with evidence rather than muting them. |
| 8 | [Audit and security operations](../tutorials/02-identity-security/08-audit-logs-and-security-operations.md): audit categories, investigation, delegation, Google SecOps, Access Approval/Transparency | Build a reproducible incident timeline and detection specification. |
| 9 | [Data protection and compliance](../tutorials/02-identity-security/09-data-protection-and-compliance.md): classification, Sensitive Data Protection, masking, pseudonymization, minimization, residency, Assured Workloads, shared responsibility | Produce a minimized synthetic dataset and control-evidence register. |

## Integrated completion project

Design security for an orders API, a data-export pipeline, and an external CI system. Deliver the identity matrix, credential flows, hierarchy, secret/key lifecycle, perimeter flow table, finding queue, audit queries, and data-retention plan. Include an unauthorized-access test and a recovery test for every critical control. Explain the effect of disabling a key, removing a group, revoking a CI identity, and losing access to the external IdP.

You are ready to advance when you can diagnose an IAM denial without blindly adding Owner, distinguish authentication from authorization, and show which evidence supports every security claim. Recheck official product coverage, current service tiers, and policy constraints before real implementation; the linked tutorials identify current lifecycle cautions and their sources.

