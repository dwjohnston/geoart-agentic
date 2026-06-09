---
name: compute-node
description: Implement a compute node. Use when asked to implement a compute node that has already been defined in the schema.
---

You are implementing a compute node.

## File Scope

- Read from `src/schema` only
- Write only to `src/nodes/compute`

## Responsibilities

- Implement the compute node runtime logic
- Write tests using round-number input/output values that clearly demonstrate what the node does


# Node Anatomy

A node has two representations that must stay in sync: its **schema definition** (what shape it has and what it outputs) and its **runtime implementation** (what it computes).

There are **four kinds of node**: `control`, `compute`, `render`, and `module`. The first three are covered below. A **module** is a special node that expands into a bundle of the other three — its definition and implementation differ enough to warrant [its own section](#modules).

---

## Part 1: Schema Definition

Every node is defined in `src/schema/schema/schema.json` as a member of the `computeNode`, `renderNode`, or `controlNode` `oneOf` array (modules live under `definitions.moduleNode`).

### Required fields

```json
{
  "title": "Wave Compute Node",
  "type": "object",
  "description": "...",
  "additionalProperties": false,
  "required": ["id", "type", "params"],
  "properties": {
    "id":   { "title": "ID",   "type": "string" },
    "type": { "title": "Type", "type": "string", "enum": ["wave"] },
    "params": { ... }
  }
}
```

Every object needs a `title`. `additionalProperties: false` is mandatory on every object — do not remove it.

### Input ports — `params`

Each key in `params.properties` is an input port. Compute and render nodes reference types from `refable-value-kinds.schema.json`, which wraps the type so it can be either a static value `{ v: ... }` or a ref `{ ref: "nodeId.portName" }`:

```json
"params": {
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "time":      { "$ref": "refable-value-kinds.schema.json#/definitions/numberValueOrRef" },
    "frequency": { "$ref": "refable-value-kinds.schema.json#/definitions/numberValueOrRef" },
    "waveType":  { "$ref": "refable-value-kinds.schema.json#/definitions/waveTypeValueOrRef" }
  }
}
```

**Control nodes are the exception.** Their params are always static — they sit at the top of the data flow so nothing can ref into them. They reference the plain types from `value-kinds.schema.json` instead:

```json
"params": {
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "min":   { "$ref": "value-kinds.schema.json#/definitions/numberValue" },
    "max":   { "$ref": "value-kinds.schema.json#/definitions/numberValue" },
    "value": { "$ref": "value-kinds.schema.json#/definitions/numberValue" },
    "label": { "$ref": "value-kinds.schema.json#/definitions/stringValue" }
  }
}
```

All params are optional at the schema level — a missing param falls back to the port's default defined in the runtime implementation.

For ports that accept only a fixed set of strings, define a named enum param type in `definitions` rather than using the bare `numberValueOrRef`. See the schema CLAUDE.md for the naming convention and structure.

### Input port naming conventions

- Ports that represent a **count of things** must be prefixed with `num`: `numSides`, `numHarmonics`, `numPoints`.
- Use camelCase throughout.

### Output ports — `x-outputs`

Outputs are declared with the custom `x-outputs` extension field — a JSON Schema array of `{ name, valueType }` objects:

```json
"x-outputs": [
  { "name": "value", "valueType": "numberValue" }
]
```

The `valueType` string must match a key in `value-kinds.schema.json` (with the `Value` suffix). This is what the code generator reads to produce typed port definitions.

Render nodes draw to canvas and produce no output values — their `x-outputs` is an empty array:

```json
"x-outputs": []
```

---

## Part 2: Runtime Implementation

The `implement*Node` factory functions read the generated port metadata and produce a `NodeDef` with fully typed inputs and outputs. You never declare port names or types in the implementation — those come from the schema via code generation.

### Compute nodes — `implementComputeNode`

```ts
import { implementComputeNode } from '../implementComputeNode';

export const waveNodeDef = implementComputeNode('wave', {
  isTimeDependant: true,      // set true only if the node reads ctx.tickCount
  defaults: {
    time:      { v: 0 },
    frequency: { v: 1 },
    amplitude: { v: 1 },
    phase:     { v: 0 },
    waveType:  { v: 'sine' },
  },
  evaluate: (inputs) => {
    return {
      value: evaluateWave(
        inputs.waveType.v,
        inputs.frequency.v,
        inputs.amplitude.v,
        inputs.phase.v,
        inputs.time.v,
      ),
    };
  },
});
```

- `defaults` — fallback `{ v }` value for each input port when no param is supplied in the graph
- `evaluate` — pure function; receives named inputs, returns a record keyed by output port name
- The return value shape must exactly match the `x-outputs` names declared in the schema
- Never access the DOM or canvas here

### Render nodes — `implementRenderNode`

```ts
import { implementRenderNode } from '../implementRenderNode';

export const circleNodeDef = implementRenderNode('circle', {
  defaults: {
    intervalTicks: { v: 0 },
    center:        { v: { x: 0, y: 0 } },
    radius:        { v: 0.02 },
    color:         { v: { r: 1, g: 1, b: 1, a: 1 } },
  },
  evaluate: (inputs, ctx) => {
    const pixelRadius = Math.abs(inputs.radius.v) * (ctx.width / 2);
    const { r, g, b, a } = inputs.color.v;

    ctx.canvas.strokeStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
    ctx.canvas.beginPath();
    ctx.canvas.arc(inputs.center.v.x, inputs.center.v.y, pixelRadius, 0, Math.PI * 2);
    ctx.canvas.stroke();
  },
});
```

- `ctx.canvas` — the `CanvasRenderingContext2D` pre-selected for this node's layer (live or paint)
- `ctx.width` / `ctx.height` — canvas dimensions in pixels; the coordinate space is `-1..+1` so multiply by these to get pixel values
- `evaluate` returns `void`; all output is via side-effects on `ctx.canvas`

### Control nodes — `implementControlNode`

```ts
import { implementControlNode } from '../types';
import { SliderControl } from '../ui/SliderControl';

export const sliderNodeDef = implementControlNode('slider', {
  defaults: {
    label: { v: '' },
    min:   { v: 0 },
    max:   { v: 1 },
    step:  { v: 0.01 },
    value: { v: 0 },
  },
  renderControl(node, set) {
    return (
      <SliderControl
        label={node.params.label.v}
        min={node.params.min.v}
        max={node.params.max.v}
        step={node.params.step.v}
        initialValue={node.params.value.v}
        onChange={v => set('value', { v })}
      />
    );
  },
});
```

- `node.params` — the node's params merged with defaults; read configuration values from here
- `set(portName, { v })` — call this when the user changes the control; it updates the output port and marks the node dirty so downstream nodes re-evaluate on the next tick
- There is no `evaluate` function — the factory auto-generates one that passes `params` straight through to the output ports
- UI components live in `src/nodes/control/ui/` and are imported by the node definition

### Registering a node

Each layer has a registry map. Add the new def:

```ts
// src/nodes/compute/registry.ts
export const computeRegistry = new Map<string, NodeDef>([
  ['wave',  waveNodeDef],
  ['orbit', orbitNodeDef],
  // ...
]);
```

The compiler and evaluator look up node definitions by type string from these maps at runtime.

---

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
- If launched via the workflow, read it from the task file path (`project/features/[featureName]/task_...md`)
- If launched directly, ask the user


## Input handoff

Before starting, check for a handoff from the define-node step at `project/features/[featureName]/handoffs/define-node.md`.

If it exists, use it as your primary reference for port names, value types, and behaviour. Do not re-read the schema to re-derive what is already summarised there.

If it does not exist, read `src/schema/schema/schema.json` directly.


## Tests

Write at least one test. Choose input values that produce round-number outputs — these values will be reused in the reference algorithm.

Example: for an `add` node, use `a: 3, b: 4 → sum: 7` rather than arbitrary decimals.

## Handoff

When implementation and tests are complete, write a handoff file to `project/features/[featureName]/handoffs/compute-node.md`.

The handoff must contain two things:

**1. Prose description** — what the node does, and what the test values demonstrate. For example:

> The `multiply` node multiplies two numbers. With `a: 3` and `b: 4` it produces `product: 12`.

**2. Partial algorithm skeleton** — a TypeScript node declaration using the round-number values, ready to drop into an algorithm file:

```ts
{
  id: 'myMultiply',
  type: 'multiply',
  params: {
    a: { v: 3 },
    b: { v: 4 },
  },
},
```

Replace `[featureName]` with the name of the feature you are working on.

