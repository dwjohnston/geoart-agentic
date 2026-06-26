# define-node handoff: linker-module

**Kind:** module
**Type:** `linker-module`
**Description:** Renders animated lines between two sets of points. Wraps `timedLineArray`.

## Inputs (external / connectable ports)

| Port | Type |
|---|---|
| `intervalTicks` | `numberValueOrRef` |
| `pointsFrom` | `colorPointArrayValueOrRef` |
| `pointsTo` | `colorPointArrayValueOrRef` |
| `mode` | `timedLineArrayModeEnumValueOrRef` |
| `intervalMode` | `timedLineArrayIntervalModeEnumValueOrRef` |

## Outputs

None — render module (`x-outputs: []`).

## Behaviour

Expands at compile time into a `timedLineArray` render node. All five ports are connectable from outside; when not connected, `mode` and `intervalMode` are rendered as dropdowns inside the module panel via `renderControl`.
