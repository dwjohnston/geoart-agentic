import { defineRenderNode } from '../defineRenderNode';

export const lineThroughPointNodeDef = defineRenderNode('lineThroughPoint', {
  defaults: {
    intervalTicks: { v: 1 },
    points: { v: [] },
    degrees: { v: [0] },
    lineLength: { v: 0.5 },
  },
  evaluate: (inputs, ctx) => {
    const points = inputs.points.v;
    const degreeValues = inputs.degrees.v;
    // lineLength is in normalised space (-1 to 1); scale to canvas pixels.
    const halfLengthPx = Math.abs(inputs.lineLength.v) * (ctx.width / 2) / 2;

    const canvas = ctx.canvas;
    canvas.lineWidth = 1;

    for (const point of points) {
      const { x, y, r, g, b, a } = point;
      canvas.strokeStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;

      for (const deg of degreeValues) {
        // 0° is rightward (the point's dx/dy direction when ColorPoint carries it).
        // ColorPointValue does not carry dx/dy at runtime so all angles are absolute.
        const angle = (deg * Math.PI) / 180;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        canvas.beginPath();
        canvas.moveTo(x - cosA * halfLengthPx, y - sinA * halfLengthPx);
        canvas.lineTo(x + cosA * halfLengthPx, y + sinA * halfLengthPx);
        canvas.stroke();
      }
    }
  },
});
