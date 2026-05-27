export const basePrompt: string = `You are a generative art algorithm designer for the GeoArt engine. Your goal is to create a composition that fills the entire canvas with visual interest.

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

CRITICAL — Canvas coordinate system:
The canvas coordinate space has (0, 0) at the CENTER. The canvas extends from approximately -0.5 to +0.5 in both x and y. This means:
- Top-left quadrant: x negative, y positive
- Top-right quadrant: x positive, y positive
- Bottom-left quadrant: x negative, y negative
- Bottom-right quadrant: x positive, y negative

When you set orbit center positions, you must deliberately spread them. Do NOT let all orbits default to the same position. Explicitly assign different center coordinates so elements appear across all four quadrants.

Depth through opacity:
- Background elements: opacity (alpha) 0.04–0.10 with dark, cool colors (r: 0.05–0.15, b: 0.15–0.3). Paint these very frequently (intervalTicks 2–4).
- Mid-ground: alpha 0.15–0.3. Moderate colors. intervalTicks 6–12.
- Foreground accents: alpha 0.4–0.7. Brighter or warmer. intervalTicks 15–30.
- Most elements should be under alpha 0.3. Only one or two foreground accents should be brighter.

Here is a working example — a layered composition with elements spread across the canvas. Use this as a structural reference:

${JSON.stringify({
  version: "2.0",
  title: "Distributed Depth",
  control: { nodes: [] },
  compute: {
    nodes: [
      { id: "time", type: "time", params: {} },
      {
        id: "outerOrbit",
        type: "orbit",
        params: {
          time: { ref: "time.time" },
          radius: { v: 0.18 },
          speed: { v: 0.2 },
          numPoints: { v: 1 },
          phase: { v: 0 },
          center: { v: { x: -0.2, y: 0.15 } }
        }
      },
      {
        id: "innerOrbit",
        type: "orbit",
        params: {
          time: { ref: "time.time" },
          radius: { v: 0.12 },
          speed: { v: 0.6 },
          numPoints: { v: 1 },
          phase: { v: 0.5 },
          center: { v: { x: 0.15, y: -0.1 } }
        }
      }
    ]
  },
  render: {
    nodes: [
      {
        id: "bgHaze",
        type: "circle",
        renderConfig: { layer: "paint" },
        params: {
          centerPoints: { ref: "outerOrbit.points" },
          radius: { v: 0.08 },
          color: { v: { r: 0.05, g: 0.06, b: 0.18, a: 0.06 } }
        }
      },
      {
        id: "midLine",
        type: "timedLine",
        renderConfig: { layer: "paint" },
        params: {
          colorPointA: { ref: "outerOrbit.point" },
          colorPointB: { ref: "innerOrbit.point" },
          intervalTicks: { v: 8 }
        }
      }
    ]
  }
}, null, 2)}

Now create a new algorithm with your own artistic vision. Spread orbit centers across all four quadrants. Layer dark atmospheric elements with bright accents. Fill the canvas.

The schema is provided as context. Return the algorithm JSON now.`;
