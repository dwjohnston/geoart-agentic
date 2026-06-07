## Tests

Write at least one test.

## Handoff

When implementation and tests are complete, write a handoff file to `project/features/[featureName]/handoffs/control-node.md`.

The handoff must contain:

**1. Prose description** — what the control exposes and what output value it emits.

**2. Partial algorithm skeleton** — a TypeScript node declaration ready to drop into an algorithm file:

```ts
{
  id: 'mySlider',
  type: 'slider',
  params: {
    label: { v: 'Speed' },
    min: { v: 0 },
    max: { v: 1 },
    default: { v: 0.5 },
  },
},
```

Replace `[featureName]` with the name of the feature you are working on.
