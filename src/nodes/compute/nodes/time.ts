import type { LegacyComputeNodeImplementation } from '../../../graphEngine/externalInterfaces/ComputeNodeImplementation';

const timeNodeImplementation: LegacyComputeNodeImplementation = {
  type: 'time',
  isTimeDependant: true,
  inputs: [],
  outputs: [
    // Exception to the -1..1 rule: tick count is unbounded.
    { name: 'time', type: 'number' },
  ],
  evaluate(_inputs, ctx) {
    return [{ kind: 'number', v: ctx.tickCount }];
  },
};

export default timeNodeImplementation;
