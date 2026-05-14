import { describe, it, expect } from 'bun:test';
import { lfoControlNodeDef } from './LfoControlNode';

describe('lfo-control node', () => {
  it('has the correct node kind', () => {
    expect(lfoControlNodeDef.nodeKind).toBe('lfo-control');
  });

  it('has correct default baseValue', () => {
    expect(lfoControlNodeDef.defaultValues.baseValue).toBe(0);
  });

  it('has correct default frequency', () => {
    expect(lfoControlNodeDef.defaultValues.frequency).toBe(0.5);
  });

  it('has correct default amplitude', () => {
    expect(lfoControlNodeDef.defaultValues.amplitude).toBe(0);
  });

  it('has correct default waveShape', () => {
    expect(lfoControlNodeDef.defaultValues.waveShape).toBe('sine');
  });
});
