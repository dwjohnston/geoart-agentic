import { describe, it, expect } from 'bun:test';
import waveSelectorNodeDef from './WaveSelectorControlNode';

describe('waveSelector node', () => {
  it('has the correct node kind', () => {
    expect(waveSelectorNodeDef.nodeKind).toBe('waveSelector');
  });

  it('has correct default value', () => {
    expect(waveSelectorNodeDef.defaultValues.value).toBe('sine');
  });
});
