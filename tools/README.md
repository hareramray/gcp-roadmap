# Documentation maintenance tools

[Home](../README.md) · [Source policy](../SOURCES.md)

This folder contains a dependency-free Node.js checker for this Markdown library. It runs locally and does not contact Google Cloud, deploy resources, or incur cloud charges.

From the repository root:

```bash
node tools/check-docs.mjs
```

The checker reports file/tutorial counts, approximate word count, local-link count, unique external-reference count, code-fence count, and any errors/warnings. It verifies one top-level title per document, balanced fenced blocks, existence of local Markdown link targets, home/setup links in tutorials, and a link from each tutorial's owning roadmap. It flags unusually short tutorials and missing cleanup/reference signals for review. It does not check remote URLs, Markdown anchor fragments, or semantic accuracy of every sentence.

After adding or renaming tutorials and updating their domain roadmaps, regenerate the inventories:

```bash
node tools/check-docs.mjs --write-indexes
```

This rewrites `COVERAGE.md`, `CHECKLIST.md`, `tutorials/README.md`, and `roadmaps/README.md`. Existing checked boxes are preserved by their tutorial path; a renamed path needs manual progress reconciliation. Put personal free-form notes in a separate journal because generated indexes are replaced.

Cloud command examples need additional review against current official documentation and, when authorized and funded, actual service behavior. A syntax check proves neither IAM correctness nor deployment success. See [lab setup](../LAB-SETUP.md) before running any example.
