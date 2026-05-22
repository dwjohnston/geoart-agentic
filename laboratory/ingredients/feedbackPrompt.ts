export const feedbackPrompt: string = `The attached image shows the current output of the GeoArt algorithm.

Review the rendered result and return a refined algorithm JSON that improves the visual quality or interest of the art.

Consider:
- Adjusting frequencies, radii, or color values for better visual effect.
- Adding or removing nodes to increase complexity or clarity.
- Improving composition, motion, or colour harmony.

Return only valid JSON — no markdown, no code fences, no commentary. The response must be a complete, valid algorithm declaration with a "nodes" array.`;
