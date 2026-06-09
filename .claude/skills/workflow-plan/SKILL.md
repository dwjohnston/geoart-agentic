---
name: workflow-plan
description: Phase 2 — break a feature brief into a task plan with skill assignments.
---

You are running Phase 2 of the workflow: planning.


## Workflow

### Projects folder

```
/projects
   /completed-features  - features move here when done
   /features
      /[feature name]
         FEATURE_BRIEF.md
         FEATURE_PLAN.md
         task_xx_skill_name_task_name.md
         /handoffs        - artefacts passed between skills

   /feedback            - skills can leave notes here
   /human               - human-only notes area
```

### Workflow Phases

---

#### Phase 1 — `/workflow-feature`

**HITL:** Conversational ideation. Ask clarifying questions, suggest alternatives, flag potential problems. This is not a jump-straight-into-action phase.

Ask for a feature name at the start. If a folder for this feature already exists in `projects/features`, tell the user.

Output: `FEATURE_BRIEF.md` in `projects/features/[feature name]/`.

**Headless:** The GitHub issue body *is* the brief. Copy it verbatim into `FEATURE_BRIEF.md` and proceed directly to Phase 2.

---

#### Phase 2 — `/workflow-plan`

Read the `FEATURE_BRIEF.md`. This phase should not require reading project files beyond that.

Produce a `FEATURE_PLAN.md` containing:

- A dependency graph showing which tasks can be parallelised and which depend on prior tasks (informational — in headless mode tasks run sequentially; in HITL the human may run independent tasks in parallel sessions)
- An ordered task list, each entry mapping to a named skill from the skills index
- One task file per task: `task_xx_skill_name_task_name.md`, containing the prompt for that skill invocation

If a task requires a skill that does not exist, **stop and inform the user**. Do not create a generic task file as a workaround.

---

#### Phase 3 — `/workflow-execute`

Invoke each task's skill in dependency order, reading its task file for the prompt.

Skills that feed into each other hand off via written artefacts at `projects/features/[feature name]/handoffs/`. See [agent_prompt_experiments.md](../agent_prompt_experiments.md) for the handoff pattern.

Commit after each task completes. Commit at stable checkpoints within a task. See [committing_philosophy.md](committing_philosophy.md).

**HITL:** Before invoking each task, prompt the user: "Run [task name] now?" The user may skip or defer individual tasks.

**Headless:** Run all tasks sequentially without prompting.

---

#### Phase 4 — `/workflow-accept`

**HITL:** Propose moving the feature folder from `projects/features/` to `projects/completed-features/`. Wait for confirmation before proceeding.

**Headless:** Move the folder automatically.

No commit step — commits have already been made throughout execution.



# Algorithm Lifecycle

This document traces the path an algorithm takes from initial definition to pixels on screen.

## 1. Define in the Schema

The schema is the source of truth. Any new node types must be defined in `src/schema/schema/schema.json` before they are implemented. If new value types are needed (e.g. a new shape that flows between nodes), they are defined in `value-kinds.schema.json` first.

`schema.json` uses `additionalProperties: false` throughout — unknown keys are a hard error at load time.

## 2. Implement the Nodes

Each node type referenced in the schema needs a runtime implementation in the relevant layer directory:

- `src/nodes/compute/` — pure mathematical transforms
- `src/nodes/control/` — UI controls (sliders, colour pickers)
- `src/nodes/render/` — canvas drawing nodes

Implementations are registered in each layer's registry, which is what the compiler and evaluator look up at runtime.

### Enum types require a selector control node

Every new enum value type (e.g. `normaliseModeEnumValue`) needs a corresponding **dropdown selector control node** so users can set it from the UI. The define-node step adds both the enum value type and the control node's schema entry, but the runtime implementation of that control node is a separate task — it must be planned as a `control-node` task in the feature plan.

**When planning a feature that introduces a new enum:** add a `control-node` task for the selector after the `define-node` task and before `algorithm`. The implementation task reads the define-node handoff to get the enum values and wraps `DropdownControl` with them hardcoded.

## 3. Write the Algorithm

An algorithm is a TypeScript file in `src/algorithms/`. It is a plain data structure of type `GeoArtGraph` — three sections of nodes (`control`, `compute`, `render`) connected via inline `ref` params.

TypeScript gives immediate type safety on the structure (correct param shapes, valid node types) but does not verify things like whether a referenced port actually exists on the source node — that is the compiler's job.

