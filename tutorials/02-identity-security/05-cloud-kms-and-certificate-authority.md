# Cloud KMS, CMEK, HSM, EKM, and certificate authorities

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Design a key hierarchy and a private certificate lifecycle, then inspect existing key metadata without creating chargeable keys or certificate authorities. Cloud Shell uses `PROJECT_ID`, `REGION`, and `ZONE` from the setup guide. The optional read commands require Cloud KMS API access and a role such as Cloud KMS Viewer. Certificate Authority Service inspection requires its API and an appropriate viewer role in a provisioned environment. If neither is available, use the local design exercise; a commercial PKI deployment is not a prerequisite for learning the architecture.

## Separate encryption from certificates

Cloud KMS organizes cryptographic keys in key rings and key versions. Protection levels include software, Cloud HSM, and supported external-key options. Symmetric encryption, asymmetric signing, and asymmetric decryption have different algorithms and rotation behavior. An administrator managing key metadata should not automatically have permission to encrypt, decrypt, or sign. [Cloud KMS overview](https://docs.cloud.google.com/kms/docs/key-management-service).

CMEK means a compatible Google Cloud service uses a key you manage, often through a service agent. The service encrypts its data using an envelope-encryption design; you control the wrapping-key policy and lifecycle. The service agent needs the documented cryptographic role on the correct key. Key location must be compatible with the service and data location. CMEK is not the same as sending all application plaintext through a custom encryption call.

Rotation creates or selects newer key material for future operations; it does not necessarily re-encrypt all historical data. Keep versions needed to decrypt old data and backups. Disabling or destroying a version can make data unavailable, including recovery copies. Record which service performs automatic rewrapping and which requires a separate migration. [Key rotation](https://docs.cloud.google.com/kms/docs/key-rotation).

HSM changes the cryptographic protection boundary. Cloud EKM places additional key-management dependencies outside Google Cloud; network availability, external policy, latency, and contractual operations become part of the application's availability design. Do not describe EKM as an automatic guarantee that a workload remains available during a connectivity failure. [Cloud EKM](https://docs.cloud.google.com/kms/docs/ekm).

Certificate Authority Service manages private certificate authorities and issuance. A certificate binds an identity to a public key under a trust chain; it is not an encryption-key version. Plan root versus subordinate CAs, CA pools, certificate templates, validity periods, allowed subject names, revocation publication, renewal, and client trust distribution. Public website certificates may instead use Certificate Manager and publicly trusted issuance. [Certificate Authority Service](https://docs.cloud.google.com/certificate-authority-service/docs/ca-service-overview).

## Lab: design a recoverable key and PKI architecture

1. Inspect existing key-ring metadata if authorized:

   ```bash
   gcloud kms keyrings list --location="$REGION" --project="$PROJECT_ID"
   export KEY_RING='replace-with-existing-lab-ring'
   gcloud kms keys list --keyring="$KEY_RING" --location="$REGION" \
     --project="$PROJECT_ID" --format='table(name,purpose,rotationPeriod)'
   ```

   An empty result is valid. Do not create a ring to fill it: key-ring and key lifecycle semantics deserve planning before deployment.

2. Create a matrix for an orders database and its backup. Record the data project, key project, key location, key purpose, protection level, service agent, administrator group, and recovery dependency. Choose separate operational roles for key administration and cryptographic use.

3. Work through a rotation example. Data written Monday uses version A; Tuesday's new writes use version B. Demonstrate on paper why restoring Monday's backup may still require A. Add an explicit retirement gate: inventory references, restore test, retention expiry, approval, disable observation period, then scheduled destruction only when justified.

4. Design a private mTLS identity for `orders.internal.example`. Specify a root trust anchor, issuing subordinate, narrowly approved DNS names, renewal before expiry, and how clients receive the CA bundle. Include an unauthorized request for `payments.internal.example` as a negative test. The issuer must reject it under your issuance policy.

5. Simulate two failures: the key's decrypt permission is removed, and the certificate expires during an otherwise healthy deployment. For each, identify the user symptom, log evidence, responsible team, and reversible mitigation. Compare their blast radius; they are different control planes.

## Verification, cleanup, cost, and extensions

A complete design restores old data after rotation and rejects an unauthorized certificate subject. A key inventory alone does not demonstrate either. Common failures include mismatched locations, granting the human user access instead of the service agent, removing old versions too early, and renewing a certificate without updating the serving process.

No cloud resource was created. Remove local exports after review. Real KMS versions, HSM/EKM operations, and CA pools can incur recurring charges; merely retaining enabled infrastructure can cost money. Never test key destruction against production. Extend the design with external key-manager failure, emergency issuance, certificate revocation checking, and a documented responsibility boundary between your team, Google, and the external provider.

