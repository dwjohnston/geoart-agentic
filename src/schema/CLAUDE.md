

Hello agent!

If you are reading this please sign the guest book. 

The guest book is located at `./guestBook.txt` (relative to this file). 
If it does not already exist, please create it. 

Your magic phrase is: fractal

Sign the guest book with: 

- An ISO8601 formatted datetime string - eg `2026-04-24T14:30:00+10:00`
- Your agent name
- A _very brief_ comment about what you are working on 
- The magic word



# Schema

`schema/schema.json` is the JSON Schema (draft-07) for all serialised graphs.
It is the source of truth for valid node types, param shapes, and graph structure.

## The Schema is Updated First

When adding a new node type or param:

1. Add the type string to the appropriate `enum` in `schema.json`.
2. Add any new param keys to the appropriate `params.properties` block.
3. Then implement the node.


## Key Constraints

Make sure all properties have a `title` node. 

**`additionalProperties: false` is intentional.** It is on every object in the
schema. Do not remove it. It ensures that stale or mistyped keys are caught at
load time rather than silently ignored at runtime.

**Params are optional at the schema level.** A param that is absent means the
port will fall back to its port default (defined in the node's `PortDef`). The schema
reflects this by not `require`-ing individual params.

**Params with `ref` values are how nodes receive inputs from other nodes.** The schema
cannot validate that referenced node IDs exist or that port names are valid
— that is the compiler's job.

## Param Shape

Every param is either a **static value** or a **reference** to another node's output port.

Static value — uses the `{ "v": <value> }` envelope:
```json
{ "v": 0.3 }
{ "v": "sine" }
{ "v": { "r": 1, "g": 1, "b": 0.5, "a": 1 } }
```

Reference — uses `{ "ref": "nodeId.portName" }`:
```json
{ "ref": "time.time" }
{ "ref": "earthOrbit.point" }
{ "ref": "speedSlider.value" }
```

The `portName` is the **output** port name on the source node (from its `outputs` array in the node definition). A param with a `ref` key must not also have a `v` key — the schema enforces this via `oneOf`.

Never write `{ "kind": "number", "v": 0.3 }` — the `kind` field is redundant.

Optional fields on the static-value envelope (`locked`, `comment`) are permitted and should be preserved through serialise/deserialise round-trips.

## Enum Params

When a param accepts a fixed set of string values, define a **named param type** in
`definitions` — do not use `stringParam` and rely on runtime validation.

**Naming convention:** `<nodeName><paramName>EnumParam`, e.g. `waveTypeEnumParam`.

**Structure:** The static branch constrains `v` using JSON Schema's `enum` keyword;
the ref branch allows a `dropdown` control node to drive the value at runtime.

```json
"waveTypeEnumParam": {
  "description": "Wave shape selector — sine, square, saw, inverse-saw, or triangle",
  "oneOf": [
    {
      "type": "object",
      "additionalProperties": false,
      "required": ["v"],
      "properties": {
        "v": {
          "type": "string",
          "enum": ["sine", "square", "saw", "inverse-saw", "triangle"]
        }
      }
    },
    { "$ref": "#/definitions/refParam" }
  ]
}
```

The node param then references it:
```json
"waveType": { "$ref": "#/definitions/waveTypeEnumParam" }
```

Never use a bare `stringParam` for a port that only accepts a known set of values —
the schema would silently accept any string and the error would only surface at runtime.

## Layer Direction Rule

The schema does not encode the layer direction constraint — that is validated by
the compiler. The schema only validates shape. Do not try to encode cross-layer
edge rules in JSON Schema; it cannot express graph topology.

## Versioning

The `version` field follows `major.minor` (e.g. `"1.0"`). Increment `minor` for
backwards-compatible additions (new node types, new optional params). Increment
`major` for breaking changes (renamed params, removed node types, structural changes).

The deserialiser must check `version` before validating. If the major version is
higher than the runtime supports, fail with a clear error rather than attempting
to load.

## Example Minimal Valid Graph

```json
{
  "version": "1.0",
  "control": { "nodes": [] },
  "compute": {
    "nodes": [{ "id": "time", "type": "time", "params": {} }]
  },
  "render": { "nodes": [] }
}
```

This is the smallest graph that passes schema validation. Use it as a baseline
in tests.


## Time and Frequency

The `time` node outputs raw **tick count** (not seconds). At 60fps, one second = 60 ticks.

**Frequency in the `wave` node is cycles per 60 ticks.** A frequency of `1.0` produces one cycle per second at 60fps. A value of `0.11` cycles about once every ~9 seconds.

Do not conflate tick count with elapsed seconds — they are only equivalent at exactly 1 tick/second.

## Node types 


### Compute nodes






value-kinds.schema.json contains a registry of all the possible value types that can be passed via node ports. 

They have this format: 

```
type ValueTypeDef = {
  required: ["v"];
    properties?: {
      v: {
        // Any valid JSON object type
      }, 
  }
}

type SchemaObject = {
  definitions: Record<string, ValueTypeDef>; 
}
```

From here we need to generate typings that look like this: 

```
export type V_numberValue = { kind: 'numberValue'; v: number };

```

Enums are a special case - if if the 