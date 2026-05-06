import { implementRenderNode } from '../implementRenderNode';

export const linesThroughPointNodeDef = implementRenderNode('linesThroughPoint', {
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
      const { x, y, dx = 0, dy = 0, r, g, b, a } = point;
      // Skip if gradient is (0, 0)
      if (dx === 0 && dy === 0) {
        continue;
      }

      for (const degree of degrees) {
        // Calculate base angle from dx, dy
        const baseAngle = Math.atan2(dy, dx);

        // Convert degrees to radians and add to base angle
        const rotationRadians = (degree * Math.PI) / 180;
        const finalAngle = baseAngle + rotationRadians;

        // Calculate half-length for offset calculations
        const halfLength = lineLength / 2;

        // Calculate endpoints
        const cosAngle = Math.cos(finalAngle);
        const sinAngle = Math.sin(finalAngle);

        const startX = x - halfLength * cosAngle;
        const startY = y - halfLength * sinAngle;

        const endX = x + halfLength * cosAngle;
        const endY = y + halfLength * sinAngle;

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
