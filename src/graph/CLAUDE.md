# Graph Layer

The evaluation engine. Knows about all three layers. Owns the compile and tick loop.

This is the only place in the codebase that imports from all three layers.

## Compile vs Tick

**Compile** happens once when a graph is loaded or modified:

1. Validate all node type strings against the registry.
2. Validate all edge port indices against node definitions.
3. Validate edge type compatibility (number → number, point → point, etc.).
4. Validate layer direction — reject any edge that flows backwards
   (render → compute, render → control, compute → control).
5. Topological sort the full node list (control + compute + render together).
6. Store the sorted ID array as `CompiledGraph.sortedNodes`.

Throw a descriptive error at compile time rather than failing silently at eval time.

**Tick** happens every animation frame (`requestAnimationFrame`):

```typescript
function tick(compiled: CompiledGraph, t: number) {
  const cache = new Map<string, Value[]>();

  // 1. Mark time-dependant compute nodes dirty
  for (const nodeId of compiled.sortedNodes) {
    const node = compiled.nodes.get(nodeId)!;
    if (node.def.isTimeDependant) {
      compiled.states.get(nodeId)!.isDirty = true;
    }
  }

  // 2. Propagate dirtiness forward through edges
  propagateDirty(compiled);

  // 3. Evaluate in topological order, skipping clean nodes
  for (const nodeId of compiled.sortedNodes) {
    const state = compiled.states.get(nodeId)!;
    if (!state.isDirty) {
      cache.set(nodeId, state.lastOutput);
      continue;
    }
    const output = evaluateNode(compiled, nodeId, cache, t);
    state.lastOutput = output;
    state.isDirty = false;
    cache.set(nodeId, output);
  }
}
```

## Input Resolution

For each input port on a node, `resolveInput` is called before `evaluate`:

```typescript
function resolveInput(compiled, nodeId, portIndex, cache): Value {
  const edge = compiled.edges.find(
    e => e.toNode === nodeId && e.toPort === portIndex
  );
  if (edge) {
    return cache.get(edge.fromNode)![edge.fromPort];
  }
  // Fall back to static param
  const node = compiled.nodes.get(nodeId)!;
  const portName = node.def.inputs[portIndex].name;
  return node.params[portName] ?? node.def.inputs[portIndex].default;
}
```

Node implementations never call this — it is handled by the evaluator before
`evaluate` is called. Nodes receive a fully resolved `Value[]` array.

## EvalContext

```typescript
interface EvalContext {
  time: number;                     // ms since graph start
  deltaTime: number;                // ms since last frame
  canvas: {
    orbit: CanvasRenderingContext2D;
    trail: CanvasRenderingContext2D;
    width: number;
    height: number;
  };
  getState<T>(): T;
  setState<T>(s: T): void;
}
```

`getState / setState` are scoped to the calling node instance. The graph layer
injects the correct scope — nodes do not need to pass their own ID.

## Serialisation

`deserialise(json: string): CompiledGraph` — parse, validate schema, compile.
`serialise(compiled: CompiledGraph): string` — strip connected params, emit JSON.

The serialiser must strip any param key whose port has an incoming edge. See root
`CLAUDE.md` for the rationale.

## Render Node Scheduling

Render nodes are not evaluated on every frame. The evaluator tracks `lastFiredAt`
per render node and compares against `intervalMs`:

```typescript
if (node.def.layer === 'render') {
  const state = compiled.states.get(nodeId)!;
  if (t - state.lastFiredAt < node.def.intervalMs) continue;
  state.lastFiredAt = t;
}
```

The `intervalMs` param on a render node may itself be driven by an edge — resolve
it before the interval check.

## What Not To Do

- Do not perform domain math here — the graph layer moves values, it does not
  transform them.
- Do not access the canvas outside of the render node evaluation path.
- Do not call `evaluate` on a node whose inputs have not been resolved.
- Do not sort the graph on every tick — sort once at compile time.
