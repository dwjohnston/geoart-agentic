import { describe, it, expect } from 'vitest';
import { lfoControlNodeDef } from './LfoControlNode';

describe('lfo-control node', () => {
  function evaluate(params: Record<string, { v: unknown }>) {
    return lfoControlNodeDef.evaluate(params) as { kind: string; v: unknown }[];
  }

  it('returns all defaults when params are empty', () => {
    const result = evaluate({});
    expect(result).toEqual([
      { kind: 'number', v: 0 },
      { kind: 'number', v: 0.5 },
      { kind: 'number', v: 0 },
      { kind: 'waveType', v: 'sine' },
    ]);
  });

  it('returns overridden baseValue', () => {
    const result = evaluate({ baseValue: { v: 1.5 } });
    expect(result[0]).toEqual({ kind: 'number', v: 1.5 });
  });

  it('returns overridden frequency', () => {
    const result = evaluate({ frequency: { v: 2 } });
    expect(result[1]).toEqual({ kind: 'number', v: 2 });
  });

  it('returns overridden amplitude', () => {
    const result = evaluate({ amplitude: { v: 0.8 } });
    expect(result[2]).toEqual({ kind: 'number', v: 0.8 });
  });

  it('returns overridden waveShape', () => {
    const result = evaluate({ waveShape: { v: 'triangle' } });
    expect(result[3]).toEqual({ kind: 'waveType', v: 'triangle' });
  });

  it('has four output ports', () => {
    expect(lfoControlNodeDef.outputs).toEqual([
      { name: 'baseValue', type: 'number' },
      { name: 'frequency', type: 'number' },
      { name: 'amplitude', type: 'number' },
      { name: 'waveShape', type: 'number' },
    ]);
  });
});
