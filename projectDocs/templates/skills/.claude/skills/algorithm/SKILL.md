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

## Handoff

Before writing the algorithm, check whether a handoff file exists at `project/features/[featureName]/handoffs/compute-node.md`.

If it exists, use the partial algorithm skeleton and input values from that file as the basis for your node declarations. This ensures the algorithm uses the same values that were verified in the node's tests.

<!-- include: projectDocs/declaring_an_algorithm.md -->

<!-- include: projectDocs/sensible_defaults.md -->
