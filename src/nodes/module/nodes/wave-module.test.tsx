import { describe, it, expect } from 'bun:test';
import waveModule from './wave-module';

describe('wave-module', () => {
  it('has the correct kind', () => {
    expect(waveModule._kind).toBe('wave-module');
  });

  it('returns the expected internal node ids and types', () => {
    const result = waveModule({}, 'myWave');

    const controlTypes = result.controlNodes.map(n => ({ id: n.id, type: n.type }));
    expect(controlTypes).toEqual([
      { id: 'myWave:wave-shape', type: 'waveSelector' },
      { id: 'myWave:sampler-temporal-impact', type: 'slider' },
      { id: 'myWave:fm-frequency', type: 'slider' },
      { id: 'myWave:fm-amount', type: 'slider' },
      { id: 'myWave:fm-temporal-impact', type: 'slider' },
      { id: 'myWave:am-frequency', type: 'slider' },
      { id: 'myWave:am-amount', type: 'slider' },
      { id: 'myWave:am-temporal-impact', type: 'slider' },
    ]);

    const computeTypes = result.computeNodes.map(n => ({ id: n.id, type: n.type }));
    expect(computeTypes).toEqual([
      { id: 'myWave:time', type: 'time' },
      { id: 'myWave:fm-wave', type: 'wave' },
      { id: 'myWave:am-wave', type: 'wave' },
      { id: 'myWave:primary-wave', type: 'wave' },
    ]);

    expect(result.renderNodes).toHaveLength(0);
  });

  it('wires primary wave outputs to the output marker', () => {
    const result = waveModule({}, 'myWave');

    expect(result.outputMarkerNode.outputRefs).toEqual({
      value: { ref: 'myWave:primary-wave.value' },
      sampler: { ref: 'myWave:primary-wave.sampler' },
    });
    expect(result.outputMarkerNode.id).toBe('myWave');
  });

  it('uses external frequency input from the input marker', () => {
    const result = waveModule({ frequency: { ref: 'freqSlider.value' } }, 'myWave');

    const primaryWave = result.computeNodes.find(n => n.id === 'myWave:primary-wave')!;
    const primaryParams = primaryWave.params as unknown as Record<string, unknown>;
    expect(primaryParams.frequency).toEqual({ ref: 'myWave:input-marker.frequency' });
  });

  it('namespaces all internal ids with the module id', () => {
    const result = waveModule({}, 'waveA');
    const allIds = [
      ...result.controlNodes.map(n => n.id),
      ...result.computeNodes.map(n => n.id),
      result.inputMarkerNode.id,
    ];
    for (const id of allIds) {
      expect(id).toMatch(/^waveA:/);
    }
  });

  it('applies default values when no params are supplied', () => {
    const result = waveModule({}, 'myWave');

    expect(result.defaultValues).toEqual({
      frequency: 1,
      amplitude: 0.5,
      phase: 0,
    });

    const inputMarkerParams = result.inputMarkerNode.params as unknown as Record<string, { v: unknown }>;
    expect(inputMarkerParams.frequency?.v).toBe(1);
    expect(inputMarkerParams.amplitude?.v).toBe(0.5);
    expect(inputMarkerParams.phase?.v).toBe(0);
  });
});
