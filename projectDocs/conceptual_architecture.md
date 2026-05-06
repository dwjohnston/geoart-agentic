# Conceptual Architecture

This project is a generative art engine. Graphs of connected nodes are evaluated each frame to produce animations drawn to a canvas.

## The Schema

The starting point is _The Schema_ — a JSON Schema (draft-09) definition living in `src/schema/schema/`. It defines:

- What node types exist and their input parameters
- What value types exist

The schema is split across three files:

| File | Purpose |
|---|---|
| `schema.json` | All node type definitions |
| `value-kinds.schema.json` | Raw value types (e.g. `numberValue`, `colorPointValue`) |
| `refable-value-kinds.schema.json` | Derived from `value-kinds.schema.json` — extends each value type to also accept a `ref` |

The split exists to make it straightforward to generate TypeScript types from each concern independently.

Value types are always keyed with `v`, eg

```
    "numberValue": {
      "title": "Number Value",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "v"
      ],
      "properties": {
        "v": {
          "type": "number"
        }
      }
    },
```

This means that when we go to add some inputs in an algorithm we can easily distingush static values from refs.

eg. 

```
					time:      { ref: 'time.time' }, // a ref
					frequency: { v: 1}               // a static value
 ```

## Node Types

There are three kinds of node, corresponding to three layers of the architecture:

```
Control → Compute → Render
```

Data flows in one direction only. A render node may never feed back into a compute node; a compute node may never feed back into a control node.

### Control Nodes

User-facing inputs: sliders, colour pickers, and similar UI controls. They are pure value sources — no logic, no side effects.

### Compute Nodes

Pure mathematical transformation nodes. They take inputs and emit outputs. No canvas access, no UI knowledge. Examples: `add`, `wave`, `orbit`, `scale`.

### Render Nodes

Responsible for drawing to the canvas. They have no node-level output — they are the end of the data flow. Examples: `timedLine`, `circle`, `trail`. Each render node runs on its own schedule (`intervalTicks`) rather than every frame.

## Inputs and Outputs

Node inputs are defined in the schema under `params`. Outputs are declared via the custom `x-outputs` extension property.

Example — the `add` compute node:

```json
{
  "title": "Add Compute Node",
  "x-outputs": [
    { "name": "sum", "valueType": "numberValue" }
  ],
  "properties": {
    "params": {
      "properties": {
        "a": { "$ref": "refable-value-kinds.schema.json#/definitions/numberValueOrRef" },
        "b": { "$ref": "refable-value-kinds.schema.json#/definitions/numberValueOrRef" }
      }
    }
  }
}
```

Every input port can accept either a static value or a reference to another node's output — this is handled transparently by the graph evaluator.

## Refs — Connecting Nodes

A `ref` is how the output of one node becomes the input of another. Instead of a static value, a param holds `{ "ref": "nodeId.portName" }`.

Example — a render node whose colour inputs come from two compute nodes:

```ts
{
  id: 'line',
  type: 'timedLine',
  params: {
    colorPointA: { ref: 'earthColorPoint.colorPoint' },
    colorPointB: { ref: 'venusColorPoint.colorPoint' },
  },
}
```

A node can mix static values and refs freely:

```ts
{
  id: 'venusTrail',
  type: 'circle',
  params: {
    intervalTicks: { v: 1 },          // static value
    center: { ref: 'venusOrbit.point' }, // ref to compute output
    radius: { v: 0.015 },             // static value
    color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
  },
}
```

There is no separate edges array — connections are expressed inline as param refs.
