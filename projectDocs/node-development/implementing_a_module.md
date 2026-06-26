---
title: "Module Implementation Guidelines"
description: "file structure, export format, and testing patterns"
---
## Modules

A **module** is a node that expands, at compile time, into a bundle of control/compute/render nodes plus two synthetic marker nodes. It has no `evaluate` function — instead of *computing*, it *generates other nodes*. See [terminology.md](../architecture/terminology.md) for the canonical definitions of the terms used here.


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


