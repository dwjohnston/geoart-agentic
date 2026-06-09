import { describe, it, expect } from 'bun:test';
import waveModule from './wave-module';

describe('wave-module', () => {
  it('has the correct kind', () => {
    expect(waveModule._kind).toBe('wave-module');
  });

  it('has no internal control nodes', () => {
    const result = waveModule({}, 'myWave');
    expect(result.controlNodes).toHaveLength(0);
  });

  it('returns the expected internal compute nodes', () => {
    const result = waveModule({}, 'myWave');

    const computeTypes = result.computeNodes.map(n => ({ id: n.id, type: n.type }));
    expect(computeTypes).toEqual([
      { id: 'myWave:time', type: 'time' },
      { id: 'myWave:primary-wave', type: 'wave' },
    ]);

    expect(result.renderNodes).toHaveLength(0);
  });

  it('wires primary wave to the output marker', () => {
    const result = waveModule({}, 'myWave');

    expect(result.outputMarkerNode.outputRefs).toEqual({
      value: { ref: 'myWave:primary-wave.value' },
      sampler: { ref: 'myWave:primary-wave.sampler' },
    });
    expect(result.outputMarkerNode.id).toBe('myWave');
  });

  it('namespaces all internal ids with the module id', () => {
    const result = waveModule({}, 'waveA');
    const allIds = [
      ...result.computeNodes.map(n => n.id),
      result.inputMarkerNode.id,
    ];
    for (const id of allIds) {
      expect(id).toMatch(/^waveA:/);
    }
  });

  it('applies default values when no params are supplied', () => {
    const result = waveModule({}, 'myWave');

    expect(result.defaultValues).toMatchObject({
      frequency: 1,
      amplitude: 0.5,
      phase: 0,
      waveShape: 'sine',
    });

    const inputMarkerParams = result.inputMarkerNode.params as unknown as Record<string, { v: unknown }>;
    expect(inputMarkerParams.frequency?.v).toBe(1);
    expect(inputMarkerParams.waveShape?.v).toBe('sine');
  });
});
