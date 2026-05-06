import { implementRenderNode } from '../implementRenderNode';

export const polygonNodeDef = implementRenderNode('polygon', {
  defaults: {
    points: [],
  },
  evaluate: (inputs, ctx) => {
    const points = inputs.points;

    if (points.length < 3) {
      return; // Need at least 3 points to form a polygon
    }

    const canvas = ctx.canvas;

    // Begin the polygon path
    canvas.beginPath();

    // Move to the first point
    const firstPoint = points[0];
    canvas.moveTo(firstPoint.x, firstPoint.y);

    // Draw lines to each subsequent point
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      canvas.lineTo(point.x, point.y);
    }

    // Close the path to complete the polygon
    canvas.closePath();

    // Fill with the colour of the first point
    const { r, g, b, a } = firstPoint;
    canvas.fillStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
    canvas.fill();
  },
});
