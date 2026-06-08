---
name: module-node
description: Implement a module node. Use when asked to implement a module that has already been defined in the schema.
---

You are implementing a module node.

## File Scope

- Read from `src/schema` only
- Write only to `src/nodes/module`

## Responsibilities

- Implement the module's `provideNodes` function
- Wire internal nodes via the input marker pattern
- Write tests

## Modules

A **module** is a node that expands, at compile time, into a bundle of control/compute/render nodes plus two synthetic marker nodes. It has no `evaluate` function — instead of *computing*, it *generates other nodes*. See [terminology.md](../architecture/terminology.md) for the canonical definitions of the terms used here.

### Part 1: Define a module

Module types are defined in `schema.json` under `definitions.moduleNode` rather than the three layer `oneOf` arrays. The shape mirrors a compute node — refable `params` plus `x-outputs`:

```json
{
  "title": "Orbit Module",
  "x-outputs": [{ "name": "points", "valueType": "colorPointArrayValue" }],
  "properties": {
    "type": { "enum": ["orbit-module"] },
    "params": {
      "properties": {
        "time":   { "$ref": "refable-value-kinds.schema.json#/definitions/numberValueOrRef" },
        "radius": { "$ref": "refable-value-kinds.schema.json#/definitions/numberValueOrRef" }
      }
    }
  }
}
```

After editing the schema, run `bun generate` and update the type helpers — see the "Module Nodes" section of [src/schema/CLAUDE.md](../../src/schema/CLAUDE.md) for the exact `typeHelpers.ts` / generator steps.

### Part 2: Implement a module

Implement with `implementModule`. Unlike `implement*Node`, you do not supply an `evaluate` — you supply `provideNodes`, which returns the bundle of nodes the module expands into:

```ts
import { implementModule } from '../implementModule';
import { createInternalId } from '../moduleUtils';

const orbitModuleImplementation = implementModule({
  _kind: 'orbit-module',

  // A resolved fallback value for EVERY input port. Used when a param is omitted.
  defaultValues: {
    time: 0, speed: 0.3, radius: 0.5, numPoints: 1,
    centerPoints: [fColorPoint()], eccentricity: 0, tilt: 0, phase: 0,
  },

  provideNodes: (params, moduleId, defaultValues) => {
    const inputMarkerId = createInternalId(moduleId, 'input-marker'); // "myOrbit:input-marker"
    const orbitNodeId   = createInternalId(moduleId, 'orbit');        // "myOrbit:orbit"

    // Internal nodes read their inputs from the input marker, never from the
    // module's params directly. This is the single entry point for module inputs.
    const fromInputMarker = (key: string) => ({ ref: `${inputMarkerId}.${key}` });

    return {
      controlNodes: [],
      computeNodes: [{
        id: orbitNodeId,
        type: 'orbit',
        params: {
          time:   fromInputMarker('time'),
          radius: fromInputMarker('radius'),
          // ...remaining ports
        },
      }],
      renderNodes: [{
        id: createInternalId(moduleId, 'point-circle'),
        type: 'circle',
        renderConfig: { layer: 'live' },
        params: { centerPoints: { ref: `${orbitNodeId}.points` }, radius: { v: 0.025 } },
      }],

      // Synthetic input marker — the data source for all module inputs.
      // createInputMarkerParams fills each port with the supplied param, or { v: default }.
      inputMarkerNode: {
        id: inputMarkerId,
        type: 'module-input-marker',
        params: createInputMarkerParams(params, defaultValues),
        renderControl: (markerParams, set) => (
          // Render a UI control for whichever inputs were supplied. `set(port, value)`
          // pushes a new value out of the marker on the matching output port.
          <KnobControl label="Radius" min={0} max={1}
            initialValue={markerParams.radius} onChange={v => set('radius', v)} />
        ),
      },

      // Synthetic output marker — the module's public face. outputRefs maps each
      // x-output to the internal node port that produces it. `{ ref: 'myOrbit.points' }`
      // from outside resolves to this marker.
      outputMarkerNode: {
        id: moduleId,
        type: 'module-output-marker',
        params: {},
        outputRefs: { points: { ref: `${orbitNodeId}.points` } },
        nodeSource: { sourceType: 'module', sourceId: moduleId },
      },

      defaultValues,
    };
  },
});

export default orbitModuleImplementation;
```

Key rules:

- **Namespace every internal id** with `createInternalId(moduleId, localId)` → `{moduleId}:{localId}`. This prevents collisions when a module is instantiated more than once. User-facing node ids may not contain colons.
- **Internal nodes read inputs from the input marker**, not from the module's params directly — `{ ref: '{moduleId}:input-marker.<port>' }`. This gives every input a single source and lets the input marker host the module's UI.
- **The output marker's id is the module id** (`moduleId`), and its `outputRefs` wire each declared `x-output` to the internal port that produces it. Outside refs like `{ ref: 'myOrbit.points' }` resolve here.
- **Pass array outputs straight through** (`{ ref: '...points' }`); only wrap when assembling an array from scalars (`{ v: [{ ref: '...' }] }`).
- A module may itself declare other module nodes — the compiler expands iteratively until no module nodes remain (nested modules).

### Registering a module

Add the implementation to the module registry:

```ts
// src/nodes/module/registry.ts
export const moduleRegistry: ModuleRegistry = new Map([
  ['orbit-module', orbitModuleImplementation],
]);
```

The canonical, working example is [src/nodes/module/nodes/orbit.tsx](../src/nodes/module/nodes/orbit.tsx).


## Feature name

Determine the feature name from your task context:
- If invoked via the workflow, read it from the task file path (`project/features/[featureName]/task_...md`)
- If invoked directly, ask the user


## Input handoff

Before starting, check for a handoff from `/define-node` at `project/features/[featureName]/handoffs/define-node.md`.

If it exists, use it as your primary reference for port names, value types, and behaviour. Do not re-read the schema to re-derive what is already summarised there.

If it does not exist, read `src/schema/schema/schema.json` directly.


## Notes

Do not use deprecated properties of any nodes you provide inside the module.

## Tests

Write at least one test. A module test should verify that `provideNodes` returns the expected set of internal node IDs and types for a given set of inputs.

## Handoff

When implementation and tests are complete, write a handoff file to `project/features/[featureName]/handoffs/module-node.md`.

The handoff must contain:

**1. Prose description** — what the module provides (its internal nodes), what inputs it accepts, and what outputs it exposes.

**2. Partial algorithm skeleton** — a TypeScript module node declaration using representative values, ready to drop into an algorithm file:

```ts
.addModuleNode({
  id: 'myOrbit',
  type: 'orbit-module',
  params: {
    radius: { v: 0.3 },
    numPoints: { v: 8 },
    centerPoints: { v: [{ v: fColorPoint() }] },
  },
})
```

Replace `[featureName]` with the name of the feature you are working on.

