# Sampler — Execution Plan

## Status

| Task | Agent | Status |
|------|-------|--------|
| A: Add `samplerValue` to value-kinds schema with `refOnly` flag | schema-agent | pending |
| B: Add `sampler` output to wave node; update schema | schema-agent | pending |
| C: Regenerate schema types (`_generated` files) | schema-agent | pending |
| D: Implement sampler runtime in `WaveNode.tsx` | compute-node-agent | pending |
| E: Add `modulateBy` param to `PointsOnALine` node in schema | schema-agent | pending |
| F: Implement `modulateBy` modulation logic in `PointsOnALineNode.tsx` | compute-node-agent | pending |
| G: Implement `connectDots` render node (schema + UI) | render-node-agent | pending |
| H: Register `connectDots` in render registry | render-node-agent | pending |
| I: Create test graph and verify output | testing | pending |

## Dependency Graph

```
A (add samplerValue to schema)
  ↓
B (add wave.sampler output)
  ↓
C (regenerate _generated files)
  ↓
D (implement wave sampler runtime)  +  E (add modulateBy to PointsOnALine schema)
  ↓                                        ↓
F (implement modulateBy modulation)
  ↓
G + H (implement connectDots render node)
  ↓
I (test graph)
```

**Parallelisation:**
- A, B, E can be done together in one schema-agent call
- C depends on A + B + E
- D and F can run in parallel after C
- G + H run together after D + F
- I runs after all

---

## Task A + B + E — Schema Updates

### Agent: schema-agent

Update `src/schema/schema/` files to add `samplerValue`, the `sampler` output on wave, and the `modulateBy` param on PointsOnALine.

**Step A1 — Add `samplerValue` to `value-kinds.schema.json`**

In `src/schema/schema/value-kinds.schema.json`, add this definition to the `definitions` object:

```json
"samplerValue": {
  "title": "Sampler Value",
  "type": "object",
  "description": "Runtime-only function wrapper for lazy evaluation of a wave at arbitrary positions. Contains sample(t) and sampleMany(ts) functions. Cannot be statically defined in JSON.",
  "refOnly": true,
  "additionalProperties": false,
  "required": ["v"],
  "properties": {
    "v": {
      "type": "object",
      "description": "Placeholder object — actual value is a function at runtime"
    }
  }
}
```

The `refOnly: true` flag signals that static values of this type cannot be serialised.

**Step B1 — Update wave node schema in `schema.json`**

Find the `computeNode` entry with `"type": "wave"`. Update its `"x-outputs"` array to include the sampler:

```json
"x-outputs": [
  { "name": "value", "valueType": "numberValue" },
  { "name": "sampler", "valueType": "samplerValue" }
],
```

(The `value` output already exists; just add the `sampler` entry.)

**Step E1 — Add `modulateBy` param to PointsOnALine in `schema.json`**

Find the `computeNode` entry with `"type": "pointsOnALine"`. In its `params.properties`, add:

```json
"modulateBy": {
  "description": "Optional sampler to displace each point perpendicular to the line. If absent, no modulation is applied.",
  "oneOf": [
    {
      "type": "object",
      "additionalProperties": false,
      "required": ["v"],
      "properties": {
        "v": {
          "type": "null"
        }
      }
    },
    { "$ref": "#/definitions/refParam" }
  ]
}
```

This allows `modulateBy` to be either `{ "v": null }` (no modulation) or `{ "ref": "nodeId.portName" }` (a sampler ref).

**Notes for schema-agent:**
- Do not make `modulateBy` a required param; it is optional (backward-compatible default is null)
- The `refOnly` flag in `samplerValue` is custom JSON Schema; it will not break validation but will need to be handled in code generation
- After these changes, run the generation script (Task C) to update the TypeScript types

---

## Task C — Regenerate Schema Types

### Agent: schema-agent

After completing Task A + B + E, regenerate the `_generated` files.

Run the schema generation command. Check `package.json` for the correct script name (likely `bun run generate:schema-types` or similar).

Verify that:
- `src/schema/_generated/node-outputs-2.ts` includes a `"wave"` entry with both `"value"` and `"sampler"` outputs
- `src/schema/_generated/node-inputs-2.ts` includes a `"pointsOnALine"` entry with the new `"modulateBy"` param
- `src/schema/_generated/schema-types.d.ts` has updated types (look for `WaveNode`, `PointsOnALineNode`)
- No TypeScript compilation errors in the schema layer

If code generation fails due to the `refOnly` flag, check the generation script to see if it needs a custom handler. The flag is informational and should not block generation — refOnly types flow through the system like any other type; the serialiser will enforce the constraint.

---

