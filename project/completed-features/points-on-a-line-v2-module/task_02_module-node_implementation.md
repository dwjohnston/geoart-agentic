# Task 02 — module-node: Implement points-on-a-line-v2-module

Create `src/nodes/module/nodes/points-on-a-line-v2-module.tsx` and a matching test file.

## Module kind

`points-on-a-line-v2-module`

## Default values

- `colorPoints`: `[]`
- `numPoints`: `10`
- `curveMode`: `'straight'`

## Internal nodes

### Compute node
- id: `createInternalId(moduleId, 'points-on-a-line-v2')`
- type: `'pointsOnALineV2'`
- params wired from input marker: `colorPoints`, `numPoints`, `curveMode`

### Render node (circles)
- id: `createInternalId(moduleId, 'circles')`
- type: `'circle'`
- renderConfig: `{ layer: 'live', displayByDefault: true, tags: ['points-on-a-line-v2', 'point'] }`
- params:
  - `centerPoints`: ref to compute node `points` output
  - `radius`: `{ v: 0.01 }`

## Controls (renderControl)

Wrap in `<ModulePanel moduleName="Points on a Line V2" ...>`:

- `curveMode` — `renderIfNeeded` → `DropdownControl` with options `['straight', 'catmull-rom']`
- `numPoints` — `renderIfNeeded` → `KnobControl` with `min=1`, `max=100`, `snapTo=1`

## Output

- `points` — ref to compute node `points` output

## After implementing

Run `bun generate` then `bun validate` to confirm all tests and types pass.

See handoff from task 01 at `project/features/points-on-a-line-v2-module/handoffs/define-node.md`.
