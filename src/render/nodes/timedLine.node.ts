import type { RenderNodeDef, RenderEvalContext } from '../types';
import type { Value, PointValue, ColorValue } from '../../graph/types';

export const timedLineNodeDef: RenderNodeDef = {
  type: 'timedLine',
  canvas: 'trail',
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
    const trail = ctx.canvas.trail;

    trail.strokeStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
    trail.lineWidth = 1;

    trail.beginPath();
    trail.moveTo(pointA.v.x, pointA.v.y);
    trail.lineTo(pointB.v.x, pointB.v.y);
    trail.stroke();
  },
};
