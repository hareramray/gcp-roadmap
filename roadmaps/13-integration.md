# Application integration roadmap

[Home](../README.md) · [Full sequence](../ROADMAP.md) · [Lab setup](../LAB-SETUP.md)

Prerequisites: fundamentals, IAM, HTTP, basic runtime deployment, and messaging concepts. Allow 20–35 hours. Workflows/queue examples can create billable resources; business-application and API programs default to explicit design exercises.

## Topic sequence and tutorials

| Step | Tutorial | Detailed coverage | Completion evidence |
| --- | --- | --- | --- |
| 1 | [Workflows](../tutorials/13-integration/01-workflows-and-orchestration.md) | State, branches, service calls, authentication, retries, compensation | Run a successful and a deliberately rejected execution. |
| 2 | [Eventarc and events](../tutorials/13-integration/02-eventarc-and-event-driven-design.md) | CloudEvents, routing filters, trigger identities, duplicates, repair | Prove local duplicate handling and design a supported trigger. |
| 3 | [Tasks and Scheduler](../tutorials/13-integration/03-cloud-tasks-and-cloud-scheduler.md) | Queue limits, retries, job identity, OIDC/OAuth, timezone, overlap | Inspect a bounded queue and specify an idempotent scheduled job. |
| 4 | [API management and discovery](../tutorials/13-integration/04-api-gateway-apigee-and-service-directory.md) | OpenAPI, Gateway, Apigee, Endpoints, JWT, backend access, registry | Write a contract and authorization/negative-test matrix. |
| 5 | [Firebase and business integrations](../tutorials/13-integration/05-firebase-and-business-integrations.md) | App identity, security rules, App Check, hosting, connectors, reconciliation | Design and test profile authorization and duplicate/stale update handling. |

## How to complete this domain

Work in order unless you can already demonstrate the prerequisites. For each tutorial, save a short explanation, a sanitized exercise result or design artifact, one investigated failure, and a cleanup record. Read-only configuration inspection is not a substitute for a live traffic test when the objective requires one. Mark a design-only exercise explicitly when you cannot provision its environment.

Revisit any topic you can name but cannot explain. For broader subtopics, use the linked official references to inspect exact feature support, current commands, and production limits. Do not treat a product name as a complete architecture.

## Next steps

Integrate these topics with [DevOps](10-devops.md), [Analytics](08-data-analytics.md), and the [serverless capstone](../tutorials/14-capstones/01-serverless-application.md).

