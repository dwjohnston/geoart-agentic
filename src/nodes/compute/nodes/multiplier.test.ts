import { describe, expect, test } from 'vitest';
import { multiplierNodeDef } from './multiplier.node';
import type { NumberValue } from '../../../graph/types';

function n(v: number): NumberValue {
  return { kind: 'number', v };
}

describe('multiplierNodeDef', () => {
  test('1 × 1 = 1', () => {
    const result = multiplierNodeDef.evaluate([n(1), n(1)], {} as never);
    expect((result[0] as NumberValue).v).toBe(1);
  });

  test('0.5 × 0.5 = 0.25', () => {
    const result = multiplierNodeDef.evaluate([n(0.5), n(0.5)], {} as never);
    expect((result[0] as NumberValue).v).toBeCloseTo(0.25);
  });

  test('-1 × 0.5 = -0.5', () => {
    const result = multiplierNodeDef.evaluate([n(-1), n(0.5)], {} as never);
    expect((result[0] as NumberValue).v).toBeCloseTo(-0.5);
  });

  test('0 × 5 = 0', () => {
    const result = multiplierNodeDef.evaluate([n(0), n(5)], {} as never);
    expect((result[0] as NumberValue).v).toBe(0);
  });
});
