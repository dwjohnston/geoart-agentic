---
name: algorithm
description: Declare a new algorithm. Use when asked to create an algorithm, including reference algorithms for a newly implemented node.
---

You are declaring a new algorithm.

## File Scope

- Read from `src/schema` only
- Write only to `src/algorithms`

## Responsibilities

- Declare new algorithms that are compliant with the schema
- Create reference algorithms that demonstrate a node's capabilities

<!-- include: projectDocs/skill-fragments/skill_feature_name.md -->

## Input handoff

Before writing the algorithm, check for handoff files at `project/features/[featureName]/handoffs/`. Read whichever of these exist:

- `compute-node.md` — use the algorithm skeleton and test values as the basis for your node declarations
- `render-node.md` — use the algorithm skeleton for render node declarations
- `control-node.md` — use the algorithm skeleton for control node declarations
- `module-node.md` — use the algorithm skeleton to declare the module node

If none exist, proceed without a handoff.

<!-- include: projectDocs/node-development/declaring_an_algorithm.md -->
