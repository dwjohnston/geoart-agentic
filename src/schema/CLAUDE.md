# Schema

`schema/schema.json` is the JSON Schema (draft-19) for all serialised graphs.
It is the source of truth for valid node types, param shapes, and graph structure.

## The Schema is Updated First

When adding a new node type or param:

1. Add the type string to the appropriate `enum` in `schema.json`.
2. Add any new param keys to the appropriate `params.properties` block.
3. Add the nodes output types in the `x-outputs` property. 

(example) 


## Value Kinds

Value primitives are the atomic value that represents how data is passed between nodes in the graph. 

All values primitves have a single base property `v`

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

There 

