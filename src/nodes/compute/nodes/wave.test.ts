import { describe, expect, test } from 'bun:test';
import { waveNodeDef } from './wave.node';
import type { NodeInputsResolved } from '../../../schema/typeHelpers';

const base = { time: 0, waveType: 'sine' as const, frequency: 1, amplitude: 1, phase: 0, samplerTemporalImpact: 0 } satisfies NodeInputsResolved<"wave">;

describe('waveNodeDef', () => {
  describe('sine', () => {
    test('zero at t=0', () => {
      expect(waveNodeDef.evaluate(base).value).toBeCloseTo(0);
    });
    test('peaks at +1 at t=15 (quarter cycle)', () => {
      expect(waveNodeDef.evaluate({ ...base, time: 15 }).value).toBeCloseTo(1);
    });
    test('zero at t=30 (half cycle)', () => {
      expect(waveNodeDef.evaluate({ ...base, time: 30 }).value).toBeCloseTo(0);
    });
    test('troughs at -1 at t=45 (three-quarter cycle)', () => {
      expect(waveNodeDef.evaluate({ ...base, time: 45 }).value).toBeCloseTo(-1);
    });
    test('amplitude scales output', () => {
      expect(waveNodeDef.evaluate({ ...base, amplitude: 0.5, time: 15 }).value).toBeCloseTo(0.5);
    });
    test('phase 0.25 shifts peak to t=0', () => {
      expect(waveNodeDef.evaluate({ ...base, phase: 0.25 }).value).toBeCloseTo(1);
    });
    test('phase 0.5 inverts', () => {
      expect(waveNodeDef.evaluate({ ...base, phase: 0.5, time: 15 }).value).toBeCloseTo(-1);
    });
  });

  describe('square', () => {
    const sq = { ...base, waveType: 'square' as const };
    test('+1 in first half of cycle', () => {
      expect(waveNodeDef.evaluate({ ...sq, time: 6 }).value).toBe(1);
    });
    test('-1 in second half of cycle', () => {
      expect(waveNodeDef.evaluate({ ...sq, time: 36 }).value).toBe(-1);
    });
    test('amplitude scales output', () => {
      expect(waveNodeDef.evaluate({ ...sq, amplitude: 0.5, time: 6 }).value).toBe(0.5);
    });
  });

  describe('saw', () => {
    const saw = { ...base, waveType: 'saw' as const };
    test('-1 at t=0', () => {
      expect(waveNodeDef.evaluate(saw).value).toBeCloseTo(-1);
    });
    test('0 at midpoint (t=30)', () => {
      expect(waveNodeDef.evaluate({ ...saw, time: 30 }).value).toBeCloseTo(0);
    });
    test('approaches +1 near end of cycle', () => {
      expect(waveNodeDef.evaluate({ ...saw, time: 59.94 }).value).toBeCloseTo(1, 1);
    });
  });

  describe('reverse-saw', () => {
    const rsaw = { ...base, waveType: 'reverse-saw' as const };
    test('+1 at t=0', () => {
      expect(waveNodeDef.evaluate(rsaw).value).toBeCloseTo(1);
    });
    test('0 at midpoint (t=30)', () => {
      expect(waveNodeDef.evaluate({ ...rsaw, time: 30 }).value).toBeCloseTo(0);
    });
    test('approaches -1 near end of cycle', () => {
      expect(waveNodeDef.evaluate({ ...rsaw, time: 59.94 }).value).toBeCloseTo(-1, 1);
    });
  });

  describe('triangle', () => {
    const tri = { ...base, waveType: 'triangle' as const };
    test('0 at t=0', () => {
      expect(waveNodeDef.evaluate(tri).value).toBeCloseTo(0);
    });
    test('+1 at peak (t=15)', () => {
      expect(waveNodeDef.evaluate({ ...tri, time: 15 }).value).toBeCloseTo(1);
    });
    test('0 at t=30', () => {
      expect(waveNodeDef.evaluate({ ...tri, time: 30 }).value).toBeCloseTo(0);
    });
    test('-1 at trough (t=45)', () => {
      expect(waveNodeDef.evaluate({ ...tri, time: 45 }).value).toBeCloseTo(-1);
    });
    test('amplitude scales output', () => {
      expect(waveNodeDef.evaluate({ ...tri, amplitude: 2, time: 15 }).value).toBeCloseTo(2);
    });
  });

  describe('sampler', () => {
    test('sine: base case - does a regular cycle in 0-1', () => {

      // 🫤 We need a better way of typing the output. Gonna need to be some magic in the generation script
      const result = waveNodeDef.evaluate({ ...base, frequency: 1, amplitude: 1, time: 0, phase: 0, samplerTemporalImpact: 0 }) as { value: number; sampler: { sample: (t: number) => number } };
      expect(result.sampler.sample(0)).toBe(0)
      expect(result.sampler.sample(0.25)).toBeCloseTo(1)
      expect(result.sampler.sample(1)).toBeCloseTo(0)
      expect(result.sampler.sample(0.75)).toBeCloseTo(-1)
      expect(result.sampler.sample(0.5)).toBeCloseTo(0)
    });

    test('sine: frequency@2 - does two cycles in 0-1', () => {

      const result = waveNodeDef.evaluate({ ...base, frequency: 2, amplitude: 1, time: 0, phase: 0, samplerTemporalImpact: 0 }) as { value: number; sampler: { sample: (t: number) => number } };
      expect(result.sampler.sample(0)).toBe(0)
      expect(result.sampler.sample(1 / 8)).toBeCloseTo(1)
      expect(result.sampler.sample(2 / 8)).toBeCloseTo(0)
      expect(result.sampler.sample(3 / 8)).toBeCloseTo(-1)
      expect(result.sampler.sample(4 / 8)).toBeCloseTo(0)



    });

    test('sine: frequency@2 - with samplerTemporalImpact', () => {

      //At t=15 (one quarter of a cycle) the wave starts at the 2/8 mark above (0)
      const result = waveNodeDef.evaluate({ ...base, frequency: 2, amplitude: 1, time: 15, phase: 0, samplerTemporalImpact: 1 }) as { value: number; sampler: { sample: (t: number) => number } };
      expect(result.sampler.sample(0)).toBeCloseTo(0)
      expect(result.sampler.sample(1 / 8)).toBeCloseTo(-1)
      expect(result.sampler.sample(2 / 8)).toBeCloseTo(0)
      expect(result.sampler.sample(3 / 8)).toBeCloseTo(1)
      expect(result.sampler.sample(4 / 8)).toBeCloseTo(0)



    });


  });
});
