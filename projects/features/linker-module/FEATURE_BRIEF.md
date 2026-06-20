# Feature Brief: linker-module

## Summary

A module node that wraps the `timedLineArray` render node. "Linker" is the user-facing name — the node draws animated lines (links) between two sets of points.

## Module Node

- Node kind: `linker-module`
- Wraps: `timedLineArray` render node
- Exposed as **controls**: all `timedLineArray` inputs except `pointsFrom` and `pointsTo`
- Exposed as **connectable ports**: `pointsFrom` and `pointsTo`

## Reference Algorithm

Demonstrate the linker module using two orbit modules as point sources — one feeding `pointsFrom`, the other feeding `pointsTo`.

## Tasks

1. **module-node** — implement the `linker-module`
2. **algorithm** — reference algorithm: two orbit modules connected to a linker module

Task 2 depends on Task 1.

## Out of Scope

- No new node definitions
- No new value primitives
