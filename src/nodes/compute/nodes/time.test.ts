import { describe, it, expect } from 'vitest';
import { evaluateTime } from './time';

describe('evaluateTime', () => {
  it('returns the elapsed time unchanged', () => {
    expect(evaluateTime(0)).toBe(0);
    expect(evaluateTime(1)).toBe(1);
    expect(evaluateTime(3.5)).toBe(3.5);
    expect(evaluateTime(100)).toBe(100);
  });
});
