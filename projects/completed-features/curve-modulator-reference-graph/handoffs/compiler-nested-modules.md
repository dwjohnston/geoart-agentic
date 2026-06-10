# Compiler Handoff: Nested Module Expansion Support

**Status:** Completed ✓

## Summary

Implemented support for modules that contain other modules (nested/hierarchical modules). The compiler now recursively expands all module nodes, including those returned by module implementations.

## What was added

### 1. ModuleExpansionResult Interface
Added optional `moduleNodes` field to allow module implementations to declare internal module nodes:

```typescript
export interface ModuleExpansionResult<K extends ModuleNodeKinds> {
  controlNodes: GeoArtGraph['control']['nodes'];
  computeNodes: GeoArtGraph['compute']['nodes'];
  renderNodes: GeoArtGraph['render']['nodes'];
  moduleNodes?: ModuleNode[];  // NEW: internal module nodes
  inputMarkerNode: { ... };
  outputMarkerNode: { ... };
  defaultValues: NodeInputsResolved<K>;
}
```

### 2. Compiler Changes
Modified `src/graphEngine/compiler/compiler.ts` to:
- Recursively expand modules in depth-first order
- Namespace nested module IDs: `{parentId}:{childId}`
- Defer param building until after all modules are expanded
  - This ensures refs to nested modules can be resolved (nested modules must exist before parent's nodes try to reference them)

### 3. Expansion Algorithm
```
function expandModule(moduleId):
  1. Get module implementation
  2. Call implementation to get expansion
  3. If expansion has nested moduleNodes:
     - Namespace each nested module: {moduleId}:{nestedId}
     - Recursively expand each nested module FIRST (depth-first)
  4. Register module's nodes (control, compute, render, markers)
  5. (Params built later in second pass after all modules expanded)
```

## How to use in a module implementation

When defining a module that contains other modules:

```typescript
const myModuleImpl = implementModule({
  _kind: "my-module",
  defaultValues: { ... },
  provideNodes: (params, moduleId, defaultValues) => {
    const inputMarkerId = createInternalId(moduleId, 'input-marker');
    const subModuleId = 'sub-module';  // Non-namespaced ID
    const subModuleFullId = createInternalId(moduleId, subModuleId);

    return {
      controlNodes: [],
      computeNodes: [
        {
          id: createInternalId(moduleId, 'compute'),
          type: 'someNode',
          params: {
            input: { ref: `${subModuleFullId}.output` }  // Ref to nested module
          }
        }
      ],
      renderNodes: [],
      moduleNodes: [
        {
          id: subModuleId,  // Non-namespaced!
          type: 'sub-module-type',
          params: { ... }
        }
      ],
      inputMarkerNode: { ... },
      outputMarkerNode: { ... },
      defaultValues
    };
  }
});
```

## Key Points

1. **Non-namespaced IDs in moduleNodes** — Module implementations declare nested modules with simple IDs (e.g., `"wave-module"`). The compiler adds the parent module ID prefix automatically.

2. **Depth-first expansion** — Nested modules are expanded before parent module's nodes are registered, ensuring all dependencies are available when building params.

3. **Automatic namespacing** — Nested module with ID `"wave-module"` in parent `"my-curve-mod"` becomes `"my-curve-mod:wave-module"` in the compiled graph.

## Testing

Passing test: `src/graphEngine/evaluator/evaluator.test.ts` — "nested module expansion — a module containing another module"

Demonstrates:
- curve-modulator-module (parent) containing wave-module (child)
- Recursive expansion producing correctly namespaced internal nodes
- Proper ref resolution to nested module outputs
