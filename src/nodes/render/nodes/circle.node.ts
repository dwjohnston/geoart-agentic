import { defineRenderNode } from '../defineRenderNode';

export const circleNodeDef = defineRenderNode('circle', {
  defaults: {
    intervalTicks: { v: 0 },
    center: { v: { x: 0, y: 0 } },
    radius: { v: 0.02 },
    color: { v: { r: 1, g: 1, b: 1, a: 1 } },
  },
  evaluate: (inputs, ctx) => {
    const pixelRadius = Math.abs(inputs.radius.v) * (ctx.width / 2);
    const { r, g, b, a } = inputs.color.v;

    ctx.canvas.strokeStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
    ctx.canvas.lineWidth = 2;
    ctx.canvas.beginPath();
    ctx.canvas.arc(inputs.center.v.x, inputs.center.v.y, pixelRadius, 0, Math.PI * 2);
    ctx.canvas.stroke();
  },
});
