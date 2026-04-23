import { describe, expect, test } from 'vitest';
import { evaluateWave } from './wave';

describe('evaluateWave', () => {
  describe('sine', () => {
    test('zero at t=0', () => {
      expect(evaluateWave('sine', 1, 1, 0, 0)).toBeCloseTo(0);
    });
    test('peaks at +1 at t=15 ticks (quarter cycle, freq=1)', () => {
      expect(evaluateWave('sine', 1, 1, 0, 15)).toBeCloseTo(1);
    });
    test('zero at t=30 ticks (half cycle)', () => {
      expect(evaluateWave('sine', 1, 1, 0, 30)).toBeCloseTo(0);
    });
    test('troughs at -1 at t=45 ticks (three-quarter cycle)', () => {
      expect(evaluateWave('sine', 1, 1, 0, 45)).toBeCloseTo(-1);
    });
    test('amplitude scales output', () => {
      expect(evaluateWave('sine', 1, 0.5, 0, 15)).toBeCloseTo(0.5);
    });
    test('phase 0.25 shifts peak to t=0', () => {
      expect(evaluateWave('sine', 1, 1, 0.25, 0)).toBeCloseTo(1);
    });
    test('phase 0.5 inverts (starts at 0 going negative)', () => {
      expect(evaluateWave('sine', 1, 1, 0.5, 15)).toBeCloseTo(-1);
    });
  });

  describe('square', () => {
    test('+1 in first half of cycle', () => {
      expect(evaluateWave('square', 1, 1, 0, 6)).toBe(1);
    });
    test('-1 in second half of cycle', () => {
      expect(evaluateWave('square', 1, 1, 0, 36)).toBe(-1);
    });
    test('amplitude scales output', () => {
      expect(evaluateWave('square', 1, 0.5, 0, 6)).toBe(0.5);
    });
  });

  describe('saw', () => {
    test('-1 at t=0', () => {
      expect(evaluateWave('saw', 1, 1, 0, 0)).toBeCloseTo(-1);
    });
    test('0 at t=30 ticks (midpoint)', () => {
      expect(evaluateWave('saw', 1, 1, 0, 30)).toBeCloseTo(0);
    });
    test('approaches +1 near end of cycle', () => {
      expect(evaluateWave('saw', 1, 1, 0, 59.94)).toBeCloseTo(1, 1);
    });
  });

  describe('inverse-saw', () => {
    test('+1 at t=0', () => {
      expect(evaluateWave('inverse-saw', 1, 1, 0, 0)).toBeCloseTo(1);
    });
    test('0 at t=30 ticks (midpoint)', () => {
      expect(evaluateWave('inverse-saw', 1, 1, 0, 30)).toBeCloseTo(0);
    });
    test('approaches -1 near end of cycle', () => {
      expect(evaluateWave('inverse-saw', 1, 1, 0, 59.94)).toBeCloseTo(-1, 1);
    });
  });

  describe('triangle', () => {
    test('0 at t=0', () => {
      expect(evaluateWave('triangle', 1, 1, 0, 0)).toBeCloseTo(0);
    });
    test('+1 at t=15 ticks (peak)', () => {
      expect(evaluateWave('triangle', 1, 1, 0, 15)).toBeCloseTo(1);
    });
    test('0 at t=30 ticks', () => {
      expect(evaluateWave('triangle', 1, 1, 0, 30)).toBeCloseTo(0);
    });
    test('-1 at t=45 ticks (trough)', () => {
      expect(evaluateWave('triangle', 1, 1, 0, 45)).toBeCloseTo(-1);
    });
    test('amplitude scales output', () => {
      expect(evaluateWave('triangle', 1, 2, 0, 15)).toBeCloseTo(2);
    });
  });
});
