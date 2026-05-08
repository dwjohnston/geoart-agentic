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

      const p1PixelX = p1.x * (ctx.width / 2) + (ctx.width / 2);
      const p1PixelY = (ctx.height / 2) - p1.y * (ctx.height / 2);
      const p2PixelX = p2.x * (ctx.width / 2) + (ctx.width / 2);
      const p2PixelY = (ctx.height / 2) - p2.y * (ctx.height / 2);

      // Set stroke colour from p2 (the second point in the segment)
      canvas.strokeStyle = `rgba(${p2.r * 255}, ${p2.g * 255}, ${p2.b * 255}, ${p2.a})`;

      // Draw the line
      canvas.beginPath();
      canvas.moveTo(p1PixelX, p1PixelY);
      canvas.lineTo(p2PixelX, p2PixelY);
      canvas.stroke();
    }
  },
});
