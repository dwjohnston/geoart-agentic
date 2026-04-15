import type { RenderNodeDef, RenderEvalContext } from '../types';
import type { Value, PointValue, ColorValue } from '../../graph/types';

export const timedLineNodeDef: RenderNodeDef = {
  type: 'timedLine',
  // Port 0: intervalMs — firing rate in ms
  // Port 1: pointA     — start point
  // Port 2: pointB     — end point
  // Port 3: color      — line colour
  inputs: [
    { name: 'intervalMs', type: 'number', default: { kind: 'number', v: 100 } },
    { name: 'pointA',     type: 'point',  default: { kind: 'point',  v: { x: -0.5, y: 0 } } },
    { name: 'pointB',     type: 'point',  default: { kind: 'point',  v: { x:  0.5, y: 0 } } },
    { name: 'color',      type: 'color',  default: { kind: 'color',  v: { r: 1, g: 1, b: 1, a: 1 } } },
  ],
  outputs: [],
  evaluate(inputs: Value[], ctx: RenderEvalContext): void {
    const pointA = inputs[1] as PointValue;
    const pointB = inputs[2] as PointValue;
    const colour = inputs[3] as ColorValue;

    const { r, g, b, a } = colour.v;
    const canvas = ctx.canvas;

    canvas.strokeStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
    canvas.lineWidth = 1;

    canvas.beginPath();
    canvas.moveTo(pointA.v.x, pointA.v.y);
    canvas.lineTo(pointB.v.x, pointB.v.y);
    canvas.stroke();
  },
};
