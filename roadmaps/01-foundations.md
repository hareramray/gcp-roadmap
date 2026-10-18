# Foundations roadmap

[Home](../README.md) · [Full sequence](../ROADMAP.md) · [Lab setup](../LAB-SETUP.md)

Begin here. No cloud account is needed for the first five tutorials. Allow 30–50 hours if the tools and concepts are new.

## Topic sequence and tutorials

| Step | Tutorial | Detailed coverage | Completion evidence |
| --- | --- | --- | --- |
| 1 | [Cloud and distributed-system fundamentals](../tutorials/01-foundations/01-cloud-fundamentals.md) | Service models, responsibility, failure domains, consistency, latency, throughput, retries | Explain an order-system failure without confusing availability with durability. |
| 2 | [Linux and Bash](../tutorials/01-foundations/02-linux-and-shell.md) | Files, permissions, processes, variables, pipes, sockets, local logs | Run and diagnose a local HTTP process, then stop only your own process. |
| 3 | [Networking fundamentals](../tutorials/01-foundations/03-networking-fundamentals.md) | CIDR, routes, DNS, TCP/UDP, TLS, HTTP | Trace a request and identify the layer responsible for a failure. |
| 4 | [Git, Python, and APIs](../tutorials/01-foundations/04-git-python-and-apis.md) | Version control, input validation, tests, API contracts and retries | Produce a small tested program without committing credentials. |
| 5 | [SQL and data fundamentals](../tutorials/01-foundations/05-sql-and-data-fundamentals.md) | Grain, keys, joins, NULL, transactions, OLTP/OLAP | Reconcile a joined aggregate and explain duplicate totals. |
| 6 | [Account, project, billing, and quotas](../tutorials/01-foundations/06-account-project-billing-and-quotas.md) | APIs, service agents, billing linkage, budgets, limits, locations | Record a project inventory, cost assumptions, and quota scopes. |
| 7 | [gcloud, ADC, and tools](../tutorials/01-foundations/07-gcloud-authentication-and-tooling.md) | Configurations, credentials, tokens, filters, structured output | Explain which identity and project each command/application uses. |
| 8 | [Hierarchy and service selection](../tutorials/01-foundations/08-resource-hierarchy-and-service-selection.md) | Organizations, folders, projects, tags/labels, decision records | Design a hierarchy and justify three service choices. |

## How to complete this domain

Work in order unless you can already demonstrate the prerequisites. For each tutorial, save a short explanation, a sanitized exercise result or design artifact, one investigated failure, and a cleanup record. Read-only configuration inspection is not a substitute for a live traffic test when the objective requires one. Mark a design-only exercise explicitly when you cannot provision its environment.

Revisit any topic you can name but cannot explain. For broader subtopics, use the linked official references to inspect exact feature support, current commands, and production limits. Do not treat a product name as a complete architecture.

## Next steps

Next: [Identity and security](02-identity-security.md) and [Networking](03-networking.md).

