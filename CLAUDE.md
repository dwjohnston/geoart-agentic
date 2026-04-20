# Geometric Art Engine

## Tooling 

- Use Bun


## Code Style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Do not use the `interface` keyword. 
- Do not use the TypeScript `enum` keyword. 
- When a variable describes a duration value, include the duration unit in the variable name. eg. `intervalMs`, not `interval`. 

## Planning 

PLAN.md files go into the `project` folder. 

When a given plan is complete, move it into `project/archived` where they should start with an ISO date string followed by a concise description. 

## Workflow
 - Run the following commands after making a series of changes to check that everything is ok: 
   - `bun test:headless`
   - `bun lint`
   - `bun typecheck` 
 - Prefer running single tests, and not the whole test suite, for performance 

## Spelling 

Always use British English, with the except of the following words: 

- color 
- center

A dataflow graph engine for generative, algorithmic art. The user builds algorithms
by connecting nodes together. The graph is evaluated every animation frame.

## Architecture Overview

The system has three strictly separated layers. Data flows in one direction only:

```
Control → Compute → Render
```

- **Control** — user-facing inputs (sliders, colour pickers). Pure value sources, no logic.
- **Compute** — pure math nodes (wave, orbit, scale). No canvas access, no UI knowledge.
- **Render** — drawing nodes (line, trail, circle). Consume compute outputs, write to canvas.

A ref may cross layer boundaries only in the permitted direction. A render node
may never feed back into compute. Enforce this at graph compile time.

See `src/compute/CLAUDE.md`, `src/render/CLAUDE.md`, `src/control/CLAUDE.md` for
layer-specific rules.

## Key Concepts

**Every input port on every node is modulatable.** A param can be a static value
`{ v: 0.5 }` or a reference to another node's output `{ ref: "nodeId.portName" }`.
If a port has no param at all, it falls back to the port's default. This is handled
by the graph evaluator — individual node implementations never need to think about it.

**Time is an explicit node**, not implicit context. The `TimeNode` outputs elapsed
seconds. Wire it to any port that needs to vary over time.

**Nodes are stateless pure functions** wherever possible. Nodes that need state
(e.g. accumulating drawn points) use `ctx.getState / ctx.setState` — see
`src/graph/EvalContext.ts`.

**The graph is compiled once, evaluated every frame.** Topological sort happens at
compile time. The hot path (per-frame evaluation) is a flat loop over pre-sorted nodes.

## Adding a New Node Type

1. Implement the node in the appropriate layer directory.
2. Register it in that layer's `registry.ts`.
3. Add its type string to the JSON schema enum in `src/schema/schema.json`.
4. Add it to the layer's `CLAUDE.md` node catalogue.

Do not skip step 3 — the schema is the source of truth for valid node types.

## Value Types

```typescript
type Value =
  | { kind: 'number'; v: number }
  | { kind: 'point';  v: { x: number; y: number } }
  | { kind: 'color';  v: { r: number; g: number; b: number; a: number } }
  | { kind: 'trigger'; fired: boolean }
```

All values in the `number` domain are normalised to `-1 to 1` at the compute layer.
Scaling to canvas coordinates or useful ranges is the job of a `ScaleNode`, not the
consuming node.

## Serialisation

Graphs are serialised as JSON and validated against `src/schema/schema.json` (JSON Schema
draft-07). The schema uses `additionalProperties: false` throughout — unknown keys
are a hard error, not silently ignored. When adding new node types or params, update
the schema first, then implement.

Connections between nodes are expressed as inline param refs:
`{ "ref": "nodeId.portName" }` — where `portName` is the name of an output port
on the source node. There is no separate edges array.

## Performance Rules

- Never traverse the graph at eval time. Use the compiled `sortedNodes` array.
- Mark nodes as `isTimeDependant: true` only if they genuinely read `ctx.time`.
- Constant nodes and pure transforms (scale, add) must never re-evaluate if their
  inputs have not changed. Check `isDirty` before evaluating.
- Render nodes run on their own schedule (`intervalMs`), not every frame. Do not
  call canvas methods from compute nodes.

## What Not To Do

- Do not add canvas or DOM access to any compute node.
- Do not add graph traversal logic to any node implementation.
- Do not hardcode time into a node — wire a `TimeNode` instead.
- Do not add a `kind` field to serialised params — the registry already knows the type.
- Do not create refs that flow backwards (render → compute, compute → control).
