export const basePrompt: string = `You are a generative art algorithm designer for the GeoArt engine.

Given the provided JSON schema, return a complete, valid algorithm declaration as a JSON object.

Technical rules:
- Return only valid JSON — no markdown, no code fences, no commentary.
- The algorithm must have "version" ("2.0"), "title", "control" (nodes array), "compute" (nodes array), and "render" (nodes array) at the top level.
- Each node must have "id" (unique string), "type" (matching a node type in the schema), and "params" (object with the node's inputs).
- Node inputs are either static values: { "v": <value> } or references to another node's output: { "ref": "nodeId.outputName" }.
- Data flows strictly: Control → Compute → Render. Never backwards.
- Do not include any control nodes.
- Your algorithm will run for 1000 ticks.
- All render nodes must use the paint layer.

Study this complete working example carefully. It demonstrates the required patterns:

${JSON.stringify({
  version: "2.0",
  title: "Layered Depth Example",
  control: { nodes: [] },
  compute: {
    nodes: [
      { id: "time", type: "time", params: {} },
      {
        id: "slowWide",
        type: "orbit",
        params: {
          time: { ref: "time.time" },
          radius: { v: 0.35 },
          speed: { v: 0.08 },
          numPoints: { v: 3 },
          phase: { v: 0 },
          center: { v: { x: 0, y: 0 } }
        }
      },
      {
        id: "midLeft",
        type: "orbit",
        params: {
          time: { ref: "time.time" },
          radius: { v: 0.2 },
          speed: { v: 0.35 },
          numPoints: { v: 1 },
          phase: { v: 0.25 },
          center: { v: { x: -0.18, y: 0.12 } }
        }
      },
      {
        id: "fastRight",
        type: "orbit",
        params: {
          time: { ref: "time.time" },
          radius: { v: 0.1 },
          speed: { v: 1.2 },
          numPoints: { v: 1 },
          phase: { v: 0.7 },
          center: { v: { x: 0.2, y: -0.15 } }
        }
      }
    ]
  },
  render: {
    nodes: [
      {
        id: "voidLayer",
        type: "circle",
        renderConfig: { layer: "paint" },
        params: {
          centerPoints: { ref: "slowWide.points" },
          radius: { v: 0.06 },
          color: { v: { r: 0.04, g: 0.05, b: 0.14, a: 0.05 } }
        }
      },
      {
        id: "atmosphereLine",
        type: "timedLine",
        renderConfig: { layer: "paint" },
        params: {
          colorPointA: { ref: "slowWide.point" },
          colorPointB: { ref: "midLeft.point" },
          intervalTicks: { v: 6 }
        }
      },
      {
        id: "midCircle",
        type: "circle",
        renderConfig: { layer: "paint" },
        params: {
          centerPoints: { ref: "midLeft.points" },
          radius: { v: 0.025 },
          color: { v: { r: 0.1, g: 0.2, b: 0.45, a: 0.18 } }
        }
      },
      {
        id: "sparkAccent",
        type: "timedLine",
        renderConfig: { layer: "paint" },
        params: {
          colorPointA: { ref: "midLeft.point" },
          colorPointB: { ref: "fastRight.point" },
          intervalTicks: { v: 25 }
        }
      }
    ]
  }
}, null, 2)}

What this example demonstrates:
- Canvas center is (0,0). Orbit centers are spread: (0,0), (-0.18, 0.12), (0.2, -0.15) — covering different quadrants
- "voidLayer" uses alpha 0.05 and cold dark color — painted every tick effectively, creating atmospheric buildup
- "midCircle" uses alpha 0.18 with cool blue — a visible but not dominant element
- "sparkAccent" uses intervalTicks 25 — painted only 40 times total, so it remains a sharp accent
- Three orbit speeds (0.08, 0.35, 1.2) create temporal variety across the 1000 ticks

Now create an entirely new algorithm with different artistic content. You must:
1. Use at least 5 compute nodes and 4–5 render nodes
2. Place orbit centers in at least 3 different canvas regions (use x values from -0.3 to +0.3, y values from -0.3 to +0.3 — not all the same)
3. Have at least one render node with alpha ≤ 0.07 and intervalTicks ≤ 4 (dark atmospheric base)
4. Have at least one render node with alpha ≥ 0.5 and intervalTicks ≥ 20 (bright sparse accent)
5. Chain wave or multiply compute nodes into at least one orbit's radius or speed to create motion variation

The schema is provided as context. Return the algorithm JSON now.`;
