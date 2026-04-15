# Replace edges with inline param refs

## Context

The current schema has a separate `edges` array (one for `compute`, one for `render`) that connects node outputs to node inputs using integer port indices:

```typescript
edges: [
  { fromNode: 'time', fromPort: 0, toNode: 'earthOrbit', toPort: 0 },
  { fromNode: 'earthSpeedSlider', fromPort: 0, toNode: 'earthOrbit', toPort: 2 },
]
```

Several problems:
1. **Port indices are opaque** — you need a comment (`// Orbit ports: 0=time, 1=radius`) or you can't read them.
2. **Multiple edges to one port are silently ignored** — the evaluator uses `.find()` and takes the first match. No validation, no error.
3. **Params must be stripped when connected** — a connected port must have its param removed from serialised JSON. Non-obvious and error-prone.
4. **Cross-referencing overhead** — understanding a node's inputs requires reading both `params` AND the `edges` array.

The proposed fix: params become either `{v: 0.02}` (static) or `{ref: "nodeId.portName"}` (dynamic). This makes it impossible to have multiple inputs on one port, self-documents connections, and keeps everything in one place.

## Result

earthVenus becomes:
```typescript
{ id: 'earthOrbit', type: 'orbit', params: {
    time:   { ref: 'time.time' },
    radius: { ref: 'earthDistanceSlider.value' },
    speed:  { ref: 'earthSpeedSlider.value' },
}}
```
instead of a node with a missing `time` param plus three entries in a separate `edges` array.

## Files to change

- `src/schema/schema.json`
- `src/schema/_generated/schema-types.d.ts`
- `src/graph/compiler.ts`
- `src/graphs/earthVenus.ts`
- `src/graphs/threeOrbits.ts`
- `src/graph/CLAUDE.md`, `src/schema/CLAUDE.md` (documentation)

`src/graph/evaluator.ts` — **no changes needed** (see strategy below).

## Strategy: compiler converts refs → internal edges

The evaluator already works correctly with a compiled edges array. Rather than changing the evaluator, the compiler will:
1. Scan each node's params for `{ref: "nodeId.portName"}` values
2. Resolve `portName` to an integer index by looking up the source node's `outputs` array
3. Build the same internal `Edge[]` structure the evaluator already consumes

This means zero changes to the hot path (evaluator.ts), and the change is entirely in the compilation/serialisation layer.

## Step-by-step

### 1. Update `src/schema/schema.json`

Add a `refParam` definition:
```json
"refParam": {
  "type": "object",
  "required": ["ref"],
  "additionalProperties": false,
  "properties": {
    "ref": {
      "type": "string",
      "pattern": "^[a-zA-Z][a-zA-Z0-9_-]*\\.[a-zA-Z][a-zA-Z0-9_-]*$"
    }
  }
}
```

Change every param definition (`numberParam`, `colorParam`, `pointParam`, `stringParam`, `booleanParam`) from a plain object to:
```json
"numberParam": {
  "oneOf": [
    { "type": "object", "required": ["v"], "additionalProperties": false,
      "properties": { "v": {"type": "number"}, "locked": {"type": "boolean"}, "comment": {"type": "string"} }
    },
    { "$ref": "#/definitions/refParam" }
  ]
}
```

Remove `edges` from `compute` and `render` sections. Change `required: ["nodes", "edges"]` to `required: ["nodes"]`.

Bump version pattern description to note `1.0` is the minimum for ref-syntax graphs.

### 2. Update `src/schema/_generated/schema-types.d.ts`

Regenerate or manually update. Each param type becomes a union:
```typescript
type NumberParam = { v: number; locked?: boolean; comment?: string } | { ref: string };
type ColorParam  = { v: { r: number; g: number; b: number; a: number }; locked?: boolean } | { ref: string };
// etc.
```

Remove the `Edge` type and `edges` fields from `GeoArtGraph`.

### 3. Update `src/graph/compiler.ts`

Replace step 4 (collect edges from `graph.compute.edges` + `graph.render.edges`) with a ref-scanning step:

```typescript
// New step 4: scan params for {ref: ...} and build internal edges
const allEdges: Edge[] = [];

for (const [toNodeId, compiledNode] of nodes.entries()) {
  const { def } = compiledNode;
  const inputs = (def as NodeDef | RenderNodeDef).inputs ?? [];

  for (let portIndex = 0; portIndex < inputs.length; portIndex++) {
    const portName = inputs[portIndex].name;
    const rawParam = (rawParamsByNodeId.get(toNodeId) ?? {})[portName];

    if (rawParam && 'ref' in rawParam) {
      const [fromNodeId, fromPortName] = rawParam.ref.split('.');
      const fromCompiledNode = nodes.get(fromNodeId);
      if (!fromCompiledNode) throw new Error(`Ref "${rawParam.ref}" references unknown node "${fromNodeId}"`);
      const fromDef = fromCompiledNode.def;
      const outputs = (fromDef as NodeDef | ControlNodeDef | RenderNodeDef).outputs ?? [];
      const fromPort = outputs.findIndex(p => p.name === fromPortName);
      if (fromPort === -1) throw new Error(`Ref "${rawParam.ref}": no output port named "${fromPortName}" on node "${fromNodeId}"`);
      allEdges.push({ fromNode: fromNodeId, fromPort, toNode: toNodeId, toPort: portIndex });
    }
  }
}
```

The compiler must retain raw params (before `buildParams`) for the ref scan. Add `rawParamsByNodeId: Map<string, Record<string, unknown>>` alongside existing node registration.

Step 5 (layer direction validation) and step 6 (topological sort) are unchanged — they operate on the same `allEdges: Edge[]` array.

### 4. Update sample graphs

`src/graphs/earthVenus.ts` — remove `edges` arrays, add `ref` params to nodes.
`src/graphs/threeOrbits.ts` — same.

Port name reference:
- `time` node output: `time`
- `orbit` node inputs: `time`, `radius`, `speed`, `center`; output: `point`
- `slider` node output: `value`
- Render node inputs (timedLine, circle): check each node's `inputs` array.

### 5. Update CLAUDE.md files

`src/schema/CLAUDE.md` — remove edges documentation, add ref param docs.
`src/graph/CLAUDE.md` — update Input Resolution section.

## Verification

1. `bun run typecheck` — no type errors
2. `bun run test:headless --run` — all existing tests pass
3. Manually verify earthVenus graph still evaluates correctly (visual check if dev server available)
4. Confirm no `edges` key appears in compiled graph types
