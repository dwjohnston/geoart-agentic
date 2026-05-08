# Geometric Art Engine

## Instructions for all agents: 

- Some promps might request or encourage feedback. This can be left in `project/feedback`. This is an exception to any file scope restrictions. 

- Some .md files may contain lines with a 🖊️ emoji. You can ignore these unless you are the `md-file-agent`. 

## General Instructions 

- Be very concise in creating .md files, commit messages etc. 
- If you ask a question and it doesn't get an answer - re ask the question.

## Spelling 

Always use British English, with the exception of the following words: 

- color 
- center


## Project Documentation

See `projectDocs/_index.md` for architecture, node anatomy, algorithm authoring, and code style guides.


## Project Overview

This project is a generative art engine. Graphs of connected nodes are evaluated each frame to produce animations drawn to a canvas.


### The Schema

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

### Node Types

There are three kinds of node, corresponding to three layers of the architecture:

```
Control → Compute → Render
```

Data flows in one direction only. A render node may never feed back into a compute node; a compute node may never feed back into a control node.

#### Control Nodes

User-facing inputs: sliders, colour pickers, and similar UI controls. They are pure value sources — no logic, no side effects.

#### Compute Nodes

Pure mathematical transformation nodes. They take inputs and emit outputs. No canvas access, no UI knowledge. Examples: `add`, `wave`, `orbit`.

#### Render Nodes

Responsible for drawing to the canvas. They have no node-level output — they are the end of the data flow. Examples: `timedLine`, `circle`. Each render node runs on its own schedule (`intervalTicks`) rather than every frame.

### Inputs and Outputs

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

### Refs — Connecting Nodes

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


## File structure 
### `/projectDocs/`
Project documentation and architectural guides.

- **`_index.md`** — Main documentation index and entry point

### `/src/`
Source code for the application.

- **`algorithms/`** — Schema-compliant algorithm declarations
  
- **`application/`** — Main React application entry point
  
- **`common-tooling/`** — General-purpose, non-domain-specific utilities and helpers
  
- **`graphEngine/`** — Graph processing and evaluation system
  - `graphEngine/` — Core graph implementation
  - `compiler/` — Validates and compiles graph definitions into executable form
  - `evaluator/` — Evaluates and executes compiled graphs
  - `externalInterfaces/` — Glue interfaces between `compiler` `evaluator` and `nodes/*`
  
- **`nodes/`** — Node type implementations
  - `compute/`
    - `nodes/` — Computational/processing nodes
  - `render/`
    - `nodes/` — Rendering and visualization nodes
  - `control/`
    - `nodes/` — Control flow and logic nodes
  
- **`schema/`** — Schema definitions and validation
  - `schema/` — Schema definition files
    - `schema.json` — Main schema definition
    - `value-kinds.schema.json` — Value type schema
    - `refable-value-kinds.schema.json` — Referenceable value types schema
  - `typings.ts` - Helper typings
  
- **`ui-tooling/`** — UI component utilities and helpers


## Terminology 

⚠️ This document defines terminology _as it should be_. However, this document was created _after_ a lot of code was already written, and so in the code some terms may not be compliant with the definitions as they are here. 

Going forward, you should create code and documentation that is compliant with this terminology specification. 

---

### Layers and the terms that apply to each

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

### Core Concepts

- **The Schema** 
    - The JSON Schema spec defined at `src/schema/schema/schema.json`, also `src/schema/schema/value-kinds.schema.json` and `src/schema/schema/refable-value-kinds.schema.json`
    - 'validate the schema' means to validate the JSON schema itself

- **algorithm**
    - A validated algorithm definition, compliant with The Schema
    - Examples live in `src/algorithms/`
    - 'validate the algorithm' means to validate that a given algorithm is spec compliant and compiles correctly


---

### Nodes

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

### Node Ports and Values


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

### Engine

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

### Terms to be avoided

- **type** 
    - `type` is a reserved keyword in TypeScript, and the term is ambiguous — do we mean type as in a TypeScript type? Or just generally as 'the kind of thing'? Use the term `kind` instead for the latter usage. 

- **param** 
    - This term is not problematic, but is already well covered by 'node input'


--- 
## Sub agents 

Keep in mind the specific define/declare/implement terminology set out in the preceeding Terminology section. 

The following sub agents are available to you 


### Definition Agents 
- `schema-agent` - The schema agent is responsible for any _defining_ work - defining new value primitives, defining new nodes

### Implementation Agents

- `compute-node-agent` - The compute node agent is responsible for _implementing_ compute nodes. 

- `render-node-agent` - The render node agent is responsible for _implementing_ render nodes. 

- `control-node-agent` - The control node agent is responsible for _implementing_ control nodes.

### Declaration agents

- `algorithm-agent` - The algorithm agent is responsible for _declaring_ new algorithms, including test algorithms to prove a feature. 

--- 

Work should be delegated to agents. This reduces the context window of the operating agent and improves performance and efficiency. 


## Tasks to be done 

Remember to spawn sub agents to do these jobs. 

Trust that the agents have enough context to do their job. You just need to give them high level information - they have the ability to work out exactly which files to modify. 

### Create a new node type 

1. If you need a new value kind, then define it in `value-kinds.schema.json`
    - Run `bun generate`
2. Define the node in `schema.json`
3. Implement the node in `src/nodes/*/nodes*`
3. Create a reference algorithm in `src/algorithms/reference/node_specific`
    - Create it with a single named export
    - This should be a minimal algorithm that contains the node you just created.
    - Tests will automatically pick this reference algorithm up and create snapshot tests for it. 

