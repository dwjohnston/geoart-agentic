# module-node handoff: reflect-module

The `reflect-module` wraps the `reflect` compute node and provides:

- **One compute node** (`reflect`) — receives `inputPoints` and `reflectionPoints` from the input marker, outputs `points`.
- **Two render nodes** on the live layer:
  - `circle` — draws a circle at each reflection point's position.
  - `linesThroughPoint` — draws a tangent line through each reflection point in its (dx, dy) direction; skips dx=dy=0 points natively.
- **No control nodes** — both inputs are array types connected via refs.
- **Output** — `points` from the reflect compute node, available downstream via `{ ref: 'myReflect.points' }`.

## Partial algorithm skeleton

```ts
.addModuleNode({
  id: 'myReflect',
  type: 'reflect-module',
  params: {
    inputPoints: { ref: 'someNode.points' },
    reflectionPoints: { ref: 'anotherNode.points' },
  },
})
```

## Registration

Registered in `src/nodes/module/registry.generated.ts` as `'reflect-module'`. Implementation at `src/nodes/module/nodes/reflect-module.tsx`. Tests at `src/nodes/module/nodes/reflect-module.test.tsx` (8 tests, all passing). `bun validate` passes (471 tests, schema valid, typecheck clean).
