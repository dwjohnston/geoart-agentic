# define-node handoff: linker-module

**Kind:** module
**Type:** `linker-module`
**Description:** Renders animated lines between two sets of points. Wraps `timedLineArray`.

## Inputs (external / connectable ports)

| Port | Type |
|---|---|
| `pointsFrom` | `colorPointArrayValueOrRef` |
| `pointsTo` | `colorPointArrayValueOrRef` |

## Outputs

None — render module (`x-outputs: []`).

## Behaviour

Expands at compile time into a `timedLineArray` render node that draws animated lines from each point in `pointsFrom` to the corresponding point in `pointsTo`. The remaining `timedLineArray` inputs (`intervalTicks`, `mode`, `intervalMode`) are exposed as internal controls.
