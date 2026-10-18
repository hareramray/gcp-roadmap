# Capstone projects roadmap

[Home](../README.md) · [Full sequence](../ROADMAP.md) · [Lab setup](../LAB-SETUP.md)

Complete the linked prerequisite tutorials for your chosen project. Allocate 12–30 hours per initial project and more for production hardening. Follow the shared lab setup, cost estimates, identity boundaries, and cleanup instructions. These are implementation guides; this repository does not claim they were deployed in your account.

## Topic sequence and tutorials

| Step | Tutorial | Detailed coverage | Completion evidence |
| --- | --- | --- | --- |
| 1 | [Secure serverless application](../tutorials/14-capstones/01-serverless-application.md) | Cloud Run, Firestore, Tasks, identity, secrets, delivery, monitoring | Prove idempotency, unauthorized denial, rollback, restore, and cleanup. |
| 2 | [Reproducible GKE platform](../tutorials/14-capstones/02-gke-platform.md) | Terraform, images, workloads, identity, network policy, CI/CD, SLOs | Recreate the platform and recover from a controlled bad rollout. |
| 3 | [Governed data platform](../tutorials/14-capstones/03-data-platform.md) | Storage, Pub/Sub, Beam, BigQuery, Dataform, catalog, BI | Reconcile duplicate/late-data handling and access-controlled metrics. |
| 4 | [Evaluated AI application](../tutorials/14-capstones/04-ai-application-and-architecture-review.md) | Retrieval, generation, controlled tools, identity, evaluation, operations | Show grounded answers, abstention, access isolation, and measured cost. |

## How to complete this domain

Work in order unless you can already demonstrate the prerequisites. For each tutorial, save a short explanation, a sanitized exercise result or design artifact, one investigated failure, and a cleanup record. Read-only configuration inspection is not a substitute for a live traffic test when the objective requires one. Mark a design-only exercise explicitly when you cannot provision its environment.

Revisit any topic you can name but cannot explain. For broader subtopics, use the linked official references to inspect exact feature support, current commands, and production limits. Do not treat a product name as a complete architecture.

## Next steps

Use [review questions](../INTERVIEW-AND-REVIEW.md) to defend your choices. Label local, design-only, and live evidence accurately.

