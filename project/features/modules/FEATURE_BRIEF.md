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
- Has `id`, `type`, `params`, optional `controls` and `render` configuration
- Gets expanded during compilation

**Module Marker Node** (synthetic, post-expansion)
- Created by the module implementation during expansion
- Exists in the compiled graph as the public interface for the module
- Has the x-outputs declared in the module's type definition
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
    },
    controls: {
      speed: true,    // generate control for this param
      radius: false,  // don't generate (getting value from ref instead)
    },
    render: {
      live: {
        point: true,  // render current position
        path: true,   // render orbit path
      },
      paint: {
        trace: false, // don't render trail
      }
    }
  }]
}
```

### Schema Structure

Module node definition in schema includes:
- `params` - input parameters (refable values, like compute nodes)
- `x-outputs` - what the module exposes to downstream nodes
- `controls` - which params get auto-generated control nodes (boolean flags)
- `render` - which render layers and outputs to generate (nested boolean flags)

All properties in `controls` and `render` must be booleans (enforced by validation).

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

## Implementation Roadmap

### ✅ Completed
- **Task #3**: Schema definition
  - Module structure defined in schema with orbit-module example
  - controls and render sections with explicit boolean properties
  - Validation rules enforcing boolean-only properties in controls/render
  - Test cases for both valid and invalid module structures

### Pending

**Task #4**: Design module implementation interface
- Signature: `implementModule(name, (params, moduleId) => [nodes])`
- Define return value structure (array of nodes + marker node)
- How implementations handle controls/render configuration
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
- Render module marker nodes distinctly
- Group/hide internal nodes by sourceModule
- Allow expand/collapse or drilling down
- Ensure module abstraction is visible to users

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Colon namespacing for internal nodes (`{moduleId}:{nodeId}`) | Clear, unambiguous, easy to parse |
| No dots or colons in user node IDs | Avoids confusion with module namespace syntax |
| Single validation pass before expansion | Simpler architecture; expansion is deterministic |
| Module marker nodes in compiled graph | Clean boundary; other nodes reference modules' outputs via markers |
| nodeSource metadata on all generated nodes | Graph view can trace provenance without special logic |
| Iterative (not recursive) expansion | Simpler implementation; easier to reason about |

## Terminology

See `projectDocs/terminology.md` for canonical definitions of:
- Module node
- Module marker node
- Module implementation
- Module expansion
- nodeSource

## Files Changed

- `src/schema/schema/schema.json` — Added `module` section and moduleNode definition
- `projectDocs/terminology.md` — Added module-specific terminology
- `src/schema/schema/validateSchemaStructure.ts` — Added validation for boolean-only properties in controls/render
- Test files — Added test coverage for module declarations
