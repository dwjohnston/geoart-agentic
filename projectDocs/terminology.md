⚠️ This document defines terminology _as it should be_. However, this document was created _after_ a lot of code was already written, and so in the code some terms may not be compliant with the definitions as they are here. 

Going forward, you should create code and documentation that is compliant with this terminology specification. 

---

## Layers and the terms that apply to each

Understanding these four layers and how they relate is fundamental to the project. The core verbs — **define**, **declare**, **implement**, and **resolve** — and their derivatives (defined, definition, declared, implementation, etc.) are used consistently to describe work at each layer. Use these terms precisely throughout code, documentation, and conversation.

- **Definition** (Schema Layer)
    - Define: Creating a schema definition for something (a value primitive, node type, or node port)
    - What you write in `src/schema/schema/`
    - Example _defining_ an 'add' node: 
    ```json
    {
      "title": "Add Compute Node",
      "description": "Adds two numbers — outputs sum = a + b",
      "x-outputs": [{ "name": "sum", "valueType": "numberValue" }],
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

- **Declaration** (Algorithm Layer)
    - Declare: Creating an instance in an algorithm JSON/JS
    - What you write in an algorithm — node declarations, and the values you put in node inputs
    - Example _declaring_ an 'add' node: 
    ```ts
    {
      id: 'speedMod',
      type: 'add',
      params: {
        a: { v: 1 },                    // static value
        b: { ref: 'speedLFO.value' },   // referenced value
      }
    }
    ```

- **Implementation** (Code Layer)
    - Implement: Creating the runtime logic for something that is defined in the schema
    - TypeScript code that executes at runtime
    - Example _implementing_ an 'add' node: 
    ```ts
    export const addNodeImplementation = implementComputeNode("add", {
      isTimeDependant: false,
      defaults: { a: 0, b: 0 },
      evaluate: (inputs) => {
        return { sum: inputs.a + inputs.b };
      },
    })
    ```

- **Resolved** (Runtime Layer)
    - Values computed during evaluation
    - Both static values and referenced values resolve to actual values in this layer
    - Example: if the `add` node above has resolved inputs of a=1 and b=5, the resolved outputs for the node are is `{ sum: 6 }`

---

## Core Concepts

- **The Schema** 
    - The JSON Schema spec defined at `src/schema/schema/schema.json`, also `src/schema/schema/value-kinds.schema.json` and `src/schema/schema/refable-value-kinds.schema.json`
    - 'validate the schema' means to validate the JSON schema itself

- **algorithm**
    - A validated algorithm definition, compliant with The Schema
    - Examples live in `src/algorithms/`
    - 'validate the algorithm' means to validate that a given algorithm is spec compliant and compiles correctly

- **graph** 
    - A graph is what an algorithm becomes once it has been compiled, when it becomes a series of runtime nodes. 

---

## Nodes

- **node**
    - The term 'node' by itself is ambiguous but may be used colloquially to mean one of the following: 
    
    - **node definition** (Schema Layer)
        - What you write in The Schema — defines the node's type, inputs, outputs, description, etc. 
    
    - **node declaration** (Algorithm Layer)
        - The JSON/JS that instantiates a node in an algorithm
        - Specifies the node's id, type, and node inputs
    
    - **node implementation** (Code Layer)
        - The runtime logic for a node type — typically declared with `defineXNode`
        - Implements the behavior (math, UI, rendering, etc.)
    
    - **node instance** (Runtime Layer)
        - A compiled, running instance of a node during evaluation

    **Node kinds** (orthogonal to the above):
    - compute node
    - render node
    - control node

---

## Node Ports and Values


- **Value primitive**
    - An atomic data type that the engine passes around
    - The only things that can be passed via node ports
    - Defined in `src/schema/schema/value-kinds.schema.json`

- **node port**
    - Either a node input or a node output. The value types that flow through ports can only be value primitives (as defined in `value-kinds.schema.json`).

    - **node input**
        - Defined as a regular JSON schema property in The Schema. When declaring an algorithm, a node input can be declared as a static value or a referenced value; the evaluator's job is to resolve these into resolved values.
        
        *Defining* some node inputs in the schema: 
        ```json
           "params": {
              "type": "object",
              "additionalProperties": false,
              "properties": {
                "time": { "$ref": "refable-value-kinds.schema.json#/definitions/numberValueOrRef" },
                "frequency": { "$ref": "refable-value-kinds.schema.json#/definitions/numberValueOrRef" }
              }
           }
        ```
        
        *Declaring* node inputs in an algorithm:*
        ```ts
        params: {
          time:      { ref: 'time.time' },  // referenced value
          frequency: { v: 1 },              // static value
        }
        ```

    - **node output**
        - Defined in the `x-outputs` extension property in The Schema. The value of a node output can become the value of another node's input by using a referenced value. When declaring an algorithm, node outputs do not need to be declared — they are produced automatically by the node implementation.
        
        *Defining* node outputs in the schema:*
        ```json
        "x-outputs": [{ "name": "value", "valueType": "numberValue" }]
        ```

- **static value**
    - A node input filled with a literal value: `{v: 1}`

- **referenced value**
    - A node input filled with a reference to another node's output: `{ref: "node.output"}`

- **resolved value**
    - A value primitive as it exists at runtime. What a node input resolves to during evaluation, whether it was declared as a static value or a referenced value.

---

## Engine

- **compiler**
    - Takes a validated algorithm and produces a `CompiledGraph`. Verifies topology during compilation:
        - Detects circular references
        - Checks every reference points to a real node and port
        - Validates port type compatibility
        - Enforces layer direction (Control → Compute → Render, never backwards)
    - Lives in `src/graphEngine/compiler/`

- **evaluator**
    - Runs each tick (driven by `requestAnimationFrame`). Each evaluation:
        - Clears the live canvas layers
        - Captures the current state of controls
        - Evaluates the compiled graph in topological order
        - Draws to the canvas layers
    - Render nodes fire according to their own `intervalTicks` schedule rather than every frame
    - Lives in `src/graphEngine/evaluator/`

- **tick**
    - A single frame evaluation of an algorithm. Each tick clears the live canvas layers, captures the current state of controls, evaluates the graph, and draws to the canvas layers.

- **frequency**
    - A measure of cycles per unit time, expressed as cycles per 60 ticks. Because the application runs via `requestAnimationFrame` (which varies by device), frequency must be frame-rate-independent. A frequency value describes how many complete cycles occur in a normalized 60-tick interval.

- **intervalTicks**
    - An optional scheduling parameter for render nodes, measured in ticks. When present, render nodes fire according to their `intervalTicks` schedule rather than every frame.

---

## Terms to be avoided

- **type** 
    - `type` is a reserved keyword in TypeScript, and the term is ambiguous — do we mean type as in a TypeScript type? Or just generally as 'the kind of thing'? Use the term `kind` instead for the latter usage. 

- **param** 
    - This term is not problematic, but is already well covered by 'node input'


## Terms not yet documented


- array values

- enum values

- registry  

- reference algorithm
