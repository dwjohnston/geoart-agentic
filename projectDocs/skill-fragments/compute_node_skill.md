## Tests

Write at least one test. Choose input values that produce round-number outputs — these values will be reused in the reference algorithm.

Example: for an `add` node, use `a: 3, b: 4 → sum: 7` rather than arbitrary decimals.

## Handoff

When implementation and tests are complete, write a handoff file to `project/features/[featureName]/handoffs/compute-node.md`.

The handoff must contain two things:

**1. Prose description** — what the node does, and what the test values demonstrate. For example:

> The `multiply` node multiplies two numbers. With `a: 3` and `b: 4` it produces `product: 12`.

**2. Partial algorithm skeleton** — a TypeScript node declaration using the round-number values, ready to drop into an algorithm file:

```ts
{
  id: 'myMultiply',
  type: 'multiply',
  params: {
    a: { v: 3 },
    b: { v: 4 },
  },
},
```

Replace `[featureName]` with the name of the feature you are working on.
