# Sampler — Execution Tasks

## Overview

Implement the sampler feature to enable drawing wave shapes (like sine waves) across the canvas. Breaking down into four concrete implementation steps:

1. **samplerValue type** — schema definition for runtime-only function wrapper
2. **Wave node sampler output** — expose lazy evaluation function from wave node
3. **PointsOnALine modulateBy enhancement** — use sampler to displace points perpendicular to line
4. **connectDots render node** — draw lines connecting consecutive coloured points

**Excluded:** The `refOnly` flag serialisation constraint. We'll handle serialisation concerns separately.

---

## Task 1: samplerValue Type Definition

### Scope
Add the `samplerValue` type to the schema as a runtime-only value kind.

### Steps

**1a. Update `src/schema/schema/value-kinds.schema.json`**

In the `definitions` object, add:

```json
"samplerValue": {
  "title": "Sampler Value",
  "type": "object",
  "description": "Runtime-only function wrapper for lazy evaluation of a wave at arbitrary positions. Contains sample(t) and sampleMany(ts) functions. Cannot be statically defined in JSON.",
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

**Notes:**
- Do NOT include the `refOnly: true` flag (handling serialisation separately)
- This type will flow through the type system normally
- At runtime, the actual value is a JavaScript object with `sample(t)` and `sampleMany(ts)` functions

---

## Task 2: Wave Node Sampler Output

### Scope
Add a `sampler` output port to the wave node in the schema, then implement the runtime evaluation logic.

### Steps

**2a. Update schema: Add sampler output to wave node in `src/schema/schema/schema.json`**

Find the compute node with `"type": "wave"`. Update its `"x-outputs"` array to:

```json
"x-outputs": [
  { "name": "value", "valueType": "numberValue" },
  { "name": "sampler", "valueType": "samplerValue" }
]
```

(The `value` output already exists; add the `sampler` entry alongside it.)

**2b. Regenerate schema types**

Run the schema generation script (check `package.json` for the correct command, likely `bun run generate:schema-types`).

Verify:
- `src/schema/_generated/node-outputs-2.ts` includes a `"wave"` entry with both `"value"` and `"sampler"` outputs
- `src/schema/_generated/schema-types.d.ts` has updated `WaveNode` type with sampler output
- No TypeScript compilation errors

**2c. Implement sampler runtime in `src/nodes/compute/nodes/WaveNode.tsx`**

After the wave's scalar value is computed, create a sampler object that encapsulates the evaluation logic:

```ts
// Inside WaveNode compute function, after computing the scalar value
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

// Return both outputs
return {
  value: /* existing scalar output */,
  sampler: sampler
};
```

**Key points:**
- `t` is a normalised spatial position (0–1), not a time value
- `time` (from the node's params) is incorporated as a phase offset to animate the wave
- The sampler captures `frequency`, `amplitude`, `phase`, `waveShape`, and `time` in its closure
- The sampler is recalculated on every frame (as time changes)
- `sampleMany` is a convenience method for batch evaluation

**2d. Test**

Run `bun run test:headless --run` to verify no regressions.

---

## Task 3: PointsOnALine modulateBy Enhancement

### Scope
Add an optional `modulateBy` parameter to the PointsOnALine node that displaces each point perpendicular to the line using a sampler.

### Steps

**3a. Update schema: Add modulateBy param to PointsOnALine in `src/schema/schema/schema.json`**

Find the compute node with `"type": "pointsOnALine"`. In its `params.properties`, add:

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

**Notes:**
- `modulateBy` is optional (default: null, backward-compatible)
- Can be either null or a reference to a sampler output

**3b. Regenerate schema types**

Run the schema generation script again.

Verify:
- `src/schema/_generated/node-inputs-2.ts` includes a `"pointsOnALine"` entry with the new `"modulateBy"` param
- `src/schema/_generated/schema-types.d.ts` has updated `PointsOnALineNode` type
- No TypeScript compilation errors

**3c. Implement modulation logic in `src/nodes/compute/nodes/PointsOnALineNode.tsx`**

After generating the points array, check for `modulateBy` and displace points if present:

```ts
let modulated = points; // Start with original points

