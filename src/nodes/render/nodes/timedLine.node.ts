import { defineRenderNode } from '../defineRenderNode';

export const timedLineNodeDef = defineRenderNode('timedLine', {
  defaults: {
    intervalTicks: { v: 6 },
    colorPointA: { v: { x: -0.5, y: 0, r: 1, g: 1, b: 1, a: 1 } },
    colorPointB: { v: { x:  0.5, y: 0, r: 1, g: 1, b: 1, a: 1 } },
  },
  evaluate: (inputs, ctx) => {
    const { v: a } = inputs.colorPointA;
    const { v: b } = inputs.colorPointB;
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