## Task D — Implement Sampler Runtime in Wave Node

### Agent: compute-node-agent

Implement after Task C. Read the generated types to confirm `WaveNode` has the new `sampler` output.

**Overview:**

The sampler encapsulates the wave evaluation logic so it can be called at arbitrary positions by other nodes.

**Step D1 — Update `WaveNode.tsx`**

In `src/nodes/compute/nodes/WaveNode.tsx`:

1. Define a sampler object that captures the wave's parameters:
   ```ts
   const sampler = {
     sample: (t: number): number => {
       // Evaluate the wave at normalised position t ∈ [0, 1]
       // Incorporate time as a phase offset for animation
       const phaseShift = (time * frequency * 2 * Math.PI) / 60; // time is tick count, convert to phase
       const arg = frequency * t * 2 * Math.PI + phaseShift + phase;
       return amplitude * waveFunc(arg);
     },
     sampleMany: (ts: number[]): number[] => {
       return ts.map(t => sampler.sample(t));
     }
   };
   ```

2. Update the node's return type to include both outputs:
   ```ts
   return {
     value: amplitude * waveFunc(...), // existing scalar output
     sampler: sampler,                 // new sampler output
   };
   ```

3. Ensure that:
   - `time` is obtained from the node's params (it will be a ref to the time node)
   - `frequency`, `amplitude`, `phase`, `waveShape` are all captured in the sampler closure
   - The sampler is recalculated on every frame (to animate as time changes)
   - The `sample` function evaluates the wave at a normalised position `t`, not a time value

**Notes for compute-node-agent:**
- The sampler is a JavaScript object with two functions — it cannot be serialised to JSON
- The `refOnly` flag ensures that graphs cannot store a static sampler value; a sampler can only come from a node's output port
- The `sampleMany` function is a convenience for other nodes that need to evaluate at multiple points
- Do not export the sampler type outside the node; it is runtime-only

---

## Task E + F — PointsOnALine Modulation

### Agent: compute-node-agent

Implement after Task C (needs the regenerated types for the new `modulateBy` param).

**Step E (Schema) — Already done in Task E1 above**

**Step F1 — Update `PointsOnALineNode.tsx`**

In `src/nodes/compute/nodes/PointsOnALineNode.tsx`:

1. Read the new `modulateBy` param:
   ```ts
   const modulateBy = node.params.modulateBy; // This will be a sampler if wired, or null if not
   ```

2. If `modulateBy` is provided, displace each point perpendicular to the line:
   ```ts
   if (modulateBy) {
     points = points.map((point, i) => {
       // Normalised position along the line: 0 at start, 1 at end
       const t = points.length > 1 ? i / (points.length - 1) : 0;
       const displacement = modulateBy.sample(t);
       
       // Line vector (from start to end)
       const lineVector = { x: end.x - start.x, y: end.y - start.y };
       const lineLength = Math.sqrt(lineVector.x ** 2 + lineVector.y ** 2);
       
       // Perpendicular vector (90° rotation of line vector, normalised)
       const perpVector = {
         x: -lineVector.y / lineLength,
         y: lineVector.x / lineLength
       };
       
       // Displace point along perpendicular
       return {
         x: point.x + perpVector.x * displacement,
         y: point.y + perpVector.y * displacement,
         r: point.r,
         g: point.g,
         b: point.b,
         a: point.a
       };
     });
   }
   ```

3. Return the modulated points array as usual.

**Notes for compute-node-agent:**
- If `modulateBy` is null or undefined, skip modulation (backward-compatible)
- The displacement is in normalised space (-1 to 1 per axis)
- Colour is preserved from the original points
- The sampler is called once per point at its normalised position along the line

---

## Task G + H — Implement `connectDots` Render Node

### Agent: render-node-agent

Implement after Task D + F (needs the modulated points from PointsOnALine and any point arrays).

**Step G1 — Add `connectDots` to schema in `schema.json`**

In the `renderNode` `oneOf` array, append:

```json
{
  "title": "Connect Dots Node",
  "type": "object",
  "description": "Draws lines connecting consecutive coloured points in sequence. Each line segment inherits the colour of the second point.",
  "additionalProperties": false,
  "required": ["id", "type", "params"],
  "x-input-points": ["points"],
  "properties": {
    "id": { "title": "ID", "type": "string" },
    "type": { "title": "Type", "type": "string", "enum": ["connect-dots"] },
    "params": {
      "title": "Params",
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "points": {
          "description": "Array of coloured points to connect",
          "$ref": "refable-value-kinds.schema.json#/definitions/colorPointArrayRef"
        },
        "lineWidth": {
          "description": "Width of each line segment in normalised space",
          "oneOf": [
            {
              "type": "object",
              "additionalProperties": false,
              "required": ["v"],
              "properties": {
                "v": { "type": "number", "minimum": 0 }
              }
            },
            { "$ref": "#/definitions/refParam" }
          ]
        }
      }
    }
  }
}
```

