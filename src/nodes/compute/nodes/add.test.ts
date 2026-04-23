import { describe, it, expect } from 'vitest';
import { addNodeDef } from './add.node';

describe('add node', () => {
  function evaluate(a: number, b: number) {
    const result = addNodeDef.evaluate(
      [{ kind: 'number', v: a }, { kind: 'number', v: b }],
      {} as never,
    );
    return (result[0] as { kind: 'number'; v: number }).v;
  }

  it('adds two positive numbers', () => {
    expect(evaluate(1, 2)).toBe(3);
  });

  it('adds negative and positive', () => {
    expect(evaluate(-0.5, 1)).toBe(0.5);
  });

  it('with amplitude 0, base speed is preserved', () => {
    // lfo outputs 0 when amplitude=0; speed = baseSpeed + 0 = baseSpeed
    expect(evaluate(0.8, 0)).toBe(0.8);
  });

  it('1 + lfo gives multiplicative modulator above zero', () => {
    // radius mod: add(1, lfo). With lfo=0.5 → 1.5, with lfo=-0.5 → 0.5
    expect(evaluate(1, 0.5)).toBe(1.5);
    expect(evaluate(1, -0.5)).toBe(0.5);
  });
});
