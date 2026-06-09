---
title: "Node Implementation Guidelines"
description: "file structure, export format, and testing patterns"
---

## Node Implementation Guidelines

### File Structure, Export Format

- Each node should have a single file in the appropriate `src/nodes/<nodeType>/nodes` folder.
  - The node implementation should be a default export.
  - The filename should be `nodeName.ts` e.g. `add.ts`, NOT `addNode.ts` or `add.node.ts`
  - Do not create helper files alongside it.
    - You can create helper functions within the file if sensible.
    - If it makes sense to test helper functions, they can be named exports.

### Tests

- Create a test for your node implementation. Adopt an 'at least write one test' strategy.
  - You do not need to write comprehensive tests. The user will prompt you for greater test coverage if needed.
  - If fixing a bug within the implementation of a node, DO write a test that would detect the buggy behaviour.

In your tests you may be running into issues with typing the inputs of a node.

Make use of TypeScript's `satisfies` operator to safely get types to be in the shape that the function parameters expect.

```ts
const inputs = {
  intervalTicks: 1,
  mode: 'all-to-all',
  intervalMode: 'inside-out-and-forth',
  colorPointsA: [
    { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 },
  ],
  colorPointsB: [
    { x: -0.75, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 0, dy: 0 },
  ],
} satisfies NodeInputsResolved<"timedLineArray">;
```
