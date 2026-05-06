import { defineRenderNode } from '../defineRenderNode';

export const lineThroughAPointNodeDef = defineRenderNode('lineThroughAPoint', {
  defaults: {
    points: [],
    degrees: [0],
    lineLength: 0.5,
  },
  evaluate: (inputs, ctx) => {
    const { points, degrees, lineLength } = inputs;
    if (points.length === 0 || degrees.length === 0) return;

    const halfLen = lineLength * ctx.width / 2;
    const canvas = ctx.canvas;
    canvas.lineWidth = 1;

    for (const point of points) {
      const { x, y, r, g, b, a } = point;
      canvas.strokeStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;

      for (const deg of degrees) {
        const rad = (deg * Math.PI) / 180;
        const dx = Math.cos(rad);
        const dy = Math.sin(rad);

        canvas.beginPath();
        canvas.moveTo(x - dx * halfLen, y - dy * halfLen);
        canvas.lineTo(x + dx * halfLen, y + dy * halfLen);
        canvas.stroke();
      }
    }
  },
});
