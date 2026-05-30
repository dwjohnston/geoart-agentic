# Modules Feature Brief

## Overview

Modules are reusable groups of nodes that can be reasoned about and used like individual nodes. They solve the problem that adding a compute node often requires several supporting nodes (control nodes, render nodes) that should be provided together as a cohesive unit.

**Example:** An `orbit-module` encapsulates not just the orbital calculation, but also provides sliders for speed/radius/eccentricity, renders the orbit path and current point, and exposes the calculated position for downstream use.

## Problem Statement

Currently, when adding a new compute node type (e.g., an orbit calculation), users must:
1. Create the compute node
2. Manually add control nodes for user inputs (sliders, color pickers)
3. Manually add render nodes to visualize the results (paths, points)
4. Wire all the connections between them

This creates friction and cognitive load. Modules let us package all of this into a single declarative unit.

## Design

### Core Concepts

**Module Node** (user-declarable, pre-expansion)
- Declared in the algorithm's `module` section
- Has `id`, `type`, and `params`
- Gets expanded during compilation

**Module Input Marker Node** (synthetic, post-expansion)
- Created by the module implementation during expansion
- Provides data source for all of the module's inputs
- Internal nodes within the module reference this node's outputs
- Tagged with `nodeSource` metadata to track provenance

**Module Output Marker Node** (synthetic, post-expansion)
- Created by the module implementation during expansion
- Exists in the compiled graph as the public interface for the module
- Has the x-outputs declared in the module's type definition
- Other nodes reference module outputs via this marker node
- Tagged with `nodeSource` metadata to track provenance

**Module Expansion** (compiler)
- Iterative process: while the graph contains module nodes, expand them
- Module implementation returns a bundle of internal nodes + marker node
- Internal node IDs are namespaced: `{moduleId}:{internalNodeId}`
- Expansion happens after topology validation (refs validated against module x-outputs)

### Algorithm Declaration

```typescript
module: {
  nodes: [{
    id: "my-orbit",
    type: "orbit-module",
    params: {
      speed: { v: 0.01 },
      radius: { ref: "someSlider.value" },
      // ... other params
    }
  }]
}
```

### Schema Structure

Module node definition in schema includes:
- `params` - input parameters (refable values, like compute nodes)
- `x-outputs` - what the module exposes to downstream nodes

### Compiler Pipeline

1. **Validate algorithm** — Check refs against node x-outputs and module x-outputs
2. **Iteratively expand modules** — For each module in graph, call implementation to get node bundle
3. **Return compiled graph** — Flat array of primitive nodes + marker nodes

No re-validation after expansion (if step 1 passes, expansion is valid by construction).

### Graph View

- Recognize module marker nodes and render them as modules (not primitive nodes)
- Group internal nodes under their parent module (using `nodeSource` metadata)
- Hide internal nodes from default view, allow drilling down to see internals
- Module marker nodes are visually distinct from other node types

## Scenarios and Examples

### Scenario 1: Module node's inputs from a regular node

A module receives values from a regular node declared in the algorithm's `nodes` section.

**Algorithm Declaration:**
```typescript
nodes: [
  {
    id: 'globalTime',
    type: 'time',  // regular compute node
    params: {}
  }
],
modules: {
  nodes: [
    {
      id: 'myOrbit',
      type: 'orbit-module',
      params: {
        time: { ref: 'globalTime.time' },  // gets time from regular node
        radius: { v: 0.2 },
        numPoints: { v: 8 },
        centerPoints: { v: [{ x: 0, y: 0, r: 1, g: 1, b: 1, a: 1 }] }
      }
    }
  ]
}
```

**Compiler Expansion:**
After expansion, the compiled graph becomes:
1. Regular node: `globalTime` (time node, unchanged)
2. Module input marker: `myOrbit:input-marker` — outputs the module's input values (`time`, `radius`, `numPoints`, `centerPoints`)
3. Compute node: `myOrbit:orbit` — the internal orbit calculation, refs inputs from `myOrbit:input-marker`
4. Render nodes: `myOrbit:orbit-path`, `myOrbit:orbit-point` — render the orbit, ref outputs from `myOrbit:orbit`
5. Module output marker: `myOrbit` — exposes the orbit's output (e.g., `points`) to external nodes

The module input marker's `time` output is fed by `globalTime.time`; other nodes in the module ref `myOrbit:input-marker.time`.

---

### Scenario 2: Regular node's inputs from a module node's outputs

A regular node declared in the algorithm receives its inputs from a module's outputs.

**Algorithm Declaration:**
```typescript
modules: {
  nodes: [
    {
      id: 'colorGen',
      type: 'color-gradient-module',
      params: {
        numColors: { v: 5 },
        hueShift: { v: 0.1 }
      }
    }
  ]
},
nodes: [
  {
    id: 'display',
    type: 'colorArray',
    params: {
      colors: { ref: 'colorGen.colors' }  // refs module output
    }
  }
]
```

