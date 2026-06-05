# Schema

`schema/schema.json` is the JSON Schema (draft-19) for all serialised algorithms.
It is the source of truth for valid node types, node input shapes, and algorithm structure.

## The Schema is Updated First

When adding a new node type or node input:

1. Add the type string to the appropriate `enum` in `schema.json`.
2. Add any new node input keys to the appropriate `params.properties` block.
3. Add the nodes output types in the `x-outputs` property.


## Value Kinds

Value primitives are the atomic value that represents how data is passed between nodes in the algorithm. 

All values primitives have a single base property `v`

eg.

```
    "stringValue": {
      "title": "String Value",
      "type": "object",
      "required": [
        "v"
      ],
      "properties": {
        "v": {
          "type": "string"
        }
      }
    },
```

### Array Values

    "stringArrayValue": {
      "title": "String Array Value",
      "type": "object",
      "required": [
        "v"
      ],
      "properties": {
        "v": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/stringValue"
          }
        }
      }
    },


### Enum values

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
    },

### Value References

Value references allow a node input to be wired to the output of another node. They are defined in `refable-value-kinds.schema.json`, which extends each value primitive to also accept `{ ref: "nodeId.portName" }`.

## Module Nodes

Module nodes are reusable groups of nodes that get expanded during compilation. They are defined in the schema similarly to control, compute, and render nodes, but live under `definitions.moduleNode`. 

Module nodes have:
- Inputs (params) that can be static values or references
- Outputs declared via `x-outputs`

When adding a new module node type:
1. Add the type string to the `enum` in `definitions.moduleNode` in `schema.json`
2. Add input parameters to the `params.properties` block
3. Add output types in the `x-outputs` property
4. Update `generate-derived-types.ts` and test it with `extract.test.ts`

## Scripts & Testing

### When updating `generate-derived-types.ts`

Update `src/schema/scripts/extract.test.ts`:
- Add the new node kind to `minimalNodeSchema` if testing a new node section
- Update test snapshots for `generateOutputs()` and `buildNodeInputs()`
- Include both positive and negative test cases

### When making schema structural changes

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

