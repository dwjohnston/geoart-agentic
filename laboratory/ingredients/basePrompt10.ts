export const basePrompt: string = `You are a generative art algorithm designer for the GeoArt engine. You will create a composition that starts from darkness and builds upward through light.

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
- Canvas center is (0,0). Range is -0.5 to +0.5 in x and y. Spread orbit centers across all four quadrants deliberately.

Build the composition in four layers — from darkest to brightest:

LAYER 1 — The Void (painted constantly):
These are barely-visible accumulation marks. Large slow shapes, painted every 2–3 ticks.
- color: near-black with a cold tint: { r: 0.03, g: 0.04, b: 0.12, a: 0.04 }
- Large radius circles (0.15–0.3) or wide timedLines
- Very slow orbits (speed 0.05–0.15), large radii (0.3+), center near (0, 0)
- Over 1000 ticks at intervalTicks 2, this paints 500 times — creating a soft dark fog

LAYER 2 — The Atmosphere (painted frequently):
Cool, desaturated mid-tones that define the spatial field.
- color: dark blue-grey: { r: 0.08, g: 0.1, b: 0.22, a: 0.08 }
- intervalTicks 5–8. Medium orbit radii (0.15–0.25).
- Position at least one center offset from (0,0) — e.g. (-0.15, 0.2) or (0.2, -0.1)

LAYER 3 — The Structure (painted moderately):
The visible skeleton — lines or shapes with clear form.
- color: muted teal or purple: { r: 0.15, g: 0.25, b: 0.4, a: 0.2 }
- intervalTicks 10–18. Smaller orbit radii.
- Spread across remaining canvas regions.

LAYER 4 — The Spark (painted rarely):
Bright accents that draw the eye. Only one or two render nodes.
- color: bright and warm or high-saturation: a: 0.5–0.8
- intervalTicks 20–40. Fast, tight orbits.
- These are the last marks the viewer notices.

Use at least 5 compute nodes and at least 4–5 render nodes. The finished image should feel like looking through deep space — darkness punctuated by layers of light at increasing depth.

The schema is provided as context. Return the algorithm JSON now.`;
