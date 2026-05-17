import { toSolidColorPoint } from '../../../domain-helpers/colorPoint';
import { implementRenderNode } from '../implementRenderNode';

const polygonNodeDef = implementRenderNode('polygon', {
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
    const firstPixelX = firstPoint.x * (ctx.width / 2) + (ctx.width / 2);
    const firstPixelY = (ctx.height / 2) - firstPoint.y * (ctx.height / 2);
    canvas.moveTo(firstPixelX, firstPixelY);

    // Draw lines to each subsequent point
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const pixelX = point.x * (ctx.width / 2) + (ctx.width / 2);
      const pixelY = (ctx.height / 2) - point.y * (ctx.height / 2);
      canvas.lineTo(pixelX, pixelY);
    }

    // Close the path to complete the polygon
    canvas.closePath();

    // Fill with the colour of the first point
    const { r, g, b, a } = toSolidColorPoint(firstPoint);
    canvas.fillStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
    canvas.fill();
  },
});

export default polygonNodeDef;
