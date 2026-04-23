import type { NodeDef } from '../types';
import type { NumberValue } from '../../../graph/types';

export const multiplierNodeDef: NodeDef = {
  type: 'multiplier',
  isTimeDependant: false,
  inputs: [
    { name: 'a', type: 'number', default: { kind: 'number', v: 1.0 } },
    { name: 'b', type: 'number', default: { kind: 'number', v: 1.0 } },
  ],
  outputs: [
    { name: 'product', type: 'number' },
  ],
  evaluate(inputs) {
    const a = (inputs[0] as NumberValue).v;
    const b = (inputs[1] as NumberValue).v;
    return [{ kind: 'number', v: a * b }];
  },
};
