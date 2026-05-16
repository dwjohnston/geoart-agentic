import { implementRenderNode } from '../implementRenderNode';

function drawLine(
  canvas: CanvasRenderingContext2D,
  a: { x: number; y: number; r: number; g: number; b: number; a: number },
  b: { x: number; y: number; r: number; g: number; b: number; a: number },
  width: number,
  height: number,
) {
  const aPixelX = a.x * (width / 2) + (width / 2);
  const aPixelY = (height / 2) - a.y * (height / 2);
  const bPixelX = b.x * (width / 2) + (width / 2);
  const bPixelY = (height / 2) - b.y * (height / 2);

  const gradient = canvas.createLinearGradient(aPixelX, aPixelY, bPixelX, bPixelY);
  gradient.addColorStop(0, `rgba(${a.r * 255}, ${a.g * 255}, ${a.b * 255}, ${a.a})`);
  gradient.addColorStop(1, `rgba(${b.r * 255}, ${b.g * 255}, ${b.b * 255}, ${b.a})`);

  canvas.strokeStyle = gradient;
  canvas.beginPath();
  canvas.moveTo(aPixelX, aPixelY);
  canvas.lineTo(bPixelX, bPixelY);
  canvas.stroke();
}

export const timedLineArrayNodeDef = implementRenderNode('timedLineArray', {
  defaults: {
    intervalTicks: 6,
    colorPointsA: [],
    colorPointsB: [],
    mode: 'all-to-all',
  },
  evaluate: (inputs, ctx) => {
    const arrayA = inputs.colorPointsA;
    const arrayB = inputs.colorPointsB;
    const mode = inputs.mode ?? 'all-to-all';

    const canvas = ctx.canvas;
    canvas.lineWidth = 1;

    if (arrayB.length === 0) return;

    if (mode === 'distribute') {
      for (let i = 0; i < arrayA.length; i++) {
        const bIndex = Math.floor(i * arrayB.length / arrayA.length);
        drawLine(canvas, arrayA[i], arrayB[bIndex], ctx.width, ctx.height);
      }
    } else if (mode === 'interleave') {
      for (let i = 0; i < arrayA.length; i++) {
        const bIndex = i % arrayB.length;
        drawLine(canvas, arrayA[i], arrayB[bIndex], ctx.width, ctx.height);
      }
    } else {
      // all-to-all (default)
      for (let i = 0; i < arrayA.length; i++) {
        for (let j = 0; j < arrayB.length; j++) {
          drawLine(canvas, arrayA[i], arrayB[j], ctx.width, ctx.height);
        }
      }
    }
  },
});
