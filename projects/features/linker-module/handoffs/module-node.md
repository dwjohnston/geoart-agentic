# module-node handoff: linker-module

**Kind:** `linker-module`

## Internal nodes

- 2 control nodes: `timedLineArrayModeSelector` and `timedLineArrayIntervalModeSelector`
- 0 compute nodes
- 1 render node: `timedLineArray` on the `paint` layer

## Connectable input ports

| Port | Type |
|---|---|
| `intervalTicks` | `numberValueOrRef` |
| `pointsFrom` | `colorPointArrayValueOrRef` → wired to `colorPointsA` |
| `pointsTo` | `colorPointArrayValueOrRef` → wired to `colorPointsB` |

## Internal controls

| Control | Node type | Default |
|---|---|---|
| `mode` | `timedLineArrayModeSelector` | `all-to-all` |
| `intervalMode` | `timedLineArrayIntervalModeSelector` | `all` |

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
