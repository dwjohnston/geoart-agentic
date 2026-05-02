import { defineRenderNode } from '../defineRenderNode';

export const circleNodeDef = defineRenderNode('circle', {
  defaults: {
    intervalTicks: 0,
    center: { x: 0, y: 0 },
    radius: 0.02,
    color: { r: 1, g: 1, b: 1, a: 1 },
  },
  evaluate: (inputs, ctx) => {
    const pixelRadius = Math.abs(inputs.radius) * (ctx.width / 2);
    const { r, g, b, a } = inputs.color;

    ctx.canvas.strokeStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
    ctx.canvas.lineWidth = 2;
    ctx.canvas.beginPath();
    ctx.canvas.arc(inputs.center.x, inputs.center.y, pixelRadius, 0, Math.PI * 2);
    ctx.canvas.stroke();
  },
});
