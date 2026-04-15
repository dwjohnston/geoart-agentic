import type { NodeDef } from '../types';
import type { NumberValue } from '../../graph/types';
import { evaluateOrbit } from './orbit';

export const orbitNodeDef: NodeDef = {
  type: 'orbit',
  isTimeDependant: true,
  inputs: [
    { name: 'time',   type: 'number' },
    { name: 'radius', type: 'number', default: { kind: 'number', v: 0.5 } },
    { name: 'speed',  type: 'number', default: { kind: 'number', v: 1.0 } },
  ],
  outputs: [
    { name: 'point', type: 'point' },
  ],
  evaluate(inputs) {
    const t      = (inputs[0] as NumberValue).v;
    const radius = (inputs[1] as NumberValue).v;
    const speed  = (inputs[2] as NumberValue).v;
    const { x, y } = evaluateOrbit(radius, speed, t);
    return [{ kind: 'point', v: { x, y } }];
  },
};
