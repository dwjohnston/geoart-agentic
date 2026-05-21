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

