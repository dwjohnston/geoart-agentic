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

note: Right now there is a tension where for something like a Dropdown component - we would want to be able to declare a Dropdown Control Node and say this has the Foo Enum Value - which should determine both its optoins, as well as its `x-output`. 

However, we don't currently have a way of doing that. The current strategy is to just declare new versions of the dropdown for each enum type we have. 