## 4. Schema Validation

Before a graph is loaded it is validated against `schema.json` using AJV (`src/schema/validateGeoArtGraph.ts`). This catches structural problems: wrong param shapes, unrecognised node types, missing required fields. It cannot catch graph topology errors (those are for the compiler).

## 5. Compilation

`compile()` in `src/graphEngine/compiler/` takes the validated `GeoArtGraph` and produces a `CompiledGraph`. This is where topology is verified:

- **Circular references** — detected and rejected
- **Port existence** — every `ref` must point to a node and port name that actually exists
- **Port type compatibility** — ref source and destination value types must match
- **Layer direction** — refs must flow Control → Compute → Render, never backwards

The output is a `CompiledGraph`:

```ts
type CompiledGraph = {
  sortedNodes: string[];        // node IDs in topological order
  nodes: Map<string, CompiledNode>;
  edges: Edge[];                // resolved from inline param refs
  states: Map<string, NodeState>;
};
```

The topological sort happens once here. The hot per-frame path is just a flat loop over `sortedNodes`.

## 6. Register the Algorithm

Add the algorithm to the `GRAPHS` array in `src/algorithms/index.ts`:

```ts
{ id: 'myAlgorithm', name: 'My Algorithm', graph: myAlgorithmGraph }
```

This is what the UI reads to populate the algorithm selector.

## 7. The Graph Engine

`createGraphEngine(orbitCtx, trailCtx, canvasSize)` creates a `GraphEngine` instance, receiving the two `CanvasRenderingContext2D` contexts it will pass to render nodes. (`orbitCtx` is the live layer; `trailCtx` is the paint layer.) Its interface:

```ts
type GraphEngine = {
  load: (graph: GeoArtGraph) => GraphLoadPayload;
  setSpeed: (value: number) => void;
  tick: () => void;
};
```

**`load(graph)`** compiles the graph, resets tick state, clears both canvases, and returns a `GraphLoadPayload`:

```ts
type GraphLoadPayload = {
  renderControlNodes: () => React.ReactNode;
};
```

`renderControlNodes` gives the UI the React elements for the algorithm's control nodes — sliders, pickers, etc.

**`tick()`** is called by the application's `requestAnimationFrame` loop. Each tick: clears the live canvas, builds an `EvalContext` with the current tick count and canvas references, and runs `evaluatorTick()` over the compiled graph in topological order. Render nodes fire according to their own `intervalTicks` schedule, not every frame.

**Control mutation** — when a user moves a slider, the UI calls back into the engine which directly updates the compiled node's `params` map and marks that node dirty, causing re-evaluation on the next tick.

## Summary

```
schema.json          ← define node & value types
      ↓
node implementations ← src/nodes/[compute|control|render]/
      ↓
algorithm file       ← src/algorithms/myAlgorithm.ts  (TypeScript type safety)
      ↓
validateGeoArtGraph  ← schema validation (AJV)
      ↓
compile()            ← topology checks, edge resolution, topological sort
      ↓
GRAPHS registry      ← src/algorithms/index.ts
      ↓
GraphEngine.load()   ← returns control nodes for the UI
      ↓
GraphEngine.tick()   ← called each requestAnimationFrame, draws to canvas
```



## Available Skills

The following skills are available for task-specific work. Invoke the appropriate skill before starting a scoped task.

### Workflow

| Skill | Purpose |
|---|---|
| `workflow-feature` | Phase 1 — ideate and write a `FEATURE_BRIEF.md` |
| `workflow-plan` | Phase 2 — break a feature brief into a task plan with skill assignments |
| `workflow-execute` | Phase 3 — invoke each task skill in dependency order |
| `workflow-accept` | Phase 4 — move a completed feature to `projects/completed-features` |
| `workflow-auto` | Headless orchestrator — runs all four phases in sequence (GitHub integration) |

### Node development

| Skill | Purpose |
|---|---|
| `define-node` | Define a new node type or value primitive in `src/schema` |
| `compute-node` | Implement a compute node in `src/nodes/compute` |
| `render-node` | Implement a render node in `src/nodes/render` |
| `control-node` | Implement a control node in `src/nodes/control` |
| `module-node` | Implement a module node in `src/nodes/module` |
| `algorithm` | Declare a new algorithm in `src/algorithms` |

