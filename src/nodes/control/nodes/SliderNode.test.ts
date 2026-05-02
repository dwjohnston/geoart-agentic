import { describe, it, expect } from 'vitest';
import { sliderNodeDef } from './SliderNode';

describe('slider node', () => {
  function evaluate(params: Record<string, { v: unknown }>) {
    const result = sliderNodeDef.evaluate(params);
    return result[0] as { kind: string; v: number };
  }

  it('returns default zero when params are empty', () => {
    const result = evaluate({});
    expect(result.kind).toBe('number');
    expect(result.v).toBe(0);
  });

  it('returns provided value', () => {
    const result = evaluate({ value: { v: 0.75 } });
    expect(result.v).toBe(0.75);
  });

  it('has number output port', () => {
    expect(sliderNodeDef.outputs).toEqual([{ name: 'value', type: 'number' }]);
  });
});