**Step G2 — Implement `ConnectDotsNode.tsx`**

Create `src/nodes/render/nodes/ConnectDotsNode.tsx`:

```ts
import { defineRenderNode } from '../types';

export const connectDotsNodeDef = defineRenderNode('connect-dots', {
  defaults: {
    points: { v: [] },
    lineWidth: { v: 0.01 }
  },
  render(node, context) {
    const points = node.params.points;
    const lineWidth = node.params.lineWidth;
    
    if (!points || points.length < 2) {
      return; // Nothing to draw
    }
    
    const ctx = context.canvas.getContext('2d');
    
    // Draw line segments between consecutive points
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      
      // Convert normalised coordinates to canvas pixels
      const canvasP1 = normaliseToCanvas(p1, context.canvas);
      const canvasP2 = normaliseToCanvas(p2, context.canvas);
      
      // Set stroke colour from p2 (the second point in the segment)
      ctx.strokeStyle = `rgba(${p2.r * 255}, ${p2.g * 255}, ${p2.b * 255}, ${p2.a})`;
      ctx.lineWidth = lineWidth * context.canvas.width; // Scale line width to canvas
      
      // Draw the line
      ctx.beginPath();
      ctx.moveTo(canvasP1.x, canvasP1.y);
      ctx.lineTo(canvasP2.x, canvasP2.y);
      ctx.stroke();
    }
  }
});

// Helper: Convert normalised (-1 to 1) to canvas pixels
function normaliseToCanvas(point: { x: number; y: number }, canvas: HTMLCanvasElement) {
  return {
    x: ((point.x + 1) / 2) * canvas.width,
    y: ((1 - (point.y + 1) / 2)) * canvas.height
  };
}
```

**Notes for render-node-agent:**
- The `lineWidth` param should default to a small value (0.01 normalised space)
- Each line segment's colour comes from the second point in the pair
- Handle edge cases: empty array, single point (draw nothing)
- Use the canvas context from `context.canvas.getContext('2d')`
- Normalised space is -1 to 1 per axis; convert to canvas pixels using the canvas dimensions

**Step H1 — Register in render registry**

In `src/nodes/render/registry.ts`, import `connectDotsNodeDef` and add it to the registry map:

```ts
['connect-dots', connectDotsNodeDef as RenderNodeDef]
```

---

## Task I — Test Graph and Verification

### Agent: (testing or orchestrator)

After all nodes are implemented, create a test graph to verify the sampler flow:

1. **Graph structure:**
   ```
   time node
     ↓
   wave node (capture both `value` and `sampler` outputs)
     ↓ (sampler)
   pointsOnALine (modulateBy = sampler, startPoint, endPoint, count)
     ↓
   connectDots (points input)
   ```

2. **Create test file:** `project/feedback/sampler-test-graph.json`
   - Wire a time node to the wave node
   - Connect the wave's `sampler` output to PointsOnALine's `modulateBy` param
   - Connect PointsOnALine's output to connectDots' points input
   - Verify the graph loads without errors

3. **Visual verification:**
   - Run the test graph in the app
   - Expect to see a smooth sine wave shape drawn across the canvas
   - The wave should animate (scroll/oscillate) over time as the time node increments

4. **Test checks:**
   - No TypeScript errors
   - No runtime serialisation errors (the refOnly constraint should be checked on save)
   - The wave renders without artifacts or gaps
   - Colour and line width are configurable and take effect

---

## Notes for All Agents

- The `samplerValue` type is runtime-only; it cannot exist as a static JSON value. The serialiser must reject attempts to save a graph with a static sampler.
- The sampler's `sample(t)` function takes a normalised position (0–1), not a time value. This allows spatial evaluation independent of animation.
- Modulation in PointsOnALine displaces points perpendicular to the line, not along it.
- The connectDots render node should not assume any particular point ordering — it simply connects them in array order.
- Run `bun run test:headless --run` after completing each task to verify no regressions.

---

## Dependencies and Sequencing

1. **Schema first** (A + B + E): All other tasks depend on the schema definitions
2. **Regenerate** (C): Required before any TypeScript can reference the new types
3. **Wave sampler** (D) and **PointsOnALine schema** (E) are independent but both required before D can run
4. **Modulation** (F) and **connectDots** (G + H) can run after (D) completes
5. **Test** (I) runs last, verifying all pieces work together
