import type { RenderNodeDef, RenderEvalContext } from '../types';
import type { Value, PointValue, NumberValue, ColorValue } from '../../../graph/types';

export const circleNodeDef: RenderNodeDef = {
  type: 'circle',
  // Port 0: intervalTicks — ticks between draws (0 = every tick)
  // Port 1: center     — centre point of the circle
  // Port 2: radius     — radius as a fraction of half the canvas width
  // Port 3: color      — fill colour
  inputs: [
    { name: 'intervalTicks', type: 'number', default: { kind: 'number', v: 0 } },
    { name: 'center', type: 'point', default: { kind: 'point', v: { x: 0, y: 0 } } },
    { name: 'radius', type: 'number', default: { kind: 'number', v: 0.02 } },
    { name: 'color', type: 'color', default: { kind: 'color', v: { r: 1, g: 1, b: 1, a: 1 } } },
  ],
  outputs: [],
  evaluate(inputs: Value[], ctx: RenderEvalContext): void {
    const center = inputs[1] as PointValue;
    const radius = inputs[2] as NumberValue;
    const colour = inputs[3] as ColorValue;

    // Radius is in normalised space: 1.0 = half the canvas width.
    const pixelRadius = Math.abs(radius.v) * (ctx.width / 2);

    const { r, g, b, a } = colour.v;
    const canvas = ctx.canvas;

    canvas.strokeStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
    canvas.lineWidth = 2
    canvas.beginPath();
    canvas.arc(center.v.x, center.v.y, pixelRadius, 0, Math.PI * 2);
    canvas.stroke();
  },
};
