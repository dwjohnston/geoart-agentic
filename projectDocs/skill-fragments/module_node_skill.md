---
title: "Module Node Skill"
description: "tests and handoff format for module node implementations"
---

## Notes

Do not use deprecated properties of any nodes you provide inside the module.

## Tests

Write at least one test. A module test should verify that `provideNodes` returns the expected set of internal node IDs and types for a given set of inputs.

## Handoff

When implementation and tests are complete, write a handoff file to `project/features/[featureName]/handoffs/module-node.md`.

The handoff must contain:

**1. Prose description** — what the module provides (its internal nodes), what inputs it accepts, and what outputs it exposes.

**2. Partial algorithm skeleton** — a TypeScript module node declaration using representative values, ready to drop into an algorithm file:

```ts
.addModuleNode({
  id: 'myOrbit',
  type: 'orbit-module',
  params: {
    radius: { v: 0.3 },
    numPoints: { v: 8 },
    centerPoints: { v: [{ v: fColorPoint() }] },
  },
})
```

Replace `[featureName]` with the name of the feature you are working on.
