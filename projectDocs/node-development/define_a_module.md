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

