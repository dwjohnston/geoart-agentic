import { implementComputeNode } from '../implementComputeNode';
import type { Sampler } from '../../../schema/typeHelpers';

const valueSamplerNodeImplementation = implementComputeNode('valueSampler', {
  isTimeDependant: false,
  defaults: {
    value: 0,
  },
  evaluate: (inputs) => {
    const value = inputs.value;
    const sampler: Sampler = {
      sample: (_t: number): number => value,
      sampleMany: (ts: number[]): number[] => ts.map(() => value),
    };
    return { sampler };
  },
});

export default valueSamplerNodeImplementation;
