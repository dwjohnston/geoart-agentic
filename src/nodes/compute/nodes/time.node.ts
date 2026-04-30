import type { NodeDef } from '../defineComputeNode';
import { evaluateTime } from './time';

export const timeNodeDef: NodeDef = {
  type: 'time',
  isTimeDependant: true,
  inputs: [],
  outputs: [
    // Exception to the -1..1 rule: tick count is unbounded.
    { name: 'time', type: 'number' },
  ],
  evaluate(_inputs, ctx) {
    return [{ kind: 'number', v: evaluateTime(ctx.tickCount) }];
  },
};
