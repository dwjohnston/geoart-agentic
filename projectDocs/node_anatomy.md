# Node Anatomy

A node has two representations that must stay in sync: its **schema definition** (what shape it has and what it outputs) and its **runtime implementation** (what it computes).

---

## Part 1: Schema Definition

Every node is defined in `src/schema/schema/schema.json` as a member of the `computeNode`, `renderNode`, or `controlNode` `oneOf` array.

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
