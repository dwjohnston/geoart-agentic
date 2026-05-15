import { implementRenderNode } from '../implementRenderNode';

export const timedLineArrayNodeDef = implementRenderNode('timedLineArray', {
  defaults: {
    intervalTicks: 6,
    colorPointsA: [],
    colorPointsB: [],
  },
  evaluate: (inputs, ctx) => {
    const arrayA = inputs.colorPointsA;
    const arrayB = inputs.colorPointsB;

    const canvas = ctx.canvas;
    canvas.lineWidth = 1;

    for (let i = 0; i < arrayA.length; i++) {

      for (let j = 0; j < arrayB.length; j++) {
        const a = arrayA[i];
        const b = arrayB[j];

        const aPixelX = a.x * (ctx.width / 2) + (ctx.width / 2);
        const aPixelY = (ctx.height / 2) - a.y * (ctx.height / 2);
        const bPixelX = b.x * (ctx.width / 2) + (ctx.width / 2);
        const bPixelY = (ctx.height / 2) - b.y * (ctx.height / 2);

        const gradient = canvas.createLinearGradient(aPixelX, aPixelY, bPixelX, bPixelY);
        gradient.addColorStop(0, `rgba(${a.r * 255}, ${a.g * 255}, ${a.b * 255}, ${a.a})`);
        gradient.addColorStop(1, `rgba(${b.r * 255}, ${b.g * 255}, ${b.b * 255}, ${b.a})`);

        canvas.strokeStyle = gradient;
        canvas.beginPath();
        canvas.moveTo(aPixelX, aPixelY);
        canvas.lineTo(bPixelX, bPixelY);
        canvas.stroke();
      }
    }
  },
});
