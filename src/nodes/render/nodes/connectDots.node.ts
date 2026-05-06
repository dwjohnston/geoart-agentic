import { implementRenderNode } from '../implementRenderNode';

export const connectDotsNodeDef = implementRenderNode('connect-dots', {
  defaults: {
    colorPointsArray: [],
    lineWidth: 1,
  },
  evaluate: (inputs, ctx) => {
    const points = inputs.colorPointsArray;
    const lineWidth = inputs.lineWidth;

    if (points.length < 2) {
      return; // Nothing to draw
    }

    const canvas = ctx.canvas;
    canvas.lineWidth = lineWidth;

    // Draw line segments between consecutive points
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      // Set stroke colour from p2 (the second point in the segment)
      canvas.strokeStyle = `rgba(${p2.r * 255}, ${p2.g * 255}, ${p2.b * 255}, ${p2.a})`;

      // Draw the line
      canvas.beginPath();
      canvas.moveTo(p1.x, p1.y);
      canvas.lineTo(p2.x, p2.y);
      canvas.stroke();
    }
  },
});