**Compiler Expansion:**
1. Module input marker: `colorGen:input-marker`
2. Compute/render nodes internal to `color-gradient-module`
3. Module output marker: `colorGen` — has output port `colors`
4. Regular node: `display` — refs `colorGen.colors` (which resolves to the module output marker's output port)

The regular node `display` depends on the module `colorGen` being expanded first. The topology validator ensures `colorGen.colors` exists before compilation.

---

### Scenario 3: Module node's inputs from another module node's outputs

One module receives its inputs from another module's outputs.

**Algorithm Declaration:**
```typescript
modules: {
  nodes: [
    {
      id: 'timeModulator',
      type: 'sine-lfo-module',
      params: {
        frequency: { v: 0.5 },
        amplitude: { v: 1.0 }
      }
    },
    {
      id: 'orbit',
      type: 'orbit-module',
      params: {
        time: { v: 0 },
        radius: { ref: 'timeModulator.output' },  // module refs another module's output
        numPoints: { v: 8 },
        centerPoints: { v: [{ x: 0, y: 0, r: 1, g: 1, b: 1, a: 1 }] }
      }
    }
  ]
}
```

**Compiler Expansion:**
Modules are expanded iteratively:

1. First iteration expands `timeModulator`:
   - Input marker: `timeModulator:input-marker`
   - Internal sine/LFO compute nodes
   - Output marker: `timeModulator` (with output port `output`)

2. Second iteration expands `orbit`:
   - Input marker: `orbit:input-marker` — its `radius` input is fed by `timeModulator.output`
   - Internal orbit compute node: `orbit:orbit` — refs `orbit:input-marker.radius`
   - Render nodes: `orbit:orbit-path`, `orbit:orbit-point`
   - Output marker: `orbit`

The dependency between modules is enforced during validation: `timeModulator.output` must exist before `orbit` can reference it.

---

### Scenario 4: Nested modules (module internally contains another module)

A module's implementation internally uses another module, creating nested expansion.

**Algorithm Declaration:**
```typescript
modules: {
  nodes: [
    {
      id: 'oscillatingOrbit',
      type: 'oscillating-orbit-module',
      params: {
        baseRadius: { v: 0.2 },
        oscillationFrequency: { v: 0.5 },
        oscillationAmplitude: { v: 0.05 }
      }
    }
  ]
}
```

**Module Implementation Structure:**
The `oscillating-orbit-module` implementation internally declares:
- A `sine-lfo-module` (to modulate the radius over time)
- An `orbit-module` (to compute orbital motion with the modulated radius)
- Control/render nodes to expose configuration

**Compiler Expansion:**
Modules expand iteratively until no module nodes remain:

1. First iteration expands `oscillatingOrbit`:
   - Input marker: `oscillatingOrbit:input-marker`
   - Internal module node: `oscillatingOrbit:sineModulator` (a sine-lfo-module)
   - Internal module node: `oscillatingOrbit:orbitPath` (an orbit-module)
   - Internal render nodes
   - Output marker: `oscillatingOrbit`

2. Second iteration expands `oscillatingOrbit:sineModulator`:
   - Input marker: `oscillatingOrbit:sineModulator:input-marker`
   - Sine compute node: `oscillatingOrbit:sineModulator:sine`
   - Output marker: `oscillatingOrbit:sineModulator`

3. Third iteration expands `oscillatingOrbit:orbitPath`:
   - Input marker: `oscillatingOrbit:orbitPath:input-marker`
   - Orbit compute node: `oscillatingOrbit:orbitPath:orbit`
   - Render nodes: `oscillatingOrbit:orbitPath:path`, `oscillatingOrbit:orbitPath:point`
   - Output marker: `oscillatingOrbit:orbitPath`

Final compiled graph contains only primitive (non-module) nodes. Internal wiring between nested modules is resolved: e.g., `oscillatingOrbit:orbitPath:input-marker.radius` is fed by `oscillatingOrbit:sineModulator.output`.

## Implementation Roadmap

### ✅ Completed
- **Task #3**: Schema definition
  - Module structure defined in schema with orbit-module example
  - Test cases for module structures

### Pending

**Task #4**: Design module implementation interface
- Signature: `implementModule(name, (params, moduleId) => [nodes])`
- Define return value structure (array of nodes + marker node)
- How marker node is created and linked to internal outputs

**Task #5**: Implement orbit-module
- First concrete module implementation
- Serve as the canonical example for how modules work
- Include reference algorithm demonstrating use

**Task #6**: Implement module expansion in compiler
- Iterative expansion logic in src/graphEngine/compiler/
- Node ID namespacing with colons
- nodeSource metadata assignment
- Handle nested modules

**Task #7**: Update graph view
- Render module output marker nodes distinctly
- Group/hide internal nodes by sourceModule
- Allow expand/collapse or drilling down
- Ensure module abstraction is visible to users

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Colon namespacing for internal nodes (`{moduleId}:{nodeId}`) | Clear, unambiguous, easy to parse |
| No dots or colons in user node IDs | Avoids confusion with module namespace syntax |
| Single validation pass before expansion | Simpler architecture; expansion is deterministic |
| Marker nodes in compiled graph | Clean boundary; expose module's outputs to external nodes |
| nodeSource metadata on all generated nodes | Graph view can trace provenance without special logic |
| Iterative (not recursive) expansion | Simpler implementation; easier to reason about |

## Terminology

See `projectDocs/terminology.md` for canonical definitions of:
- Module node
- Module input marker node
- Module output marker node
- Module implementation
- Module expansion
- nodeSource

## Files Changed

- `src/schema/schema/schema.json` — Added `module` section and moduleNode definition
- `projectDocs/terminology.md` — Added module-specific terminology
- Test files — Added test coverage for module declarations
