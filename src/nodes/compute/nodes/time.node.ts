import type { LegacyComputeNodeDef } from '../../../graphEngine/externalInterfaces/ComputeNodeDefinition';
import { evaluateTime } from './time';

export const timeNodeDef: LegacyComputeNodeDef = {
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
