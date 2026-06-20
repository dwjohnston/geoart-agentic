# module-node handoff: rotate-module

The `rotate-module` expands into one compute node (`rotate`) and one render node (a `circle` outline at each rotation center). It accepts `inputPoints`, `rotationCenters`, and `rotationAmount` and exposes a single `points` output.

## Algorithm skeleton

```ts
.addModuleNode({
  id: 'myRotate',
  type: 'rotate-module',
  params: {
    inputPoints: { ref: 'someSource.points' },
    rotationCenters: { v: [{ v: { x: 0.25, y: 0.25, dx: 0, dy: 0, r: 1, g: 1, b: 1, a: 1 } }] },
    rotationAmount: { ref: 'someWave.value' },
  },
})
```
