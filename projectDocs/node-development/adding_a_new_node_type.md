--- 
canon: CANONICAL STATUS 👑 - 2026-06-05
title: "Adding a New Node Type"
description: "step-by-step guide for control, compute, render, and module nodes"
---

## Adding a New Node Type

A node is one of **four kinds**: `control`, `compute`, `render`, or `module`. Pick the kind first, then follow the matching steps.

### A control, compute, or render node

1. Define the node in `schema.json`
    - If you need a new value type, define it in `value-kinds.schema.json` first
    - **New enum type → extra task:** every new enum value type also needs a dropdown selector control node so users can set it from the UI. The define-node step adds the enum type and the control node's schema entry together, but the control node runtime implementation is a separate step — plan a `control-node` task for it

2. Implement the node in the appropriate `src/nodes/[compute|control|render]/nodes/` folder using the `implement*Node` function — see [Node Anatomy](node_anatomy.md)
    - Set port defaults that produce visible output with no params wired — see [Declaring an Algorithm — Sensible Defaults](declaring_an_algorithm.md#sensible-defaults)
3. Register it in that layer's `registry.ts`

### A module node

A module is a node that bundles other nodes — use one when a cluster of control/compute/render nodes recurs. The shape is the same (schema definition + implementation + registry), but it expands at compile time instead of running an `evaluate`:

1. Define the module under `definitions.moduleNode` in `schema.json` (refable `params` + `x-outputs`), then run `bun generate` and update the type helpers — see [src/schema/CLAUDE.md](../../src/schema/CLAUDE.md)
2. Implement it with `implementModule` in `src/nodes/module/nodes/` — see [Node Anatomy → Modules](node_anatomy.md#modules)
3. Register it in `src/nodes/module/registry.ts`

For any kind, add a minimal reference algorithm so it gets snapshot-tested — see [src/algorithms/reference/CLAUDE.md](../../src/algorithms/reference/CLAUDE.md).

