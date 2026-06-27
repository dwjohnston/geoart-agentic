# Feature Brief: Points on a Line V2 Module

## Summary

Create a module node that wraps the existing `pointsOnALineV2` compute node. The module should expose circles rendered at each output point, a `curveMode` control (straight / catmull-rom), and a `numPoints` knob.

## Inputs

- `colorPoints` — array of colour points defining the line/curve
- `numPoints` — number of output points to distribute along the path
- `curveMode` — straight or catmull-rom interpolation

## Outputs

- `points` — the distributed colour point array

## Render

- One `circle` render node whose `centerPoints` are wired to the output `points`.

## Controls

- `curveMode` dropdown (straight / catmull-rom)
- `numPoints` knob

## Schema change needed

Add `points-on-a-line-v2-module` to `schema.json`.
