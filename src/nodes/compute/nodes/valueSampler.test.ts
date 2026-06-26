import { describe, it, expect } from 'bun:test';
import valueSamplerNodeImplementation from './valueSampler';
import type { Sampler } from '../../../schema/typeHelpers';

describe('valueSampler node', () => {
  it('returns the constant value regardless of t', () => {
    const result = valueSamplerNodeImplementation.evaluate({ value: 0.5 }) as { sampler: Sampler };
    expect(result.sampler.sample(1)).toBe(0.5);
    expect(result.sampler.sample(2)).toBe(0.5);
  });

  it('sampleMany returns the constant value for every t', () => {
    const result = valueSamplerNodeImplementation.evaluate({ value: 0.5 }) as { sampler: Sampler };
    expect(result.sampler.sampleMany([1, 2, 3])).toEqual([0.5, 0.5, 0.5]);
  });

  it('works with value 0', () => {
    const result = valueSamplerNodeImplementation.evaluate({ value: 0 }) as { sampler: Sampler };
    expect(result.sampler.sample(0)).toBe(0);
    expect(result.sampler.sample(999)).toBe(0);
  });

  it('works with value 1', () => {
    const result = valueSamplerNodeImplementation.evaluate({ value: 1 }) as { sampler: Sampler };
    expect(result.sampler.sample(0)).toBe(1);
    expect(result.sampler.sample(0.5)).toBe(1);
  });
});
