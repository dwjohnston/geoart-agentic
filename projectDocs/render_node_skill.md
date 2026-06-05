## Tests

Write at least one test using `.toMatchInlineSnapshot`. Tests should cover the node's drawing output or state changes.

## Handoff

When implementation and tests are complete, write a handoff file to `project/features/[featureName]/handoffs/render-node.md`.

The handoff must contain:

**1. Prose description** — what the node draws and what its key inputs control.

**2. Partial algorithm skeleton** — a TypeScript node declaration ready to drop into an algorithm file:

```ts
{
  id: 'myCircle',
  type: 'circle',
  params: {
    intervalTicks: { v: 1 },
    center: { ref: 'someCompute.point' },
    radius: { v: 0.05 },
    color: { v: { r: 1, g: 0, b: 0, a: 1 } },
  },
},
```

Replace `[featureName]` with the name of the feature you are working on.
