import { describe, expect, test } from 'bun:test';
import type { ColorSampler, Sampler } from '../../../schema/typeHelpers';
import colorSamplerNodeImplementation from './colorSampler';

function constantSampler(value: number): Sampler {
  return {
    sample: () => value,
    sampleMany: (ts) => ts.map(() => value),
  };
}

function identitySampler(): Sampler {
  return {
    sample: (t) => t,
    sampleMany: (ts) => ts.map((t) => t),
  };
}

describe('colorSamplerNodeImplementation', () => {
  test('assembles constant channel samplers into a ColorSampler — red at t=1', () => {
    const result = colorSamplerNodeImplementation.evaluate({
      sampleR: constantSampler(1.0),
      sampleG: constantSampler(0.0),
      sampleB: constantSampler(0.0),
      sampleA: constantSampler(1.0),
      mode: 'clobber',
    });
    expect((result.colorSampler as ColorSampler).sample(1)).toEqual({ r: 1.0, g: 0.0, b: 0.0, a: 1.0 });
  });

  test('identity sampleR returns t=0 as r', () => {
    const result = colorSamplerNodeImplementation.evaluate({
      sampleR: identitySampler(),
      sampleG: constantSampler(0.0),
      sampleB: constantSampler(0.0),
      sampleA: constantSampler(1.0),
      mode: 'clobber',
    });
    expect((result.colorSampler as ColorSampler).sample(0)).toEqual({ r: 0.0, g: 0.0, b: 0.0, a: 1.0 });
  });

  test('identity sampleR returns t=1 as r', () => {
    const result = colorSamplerNodeImplementation.evaluate({
      sampleR: identitySampler(),
      sampleG: constantSampler(0.0),
      sampleB: constantSampler(0.0),
      sampleA: constantSampler(1.0),
      mode: 'clobber',
    });
    expect((result.colorSampler as ColorSampler).sample(1)).toEqual({ r: 1.0, g: 0.0, b: 0.0, a: 1.0 });
  });
});
