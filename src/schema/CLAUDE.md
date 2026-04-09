# Schema

`schema/schema.json` is the JSON Schema (draft-07) for all serialised graphs.
It is the source of truth for valid node types, param shapes, and graph structure.

## The Schema is Updated First

When adding a new node type or param:

1. Add the type string to the appropriate `enum` in `schema.json`.
2. Add any new param keys to the appropriate `params.properties` block.
3. Then implement the node.

A graph that fails schema validation must never reach the compiler. Validate on
load, not on use.

## Key Constraints

**`additionalProperties: false` is intentional.** It is on every object in the
schema. Do not remove it. It ensures that stale or mistyped keys are caught at
load time rather than silently ignored at runtime.

**Params are optional at the schema level.** A param that is absent means its
port has an incoming edge — the serialiser strips connected params. The schema
reflects this by not `require`-ing individual params.

**Edges reference nodes by string ID and port by integer index.** The schema
cannot validate that referenced node IDs exist or that port indices are in range
— that is the compiler's job.

## Param Shape

All params use the `{ "v": <value> }` envelope:

```json
{ "v": 0.3 }
{ "v": "sine" }
{ "v": { "r": 1, "g": 1, "b": 0.5, "a": 1 } }
```

Never write `{ "kind": "number", "v": 0.3 }` — the `kind` field is redundant,
the registry already knows the type. The schema enforces this by not including
`kind` in the param definitions.

Optional fields on the param envelope (`locked`, `comment`) are permitted by the
schema and should be preserved through serialise/deserialise round-trips even if
the application does not currently use them.

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
    "nodes": [{ "id": "time", "type": "time", "params": {} }],
    "edges": []
  },
  "render": { "nodes": [], "edges": [] }
}
```

This is the smallest graph that passes schema validation. Use it as a baseline
in tests.
