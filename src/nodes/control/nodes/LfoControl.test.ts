import { describe, it, expect } from 'bun:test';
import lfoControlNodeImplementation from './LfoControl';

describe('lfo-control node', () => {
  it('has the correct node kind', () => {
    expect(lfoControlNodeImplementation.nodeKind).toBe('lfo-control');
  });

  it('has correct default baseValue', () => {
    expect(lfoControlNodeImplementation.defaultValues.baseValue).toBe(0);
  });

  it('has correct default frequency', () => {
    expect(lfoControlNodeImplementation.defaultValues.frequency).toBe(0.5);
  });

  it('has correct default amplitude', () => {
    expect(lfoControlNodeImplementation.defaultValues.amplitude).toBe(0);
  });

  it('has correct default waveShape', () => {
    expect(lfoControlNodeImplementation.defaultValues.waveShape).toBe('sine');
  });
});
