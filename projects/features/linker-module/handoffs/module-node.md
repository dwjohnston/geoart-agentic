# module-node handoff: linker-module

**Kind:** `linker-module`

## Internal nodes

- 0 control nodes
- 0 compute nodes
- 1 render node: `timedLineArray` on the `paint` layer

## Input ports

| Port | Type | Default |
|---|---|---|
| `intervalTicks` | `numberValueOrRef` | `6` |
| `pointsFrom` | `colorPointArrayValueOrRef` → wired to `colorPointsA` | `[]` |
| `pointsTo` | `colorPointArrayValueOrRef` → wired to `colorPointsB` | `[]` |
| `mode` | `timedLineArrayModeEnumValueOrRef` | `all-to-all` |
| `intervalMode` | `timedLineArrayIntervalModeEnumValueOrRef` | `all` |

All ports flow through the input marker. `mode` and `intervalMode` render as dropdowns via `renderControl` when not externally connected.

## Outputs

None.

## Algorithm skeleton

```ts
{
  id: 'linker',
  type: 'linker-module',
  params: {
    intervalTicks: { v: 6 },
    pointsFrom: { ref: 'orbitA.points' },
    pointsTo: { ref: 'orbitB.points' },
  },
}
```
