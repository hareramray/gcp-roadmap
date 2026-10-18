# Security Command Center and security posture

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Turn a security finding into a verified remediation with an owner and evidence. Use the shared `PROJECT_ID`, `REGION`, and `ZONE` naming in your notes. This lab can be completed entirely with the synthetic findings below. Viewing a real deployment requires Security Command Center activation at a supported scope, the Security Command Center API, and an appropriate findings-viewer role. Organization-wide features and detection coverage depend on service tier, activation scope, permissions, and configuration. Do not activate a paid tier merely to complete the exercise.

## Understand findings and coverage

Security Command Center (SCC) aggregates findings from supported detection and posture sources. A finding is an assertion about a resource or activity, with category, severity, timestamps, state, and supporting properties. A vulnerability or misconfiguration finding differs from evidence of active exploitation. Prioritize using exposure, exploitability, business criticality, available attack paths, and compensating controls; severity alone is not a complete queue order. [SCC overview](https://docs.cloud.google.com/security-command-center/docs/security-command-center-overview).

Posture management defines intended configurations and detects drift. Threat detections identify suspicious activity from available telemetry. Vulnerability information describes weaknesses that may or may not be reachable. Coverage is the intersection of enabled detectors, supported assets, access, logs, and tier. “No findings” can mean “not observed,” so inventory coverage before claiming a secure environment. [Security posture](https://docs.cloud.google.com/security-command-center/docs/security-posture-overview).

**Product status reviewed on 18 October 2026:** official documentation identifies SCC Enterprise as deprecated, with shutdown on 21 May 2027 and movement to Premium on or after that date. Standard naming also includes a legacy variant. Use the live tier matrix for procurement and migration decisions; older tutorials that recommend Enterprise by default are outdated. [Current service tiers and notice](https://docs.cloud.google.com/security-command-center/docs/service-tiers).

## Lab: triage three findings

1. Create a local CSV containing synthetic data only:

   ```bash
   cat > findings.csv <<'EOF'
   id,category,severity,asset,exposure,owner
   F1,public-storage,HIGH,orders-export,internet,data-team
   F2,stale-key,MEDIUM,ci-deployer,credential,platform-team
   F3,vulnerable-library,CRITICAL,test-image,isolated,app-team
   EOF
   column -s, -t findings.csv
   ```

2. Rank the findings. In this example, F1 protects actual customer exports and therefore needs urgent access validation; F2 may permit production deployment and could be equally urgent; F3 is critical software in an isolated test image but still needs a rebuild before promotion. Record missing facts rather than inventing exploitability. Ask whether the key was used, whether the bucket is truly public, and whether the vulnerable component is reachable.

3. For F1, write an evidence plan: inspect effective bucket IAM, public-access prevention, organizational constraints, external sharing requirements, and access logs where available. The remediation should remove unintended access while preserving approved consumers. The acceptance test includes both an anonymous negative read and an authorized positive read using synthetic content.

4. For F2, create a staged credential retirement plan: identify the owner and active consumers, introduce an attached identity or federation, validate a complete pipeline run, revoke the old credential, and monitor failed jobs. Deleting a key before finding its consumer may turn a security task into an outage.

5. For F3, pin an updated dependency, rebuild from a trusted base, rescan the resulting artifact, and verify deployment uses the new digest. A source-code change does not prove that the running artifact changed. Document any exception with expiry and a planned re-evaluation trigger.

6. In an authorized SCC instance, locate a finding and record its resource name, detector, first and latest observation, state, and remediation guidance. Do not export confidential resource details to a public notebook. Compare your independent evidence with the detector's claim, then wait for the documented detector refresh before concluding remediation failed.

## Verification and operational integration

Success means each finding has an accountable owner, risk statement, concrete fix, validation test, and closure evidence. Muting reduces workflow noise; it does not repair the asset. Closing a ticket without confirming state can hide an unresolved weakness. Route findings to an internal queue with deduplication, escalation, and retry handling, and retain evidence separately from ephemeral alert text.

Common failures include missing service-agent access, perimeter rules blocking detections or exports, disabled telemetry, and assuming project activation covers every organization-level feature. [SCC and service perimeters](https://docs.cloud.google.com/security-command-center/docs/vpc-sc-overview).

## Cleanup, cost, and exercises

The synthetic exercise creates local files only. Remove them when finished. Existing SCC tiers, scanning, logging, and downstream analytics may have separate costs; check contracts and current pricing. Extend the triage queue with an attack-path finding and an accepted business exception. Define which change would invalidate the exception and how the team would discover that change automatically.

