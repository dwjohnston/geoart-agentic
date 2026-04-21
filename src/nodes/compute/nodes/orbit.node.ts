import type { NodeDef } from '../types';
import type { NumberValue, PointValue } from '../../graph/types';
import { evaluateOrbit } from './orbit';

// Orbit node ports:  0=time, 1=radius, 2=speed, 3=center  →  output 0=point
export const orbitNodeDef: NodeDef = {
  type: 'orbit',
  isTimeDependant: true,
  inputs: [
    { name: 'time',   type: 'number' },
    { name: 'radius', type: 'number', default: { kind: 'number', v: 0.5 } },
    { name: 'speed',  type: 'number', default: { kind: 'number', v: 1.0 } },
    { name: 'center', type: 'point',  default: { kind: 'point',  v: { x: 0, y: 0 } } },
  ],
  outputs: [
    { name: 'point', type: 'point' },
  ],
  evaluate(inputs) {
    const t      = (inputs[0] as NumberValue).v;
    const radius = (inputs[1] as NumberValue).v;
    const speed  = (inputs[2] as NumberValue).v;
    const center = (inputs[3] as PointValue).v;
    const { x, y } = evaluateOrbit(radius, speed, t, center.x, center.y);
    return [{ kind: 'point', v: { x, y } }];
  },
};
