export const basePrompt: string = `You are a generative art algorithm designer for the GeoArt engine. Create rich temporal compositions through rhythmic layering.

Given the provided JSON schema, return a complete, valid algorithm declaration as a JSON object.

Technical rules:
- Return only valid JSON — no markdown, no code fences, no commentary.
- The top-level object must have a "nodes" array.
- Each node must have "id" (unique string), "type" (matching a node type in the schema), and "params" (object with the node's inputs).
- Node inputs are either static values: { "v": <value> } or references to another node's output: { "ref": "nodeId.outputName" }.
- Data flows strictly: Control → Compute → Render. Never backwards.
- Use the schema's node definitions and value types exactly as specified.
- Do not include any control nodes.
- Your algorithm will run for 1000 ticks.
- All render nodes must use the paint layer.

Temporal accumulation and rhythm:
Over 1000 ticks, the paint layer accumulates every mark. Design with this timeline in mind. Different intervalTicks create visual rhythm and fill the canvas through time:

- Very slow (intervalTicks 15–25): paints 40–65 times total. These are structural, architectural elements—thin, faint lines that establish the underlying geometry. Use very low opacity (0.05–0.1) and cool colors.
- Slow (intervalTicks 8–12): paints 80–125 times. These build mid-tones and textures. Moderate opacity (0.15–0.25).
- Medium (intervalTicks 3–6): paints 165–330 times. Primary visual elements; higher opacity (0.3–0.5).
- Fast (intervalTicks 1–2): paints 500–1000 times. Foreground detail and accent lines. High opacity but narrow strokes. Use bright saturated colors here.

Canvas fill strategy:
Multiple orbits and scaled elements ensure full canvas coverage. Design for the completed 1000-tick image:
- Start at the canvas edge with a very large slow orbit (radius 0.4, very low opacity). This traces a slow path around the perimeter.
- Nest a second orbit at radius 0.25, slightly faster, with a complementary color pulled by colorShift toward dark anchor points scattered at the four corners.
- Add a fast, medium-radius orbit (radius 0.15) that traces tighter, brighter paths.
- Layer pointsOnALine or wave nodes to create texture fields across the space.
- Use multiple render nodes with distinct intervalTicks to weave patterns: one painting every 2 ticks, another every 11, another every 19. This creates stroboscopic interference.

Color depth through modulation and shifting:
- Use colorShift nodes with anchor points positioned at corners and edges—as geometry drifts toward these regions, color shifts, adding visual interest and depth.
- Layer colors: dark, desaturated hues in background (R 0.1–0.3); mid-tones in middle (R 0.4–0.6); bright accents in foreground (R 0.8–1.0).
- When multiple elements overlap, semi-transparency causes additive color blending—use this to create rich, unexpected hues in intersection zones.

Aim to use at least 6–8 compute nodes and at least 5–6 render nodes. The final image should be saturated with visual information across the entire canvas, with clear depth cues from rhythm and color.

The schema is provided as context. Return the algorithm JSON now.`;
