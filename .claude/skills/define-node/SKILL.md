---
name: define-node
description: Define a new node type or value primitive in the schema. Use when asked to add a new node definition or value kind to src/schema.
---

You are defining a new node type or value primitive in the schema.

## File Scope

- Operate only within `src/schema`

## Responsibilities

- Add new node definitions to `src/schema/schema/schema.json`
- Add new value primitives to `src/schema/schema/value-kinds.schema.json` if needed
- Run `bun generate` after schema changes to regenerate derived types
- Ensure forward compatibility of existing algorithms


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


## Schema Guidelines

`schema/schema.json` is the JSON Schema (draft-19) for all serialised algorithms. It is the source of truth for valid node types, node input shapes, and algorithm structure.

### The Schema is Updated First

When adding a new node type or node input:

1. Add the type string to the appropriate `enum` in `schema.json`.
2. Add any new node input keys to the appropriate `params.properties` block.
3. Add the node's output types in the `x-outputs` property.

### Value Kinds

Value primitives are the atomic values that represent how data is passed between nodes in the algorithm.

All value primitives have a single base property `v`:

```json
"stringValue": {
  "title": "String Value",
  "type": "object",
  "required": ["v"],
  "properties": {
    "v": { "type": "string" }
  }
}
```

#### Array Values

```json
"stringArrayValue": {
  "title": "String Array Value",
  "type": "object",
  "required": ["v"],
  "properties": {
    "v": {
      "type": "array",
      "items": { "$ref": "#/definitions/stringValue" }
    }
  }
}
```

#### Enum Values

```json
"waveTypeValue": {
  "title": "Wave Type Value",
  "type": "object",
  "required": ["v"],
  "properties": {
    "v": {
      "type": "string",
      "enum": ["sine", "square", "saw", "reverse-saw", "triangle"]
    }
  }
}
```

#### Value References

Value references allow a node input to be wired to the output of another node. They are defined in `refable-value-kinds.schema.json`, which extends each value primitive to also accept `{ ref: "nodeId.portName" }`.

### Module Nodes

Module nodes are reusable groups of nodes that get expanded during compilation. They are defined similarly to control, compute, and render nodes, but live under `definitions.moduleNode`.

Module nodes have:
- Inputs (params) that can be static values or references
- Outputs declared via `x-outputs`

When adding a new module node type:
1. Add the type string to the `enum` in `definitions.moduleNode` in `schema.json`
2. Add input parameters to the `params.properties` block
3. Add output types in the `x-outputs` property
4. Update `generate-derived-types.ts` and test it with `extract.test.ts`

### Scripts & Testing

#### When updating `generate-derived-types.ts`

Update `src/schema/scripts/extract.test.ts`:
- Add the new node kind to `minimalNodeSchema` if testing a new node section
- Update test snapshots for `generateOutputs()` and `buildNodeInputs()`
- Include both positive and negative test cases

#### When making schema structural changes

Update `src/schema/typeHelpers.ts`:
- Add new node kind exports (e.g., `ModuleNodeKinds`)

Update `src/schema/typeHelpers.test.ts`:
- Add type tests for the new node kind
- Test both positive cases (valid types) and negative cases (`@ts-expect-error`)
- For array value assertions, use concrete values, never empty arrays `[]`
- Include tests across all relevant describe blocks:
  - Node kind recognition
  - Node outputs
  - Node inputs
  - Constrained inputs with accumulated nodes
  - Port references


## Feature name

Determine the feature name from your task context:
- If launched via the workflow, read it from the task file path (`project/features/[featureName]/task_...md`)
- If launched directly, ask the user


`value-kinds.schema.json` contains a registry of the value primitives that exist. Call these 'value primitive'

These are the shapes of the values that can communicated to and from nodes via their input and output ports. 

`refable-value-kinds.schema.json` contains a registry of 'refs' of the value primitives. Call these 'value ref' These values are a direct 1:1 mapping from the value kinds in `value-kinds.schema.json` and this file is auto generated. Conceptually you might think of the refable types like a generic, like `RefableValueTypeL<NumberValue>`, but generics do not exist in JSON Schema. 

