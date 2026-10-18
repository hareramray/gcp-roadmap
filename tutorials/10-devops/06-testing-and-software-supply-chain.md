# Testing and software supply-chain controls

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Evidence must follow the artifact

A passing unit test, a clean vulnerability scan, and a signed image answer different questions. Unit tests check selected behavior. Integration tests check interactions with real dependencies. A vulnerability scanner compares detected components against known issues. Provenance records how an artifact was produced. An attestation makes a signed claim about an artifact. Binary Authorization can enforce configured deployment requirements. None of these alone proves that an application is correct or harmless. [Binary Authorization overview](https://docs.cloud.google.com/binary-authorization/docs/overview)

Use Cloud Shell Bash for the local exercise. The first part creates no cloud resources. Optional scanning and enforcement exercises require the preceding container, Cloud Build, and delivery tutorials and can incur service charges. Allow one hour locally, then additional time to establish an authorized security-policy test environment.

## Hands-on: test behavior and failure paths

Create a tiny pure function with an explicit contract, then tests that cover input boundaries and invalid values. The example models request normalization; it deliberately does not depend on a cloud SDK.

```bash
mkdir -p "$HOME/gcp-roadmap-labs/supply-chain"
cd "$HOME/gcp-roadmap-labs/supply-chain"
cat > normalizer.py <<'EOF'
def normalize_name(value):
    if not isinstance(value, str):
        raise TypeError("name must be text")
    cleaned = value.strip()
    if not 1 <= len(cleaned) <= 80:
        raise ValueError("name length must be 1..80")
    return cleaned
EOF
cat > test_normalizer.py <<'EOF'
import unittest
from normalizer import normalize_name

class NormalizeTests(unittest.TestCase):
    def test_removes_outer_whitespace(self):
        self.assertEqual(normalize_name("  cloud learner  "), "cloud learner")

    def test_accepts_maximum_length(self):
        self.assertEqual(normalize_name("x" * 80), "x" * 80)

    def test_rejects_empty_or_too_long(self):
        for value in ["", "  ", "x" * 81]:
            with self.subTest(value_length=len(value)):
                with self.assertRaises(ValueError):
                    normalize_name(value)

    def test_rejects_non_text(self):
        with self.assertRaises(TypeError):
            normalize_name(None)

if __name__ == "__main__":
    unittest.main()
EOF
python3 -m unittest -v
```

Expect four passing test methods. Change the maximum length to 79 and rerun: the boundary test should fail. This mutation exercise verifies that the test detects a meaningful behavior change. Restore the implementation afterward. A test suite that only checks that a function exists would miss this regression.

Add a Cloud Build step using a reviewed Python builder image and `python -m unittest -v`, before the image build. Publish only when the required tests pass. For integration tests, use synthetic data in an isolated test database or emulator where suitable. Emulators improve speed but do not reproduce every IAM, networking, consistency, and quota behavior; retain a small authorized real-service integration suite.

## Design a release evidence chain

Record source commit → reviewed dependencies → builder identity → test results → image digest → provenance/attestations → deployment release. Build once and promote the same digest across environments. Rebuilding separately for production can produce different bytes, invalidating the connection to staging evidence.

Create an evidence file for your lab with fields for commit, build ID, digest, test result, scan timestamp, policy decision, and approver where relevant. Do not fabricate values; mark unavailable evidence as pending. Generate a software bill of materials using a supported tool appropriate to your language and image, and store it with the artifact lifecycle. An SBOM is an inventory, not a vulnerability verdict.

Cloud Build can produce provenance for supported builds; inspect the actual output metadata and documented provenance requirements. Do not assume every arbitrary script or manually pushed image receives equivalent verified provenance. Restrict who can alter build definitions and who can sign attestations. A signer that accepts any developer-supplied “passed” string is not an effective control. [Build provenance](https://docs.cloud.google.com/build/docs/securing-builds/view-build-provenance)

## Optional scanning and enforcement lab

Enable supported Artifact Analysis scanning in a disposable repository, push a known lab image, and inspect its vulnerability results. Record package, installed version, fixed version when available, severity, and runtime exposure. Absence of findings may mean scanning is incomplete or unsupported, not that the image contains no risk. Establish remediation deadlines and exception ownership; rebuild and rescan after patching. [Artifact scanning](https://docs.cloud.google.com/artifact-analysis/docs/container-scanning-overview)

In an administrator-prepared Binary Authorization test environment, begin with audit/dry-run behavior where supported. Define a policy requiring an attestation from a dedicated test attestor. Try two image digests: one with the required attestation and one without. Expect the policy to distinguish them, then test enforcement only on disposable workloads. Record denial logs and the documented break-glass procedure. A break-glass deployment should be exceptional, visible, and reviewed afterward, not a permanent bypass.

Canary testing supplies production-context evidence after admission. Compare error rate, latency, saturation, and business outcomes between revisions over a meaningful traffic sample. Define automatic stop conditions and a rollback target before shifting traffic. Do not evaluate a canary solely by whether Pods or instances started successfully.

## Troubleshooting, cleanup, and exercises

If a signed image is rejected, compare the exact digest, attestor identity, policy scope, signature, and trusted key version. A tag can move between signing and deployment; digest-based references eliminate that ambiguity. If a scan result is missing, inspect service enablement, supported artifact format, scan state, and permissions.

Restore any lab-only admission policy before deleting attestors or keys, then remove only lab images and associated artifacts after checking retention needs. Keep local tests as learning material. Never delete a shared signing key as routine cleanup. Exercise: write a policy for a high-severity finding with no available fix, including compensating controls, expiry date, owner, and evidence needed to renew the exception.

## Official references

- [Safeguard builds and the software supply chain](https://docs.cloud.google.com/software-supply-chain-security/docs/safeguard-builds)
- [Cloud Build attestations](https://docs.cloud.google.com/binary-authorization/docs/cloud-build)
- [SLSA specification](https://slsa.dev/spec/)
- [Python unittest](https://docs.python.org/3/library/unittest.html)

