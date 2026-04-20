import type { RenderNodeDef, RenderEvalContext } from '../types';
import type { Value, ColorPointValue } from '../../graph/types';

export const timedLineNodeDef: RenderNodeDef = {
  type: 'timedLine',
  // Port 0: intervalMs   — firing rate in ms
  // Port 1: colorPointA  — start coloured point (position + colour)
  // Port 2: colorPointB  — end coloured point (position + colour)
  inputs: [
    { name: 'intervalMs',  type: 'number',     default: { kind: 'number',     v: 100 } },
    { name: 'colorPointA', type: 'colorPoint', default: { kind: 'colorPoint', v: { x: -0.5, y: 0, r: 1, g: 1, b: 1, a: 1 } } },
    { name: 'colorPointB', type: 'colorPoint', default: { kind: 'colorPoint', v: { x:  0.5, y: 0, r: 1, g: 1, b: 1, a: 1 } } },
  ],
  outputs: [],
  evaluate(inputs: Value[], ctx: RenderEvalContext): void {
    const cpA = inputs[1] as ColorPointValue;
    const cpB = inputs[2] as ColorPointValue;
    const canvas = ctx.canvas;

    const gradient = canvas.createLinearGradient(cpA.v.x, cpA.v.y, cpB.v.x, cpB.v.y);
    gradient.addColorStop(0, `rgba(${cpA.v.r * 255}, ${cpA.v.g * 255}, ${cpA.v.b * 255}, ${cpA.v.a})`);
    gradient.addColorStop(1, `rgba(${cpB.v.r * 255}, ${cpB.v.g * 255}, ${cpB.v.b * 255}, ${cpB.v.a})`);

    canvas.strokeStyle = gradient;
    canvas.lineWidth = 1;

    canvas.beginPath();
    canvas.moveTo(cpA.v.x, cpA.v.y);
    canvas.lineTo(cpB.v.x, cpB.v.y);
    canvas.stroke();
  },
};
