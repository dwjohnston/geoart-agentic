import { defineRenderNode } from '../defineRenderNode';

export const timedLineNodeDef = defineRenderNode('timedLine', {
  defaults: {
    intervalTicks: 6,
    colorPointA: { x: -0.5, y: 0, r: 1, g: 1, b: 1, a: 1 },
    colorPointB: { x: 0.5, y: 0, r: 1, g: 1, b: 1, a: 1 },
  },
  evaluate: (inputs, ctx) => {
    const a = inputs.colorPointA;
    const b = inputs.colorPointB;
    const canvas = ctx.canvas;

    const gradient = canvas.createLinearGradient(a.x, a.y, b.x, b.y);
    gradient.addColorStop(0, `rgba(${a.r * 255}, ${a.g * 255}, ${a.b * 255}, ${a.a})`);
    gradient.addColorStop(1, `rgba(${b.r * 255}, ${b.g * 255}, ${b.b * 255}, ${b.a})`);

    canvas.strokeStyle = gradient;
    canvas.lineWidth = 1;
    canvas.beginPath();
    canvas.moveTo(a.x, a.y);
    canvas.lineTo(b.x, b.y);
    canvas.stroke();
  },
});