const modulateBy = node.params.modulateBy;
if (modulateBy) {
  modulated = points.map((point, i) => {
    // Normalised position along the line: 0 at start, 1 at end
    const t = points.length > 1 ? i / (points.length - 1) : 0;
    const displacement = modulateBy.sample(t);
    
    // Line vector (from start to end)
    const lineVector = { 
      x: endPoint.x - startPoint.x, 
      y: endPoint.y - startPoint.y 
    };
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

return modulated;
```

**Key points:**
- If `modulateBy` is null or undefined, skip modulation (backward-compatible)
- Each point is displaced perpendicular to the line (90° rotation of the line vector)
- The displacement amount comes from the sampler evaluated at that point's normalised position
- Colour and alpha are preserved from the original point

**3d. Test**

Run `bun run test:headless --run` to verify no regressions.

---

## Task 4: connectDots Render Node

### Scope
Implement a new render node that draws lines connecting consecutive coloured points in sequence.

### Steps

**4a. Add connectDots schema entry in `src/schema/schema/schema.json`**

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

**4b. Regenerate schema types**

Run the schema generation script again.

Verify:
- `src/schema/_generated/schema-types.d.ts` has new `ConnectDotsNode` type
- No TypeScript compilation errors

**4c. Create `src/nodes/render/nodes/ConnectDotsNode.tsx`**

```ts
import { defineRenderNode } from '../types';
import { ColorPoint } from '../../../schema/types';

export const connectDotsNodeDef = defineRenderNode('connect-dots', {
  defaults: {
    points: { v: [] },
    lineWidth: { v: 0.01 }
  },
  render(node, context) {
    const points: ColorPoint[] = node.params.points;
    const lineWidth: number = node.params.lineWidth;
    
    if (!points || points.length < 2) {
      return; // Nothing to draw
    }
    
    const ctx = context.canvas.getContext('2d');
    if (!ctx) return;
    
    const canvasWidth = context.canvas.width;
    const canvasHeight = context.canvas.height;
    
    // Helper: Convert normalised (-1 to 1) to canvas pixels
    const normaliseToCanvas = (point: { x: number; y: number }) => ({
      x: ((point.x + 1) / 2) * canvasWidth,
      y: ((1 - (point.y + 1) / 2)) * canvasHeight
    });
    
    // Draw line segments between consecutive points
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      
      // Convert normalised coordinates to canvas pixels
      const canvasP1 = normaliseToCanvas(p1);
      const canvasP2 = normaliseToCanvas(p2);
      
      // Set stroke colour from p2 (the second point in the segment)
      ctx.strokeStyle = `rgba(${p2.r * 255}, ${p2.g * 255}, ${p2.b * 255}, ${p2.a})`;
      ctx.lineWidth = lineWidth * canvasWidth; // Scale line width to canvas
      
      // Draw the line
      ctx.beginPath();
      ctx.moveTo(canvasP1.x, canvasP1.y);
      ctx.lineTo(canvasP2.x, canvasP2.y);
      ctx.stroke();
    }
  }
});
```

**Key points:**
- Draws lines between consecutive points in array order
- Each line segment's colour comes from the second point in the pair
- Handles edge cases: empty array, single point (draw nothing)
- Normalised space is -1 to 1 per axis; converts to canvas pixels
- `lineWidth` is scaled to canvas width for responsive rendering

**4d. Register in render registry**

In `src/nodes/render/registry.ts`:

1. Import the node definition:
   ```ts
   import { connectDotsNodeDef } from './nodes/ConnectDotsNode';
   ```

2. Add to the registry map:
   ```ts
   ['connect-dots', connectDotsNodeDef as RenderNodeDef]
   ```

**4e. Test**

Run `bun run test:headless --run` to verify no regressions.

---

## Task Sequencing

### Recommended Order

1. **Task 1** — samplerValue type definition
2. **Task 2a + 2b + 3a + 3b** — Schema updates and regeneration (can batch together)
3. **Task 2c + 3c** — Runtime implementation (can run in parallel)
4. **Task 4a + 4b** — connectDots schema and regeneration
5. **Task 4c + 4d** — connectDots implementation and registration
6. **Verification** — Run full test suite; create test graph to verify the complete flow

### Parallelisation

- Tasks 2c and 3c can run in parallel after schema regeneration
- Tasks 4a and 4b can run in parallel with Tasks 2c and 3c
- Task 4c + 4d depends on Task 4a + 4b

---

## Testing Strategy

After completing all tasks:

1. **No TypeScript errors** — Run `tsc --noEmit` to verify
2. **Test suite passes** — Run `bun run test:headless --run`
3. **Test graph** — Create a minimal test to verify the complete sampler flow:
   - Wire time node → wave node (capture sampler output)
   - Connect sampler output → PointsOnALine modulateBy param
   - Connect PointsOnALine output → connectDots render node
   - Expect a smooth, animating sine wave shape on canvas

---

## Notes

- Sampler functions are runtime-only and cannot be serialised to JSON. At the JSON boundary, a sampler must always come from a node output, never as a static value.
- The `sample(t)` function takes a normalised spatial position (0–1), not a time value. This enables spatial evaluation independent of animation.
- Modulation displaces points perpendicular to the line, not along it. Perpendicular displacement creates a wave shape that oscillates normal to the base line.
- The connectDots render node draws lines in array order and inherits colour from the second point in each pair. This is simple and predictable.
