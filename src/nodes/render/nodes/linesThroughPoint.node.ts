import { toSolidColorPoint } from '../../../domain-helpers/colorPoint';
import { implementRenderNode } from '../implementRenderNode';

const linesThroughPointNodeDef = implementRenderNode('linesThroughPoint', {
  defaults: {
    points: [],
    degrees: [0, 90],
    lineLength: 0.1,
  },
  evaluate: (inputs, ctx) => {
    const points = inputs.points;
    const degrees = inputs.degrees;
    const lineLength = inputs.lineLength;

    for (const point of points) {
      const { x, y, dx = 0, dy = 0, r, g, b, a } = toSolidColorPoint(point);
      // Skip if gradient is (0, 0)
      if (dx === 0 && dy === 0) {
        continue;
      }

      const pixelX = x * (ctx.width / 2) + (ctx.width / 2);
      const pixelY = (ctx.height / 2) - y * (ctx.height / 2);
      const pixelLength = lineLength * ctx.width;
      const halfLength = pixelLength / 2;

      for (const degree of degrees) {
        // Calculate base angle from dx, dy
        // Note: dy needs to be negated because canvas y-axis is inverted
        const baseAngle = Math.atan2(-dy, dx);

        // Convert degrees to radians and add to base angle
        const rotationRadians = (degree * Math.PI) / 180;
        const finalAngle = baseAngle + rotationRadians;

        // Calculate endpoints
        const cosAngle = Math.cos(finalAngle);
        const sinAngle = Math.sin(finalAngle);

        const startX = pixelX - halfLength * cosAngle;
        const startY = pixelY - halfLength * sinAngle;

        const endX = pixelX + halfLength * cosAngle;
        const endY = pixelY + halfLength * sinAngle;

        // Set stroke style and draw line
        ctx.canvas.strokeStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
        ctx.canvas.strokeStyle = 'rgba(255, 255, 255, 1)';
        ctx.canvas.lineWidth = 2;


        ctx.canvas.beginPath();
        ctx.canvas.moveTo(startX, startY);
        ctx.canvas.lineTo(endX, endY);
        ctx.canvas.stroke();



      }
    }

  },
});

export default linesThroughPointNodeDef;
