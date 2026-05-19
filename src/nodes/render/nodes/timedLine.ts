import { toSolidColorPoint } from '../../../domain-helpers/colorPoint';
import { implementRenderNode } from '../implementRenderNode';

const timedLineNodeDef = implementRenderNode('timedLine', {
  defaults: {
    intervalTicks: 6,
    colorPointA: {
      x: -0.5, y: 0, r: 1, g: 1, b: 1, a: 1, dx: 0,
      dy: 0,
    },
    colorPointB: {
      x: 0.5, y: 0, r: 1, g: 1, b: 1, a: 1, dx: 0,
      dy: 0,
    },
  },
  evaluate: (inputs, ctx) => {


    const a = toSolidColorPoint(inputs.colorPointA);
    const b = toSolidColorPoint(inputs.colorPointB);
    const canvas = ctx.canvas;

    const aPixelX = a.x * (ctx.width / 2) + (ctx.width / 2);
    const aPixelY = (ctx.height / 2) - a.y * (ctx.height / 2);
    const bPixelX = b.x * (ctx.width / 2) + (ctx.width / 2);
    const bPixelY = (ctx.height / 2) - b.y * (ctx.height / 2);

    const gradient = canvas.createLinearGradient(aPixelX, aPixelY, bPixelX, bPixelY);
    gradient.addColorStop(0, `rgba(${a.r * 255}, ${a.g * 255}, ${a.b * 255}, ${a.a})`);
    gradient.addColorStop(1, `rgba(${b.r * 255}, ${b.g * 255}, ${b.b * 255}, ${b.a})`);

    canvas.strokeStyle = gradient;
    canvas.lineWidth = 1;
    canvas.beginPath();
    canvas.moveTo(aPixelX, aPixelY);
    canvas.lineTo(bPixelX, bPixelY);
    canvas.stroke();
  },
});

export default timedLineNodeDef;
