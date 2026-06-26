import { implementComputeNode } from '../implementComputeNode';
import type { ColorSampler, Sampler } from '../../../schema/typeHelpers';

const colorSamplerNodeImplementation = implementComputeNode('colorSampler', {
  defaults: {
    sampleR: null,
    sampleG: null,
    sampleB: null,
    sampleA: null,
    mode: 'clobber',
  },
  evaluate: (inputs) => {
    const sampleR = inputs.sampleR as Sampler | null;
    const sampleG = inputs.sampleG as Sampler | null;
    const sampleB = inputs.sampleB as Sampler | null;
    const sampleA = inputs.sampleA as Sampler | null;
    // mode captured for future extensibility
    const _mode = inputs.mode;

    const colorSampler: ColorSampler = {
      sample(t: number) {
        return {
          r: sampleR?.sample(t) ?? 0,
          g: sampleG?.sample(t) ?? 0,
          b: sampleB?.sample(t) ?? 0,
          a: sampleA?.sample(t) ?? 1,
        };
      },
    };

    return { colorSampler };
  },
});

export default colorSamplerNodeImplementation;
