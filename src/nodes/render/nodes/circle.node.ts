import { defineRenderNode } from '../defineRenderNode';

export const circleNodeDef = defineRenderNode('circle', {
  defaults: {
    intervalTicks: 0,
    center: { x: 0, y: 0 },
    radius: 0.02,
    color: { r: 1, g: 1, b: 1, a: 1 },
    centerPoints: []
  },
  evaluate: (inputs, ctx) => {
    const pixelRadius = Math.abs(inputs.radius) * (ctx.width / 2);

    const deprecatedColorPoint = { ...inputs.color, ...inputs.center };

    const colorPointsToUse = inputs.centerPoints.length > 0 ? inputs.centerPoints : [deprecatedColorPoint];


    colorPointsToUse.forEach((v) => {
      const { r, g, b, a, x, y } = v;
      ctx.canvas.strokeStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
      ctx.canvas.lineWidth = 2;
      ctx.canvas.beginPath();
      ctx.canvas.arc(x, y, pixelRadius, 0, Math.PI * 2);
      ctx.canvas.stroke();
    })


  },
});
