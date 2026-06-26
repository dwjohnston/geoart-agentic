# module-node handoff: color-shift-module

## Description

Expands into one compute node (`colorShift`) and one render node (`circle`). The compute node applies inverse-distance weighted colour shifting from `targetPoints` onto `inputPoints`, outputting the shifted array as `points`. The render node draws a circle centred on each target point with a radius equal to `falloff`, giving a visual indication of each target's influence zone.

UI knobs are exposed for `falloff` and `strength`.

## Internal nodes

| ID suffix | Kind | Type |
|---|---|---|
| `input-marker` | synthetic | `module-input-marker` |
| `color-shift` | compute | `colorShift` |
| `target-circles` | render | `circle` (live layer) |
| _(module id)_ | synthetic | `module-output-marker` |

## Algorithm skeleton

```ts
.addModuleNode({
  id: 'myColorShift',
  type: 'color-shift-module',
  params: {
    inputPoints: { ref: 'someOrbit.points' },
    targetPoints: { ref: 'anotherOrbit.points' },
    falloff: { v: 1 },
    strength: { v: 0.8 },
  },
})
```
