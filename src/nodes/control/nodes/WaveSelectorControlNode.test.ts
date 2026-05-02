import { describe, it, expect } from 'vitest';
import { waveSelectorNodeDef } from './WaveSelectorControlNode';

describe('waveSelector node', () => {
  function evaluate(params: Record<string, { v: unknown }>) {
    const result = waveSelectorNodeDef.evaluate(params);
    return result[0] as { kind: string; v: string };
  }

  it('returns sine as default when params are empty', () => {
    const result = evaluate({});
    expect(result.kind).toBe('waveType');
    expect(result.v).toBe('sine');
  });

  it('returns provided wave type', () => {
    const result = evaluate({ value: { v: 'square' } });
    expect(result.v).toBe('square');
  });

  it('has output port for value', () => {
    expect(waveSelectorNodeDef.outputs).toHaveLength(1);
    expect(waveSelectorNodeDef.outputs[0].name).toBe('value');
  });
});
