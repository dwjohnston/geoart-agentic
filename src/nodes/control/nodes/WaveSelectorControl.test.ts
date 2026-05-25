import { describe, it, expect } from 'bun:test';
import waveSelectorNodeImplementation from './WaveSelectorControl';

describe('waveSelector node', () => {
  it('has the correct node kind', () => {
    expect(waveSelectorNodeImplementation.nodeKind).toBe('waveSelector');
  });

  it('has correct default value', () => {
    expect(waveSelectorNodeImplementation.defaultValues.value).toBe('sine');
  });
});
