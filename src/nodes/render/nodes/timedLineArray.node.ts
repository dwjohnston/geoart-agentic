import type { RenderNodeDef, RenderEvalContext } from '../types';
import type { Value, ColorPointArrayValue } from '../../../graph/types';

export const timedLineArrayNodeDef: RenderNodeDef = {
  type: 'timedLineArray',
  // Port 0: intervalMs      — firing rate in ms
  // Port 1: colorPointsA    — array of start points
  // Port 2: colorPointsB    — array of end points
  // For each index i, draws a gradient line from colorPointsA[i] to colorPointsB[i].
  // Stops when the shorter array is exhausted.
  inputs: [
    { name: 'intervalMs',   type: 'number',          default: { kind: 'number', v: 100 } },
    { name: 'colorPointsA', type: 'colorPointArray',  default: { kind: 'colorPointArray', v: [] } },
    { name: 'colorPointsB', type: 'colorPointArray',  default: { kind: 'colorPointArray', v: [] } },
  ],
  outputs: [],
  evaluate(inputs: Value[], ctx: RenderEvalContext): void {
    const arrayA = (inputs[1] as ColorPointArrayValue).v;
    const arrayB = (inputs[2] as ColorPointArrayValue).v;
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
};
