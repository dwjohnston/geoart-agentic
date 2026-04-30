import { defineRenderNode } from '../defineRenderNode';

export const timedLineArrayNodeDef = defineRenderNode('timedLineArray', {
  defaults: {
    intervalTicks: { v: 6 },
    colorPointsA: { v: [] },
    colorPointsB: { v: [] },
  },
  evaluate: (inputs, ctx) => {
    const arrayA = inputs.colorPointsA.v;
    const arrayB = inputs.colorPointsB.v;
    const count = Math.min(arrayA.length, arrayB.length);

    const canvas = ctx.canvas;
    canvas.lineWidth = 1;

    for (let i = 0; i < count; i++) {
      const a = arrayA[i];
      const b = arrayB[i];

      const gradient = canvas.createLinearGradient(a.x, a.y, b.x, b.y);
      gradient.addColorStop(0, `rgba(${a.r * 255}, ${a.g * 255}, ${a.b * 255}, ${a.a})`);
      gradient.addColorStop(1, `rgba(${b.r * 255}, ${b.g * 255}, ${b.b * 255}, ${b.a})`);

      canvas.strokeStyle = gradient;
      canvas.beginPath();
      canvas.moveTo(a.x, a.y);
      canvas.lineTo(b.x, b.y);
      canvas.stroke();
    }
  },
});