The value kinds in `value-kinds.schema.json` are all keyed with `v`. 
The value kinds in `refable-value-kinds.schema.json` are all keyed with `ref`. 

This allows the compiler to easy distinguish between the two. 

When a value takes the `v` form, it should be considered static - it will never change
When a value takes the `ref` form, it is determined as the output of another node. 

## Array values

There are also array values, and their refable counter parts

The value array primitive:
```
    "colorPointArrayValue": {
      "title": "Color Point Array Value",
      "type": "object",
      "description": "An array of coloured points",
      "required": [
        "v"
      ],
      "properties": {
        "v": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/colorPointValue"
          }
        }
      }
```

The value array ref: 

```
    "colorPointArrayValueOrRef": {
      "title": "Color Point Array Param",
      "description": "An array of coloured points parameter — static value or reference to another node's output",
      "oneOf": [
        {
          "$ref": "value-kinds.schema.json#/definitions/colorPointArrayValue"
        },
        {
          "$ref": "schema.json#/definitions/refParam"
        }
      ]
    }
```

Importantly, note that the items in an array can be a mix of value primitives and value refs

A declaration of colorPoint value array, where the array itself is a ref: 

```
          colorPointsA: { ref: 'topLine.points' },
          colorPointsB: { ref: 'bottomLine.points' },
```

A declaration of a color point value arrays as a static array of static values: 

```
          colorPointsA: {
            v: [
              { v: { r: 0.2, g: 0.6, b: 1, a: 0.7, x: 1, y: 1 } },
              { v: { r: 0.2, g: 0.6, b: 1, a: 0.7, x: 0, y: 0 } }
            ]
          }
```

A declaration of a color point value arrays as a static array of mixed static and reffed values:

```
          colorPointsA: {
            v: [
              { v: { r: 0.2, g: 0.6, b: 1, a: 0.7, x: 1, y: 1 } },
              { ref: "someNode.point" }
            ]
          }
```

### Common Mistake: Array Values

**Wrong** — using an object with `items` property:
```
          colorPointsA: {
            v: {
              items: [{ v: { ... } }]  // ❌ Don't do this
            }
          }
```

**Correct** — `v` holds the array directly:
```
          colorPointsA: {
            v: [{ v: { ... } }]  // ✅ Correct
          }
```

The `v` property must contain the array `[...]`, not an object with an `items` property.

## Enum values

Enum values primitives are always a string as their underlying value. 

An example enum primitive declaration 

```
    "waveTypeValue": {
      "title": "Wave Type Value",
      "type": "object",
      "required": [
        "v"
      ],
      "properties": {
        "v": {
          "type": "string",
          "enum": [
            "sine",
            "square",
            "saw",
            "reverse-saw",
            "triangle"
          ]
        }
      }
    }
```

**When you define a new enum value type, you must also define a corresponding enum selector control node** using the `/control-node` skill. Each enum type needs its own dropdown control node — for example, `waveTypeValue` has `WaveSelectorControl`. The control node wraps `DropdownControl` with the enum's options hardcoded and outputs the enum value type. This is a mandatory follow-on task whenever a new enum value primitive is introduced.




## Handoff

When the schema definition is complete and `bun generate` has run successfully, write a handoff file to `project/features/[featureName]/handoffs/define-node.md`.

The handoff must contain:

**1. Node summary** — kind, type name, and a one-line description of what it does.

**2. Input ports** — each port's name and value type.

**3. Output ports** — each port's name and value type.

**4. Behaviour spec** — a concise description of what the node computes, copied or summarised from the feature brief. This is the primary reference for the implementation skill.

Example:

```md
# define-node handoff: multiply

**Kind:** compute
**Type:** `multiply`
**Description:** Multiplies two numbers.

## Inputs
| Port | Type |
|---|---|
| `a` | `numberValueOrRef` |
| `b` | `numberValueOrRef` |

## Outputs
| Port | Type |
|---|---|
| `product` | `numberValue` |

## Behaviour
Returns `product = a × b`.
```

