# Task 01: document-module-params

Skill: `define-node`

## Goal

Every module node type in `src/schema/schema/schema.json` (`moduleNode` definition, 9 variants under `src/nodes/module/nodes/*`) already has a node-level `title` and `description`. What is missing is per-param `description` fields — currently only 1 of 44 module params is documented, versus 22/63 for compute nodes and 9/22 for render nodes.

Add a concise `description` to each module param that isn't self-evident from its name alone (numeric knobs like `frequency`/`amplitude` can be skipped if a sibling compute/render node already documents the equivalent without one; enum/mode params and domain-specific params such as `eccentricity`, `tilt`, `phase`, `falloff`, `strength`, `colorShiftOperation`, `cycleLengthMode`, `intervalMode`, `curveMode`, `modulationAngle`, `fixedOffset` should be documented). Reuse wording from equivalent compute/render node param descriptions where the module wraps that node directly (e.g. `curve-modulator-module`'s `cycleLengthMode`/`modulationAngle`/`fixedOffset` mirror the `curveModulator` compute node).

## Scope

- `src/schema/schema/schema.json` — `moduleNode` `oneOf` entries only.
- No changes to node-level `title`/`description` (already present).
- No changes to shared enum definitions in `value-kinds.schema.json` (out of scope for this issue).

## Acceptance

- `bun validate:schema`, `bun test`, `bun typecheck` pass.
- Every module param that isn't purely a plain numeric/array knob has a `description`.
