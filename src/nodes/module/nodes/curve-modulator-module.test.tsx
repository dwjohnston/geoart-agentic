import { describe, it, expect } from 'bun:test';
import curveModulatorModule from './curve-modulator-module';

describe('curve-modulator-module', () => {
  it('has the correct kind', () => {
    expect(curveModulatorModule._kind).toBe('curve-modulator-module');
  });

  it('has no internal control nodes', () => {
    const result = curveModulatorModule({}, 'myModulator');
    expect(result.controlNodes).toHaveLength(0);
  });

  it('returns the expected internal compute nodes', () => {
    const result = curveModulatorModule({}, 'myModulator');

    const computeTypes = result.computeNodes.map(n => ({ id: n.id, type: n.type }));
    expect(computeTypes).toEqual([
      { id: 'myModulator:curve-modulator', type: 'curveModulator' },
    ]);
  });

  it('returns the expected internal module nodes', () => {
    const result = curveModulatorModule({}, 'myModulator');

    const moduleTypes = result.moduleNodes?.map(n => ({ id: n.id, type: n.type })) ?? [];
    expect(moduleTypes).toEqual([
      { id: 'wave-module', type: 'wave-module' },
      { id: 'point-render-module', type: 'point-render-module' },
    ]);
  });

  it('returns the expected internal render nodes', () => {
    const result = curveModulatorModule({}, 'myModulator');

    const renderTypes = result.renderNodes.map(n => ({ id: n.id, type: n.type }));
    expect(renderTypes).toEqual([
      { id: 'myModulator:connect-dots', type: 'connect-dots' },
    ]);
  });

  it('wires modulator output to the output marker', () => {
    const result = curveModulatorModule({}, 'myModulator');

    expect(result.outputMarkerNode.outputRefs).toEqual({
      points: { ref: 'myModulator:curve-modulator.points' },
    });
    expect(result.outputMarkerNode.id).toBe('myModulator');
  });

  it('namespaces all internal ids with the module id', () => {
    const result = curveModulatorModule({}, 'curveA');
    const allIds = [
      ...result.computeNodes.map(n => n.id),
      ...result.renderNodes.map(n => n.id),
      result.inputMarkerNode.id,
    ];
    for (const id of allIds) {
      expect(id).toMatch(/^curveA:/);
    }
  });

  it('does not namespace module node ids', () => {
    const result = curveModulatorModule({}, 'myModulator');

    const moduleNodeIds = result.moduleNodes?.map(n => n.id) ?? [];
    expect(moduleNodeIds).toEqual(['wave-module', 'point-render-module']);
  });

  it('applies default values when no params are supplied', () => {
    const result = curveModulatorModule({}, 'myModulator');

    expect(result.defaultValues).toMatchObject({
      curve: [],
      cycleLengthMode: 'arrayLength',
      modulationAngle: 0,
      fixedOffset: 0,
    });
  });

  it('wires wave module sampler to curve modulator compute node', () => {
    const result = curveModulatorModule({}, 'myModulator');

    const curveModNode = result.computeNodes[0];
    const params = curveModNode.params as Record<string, unknown>;
    expect(params.modulator).toEqual({
      ref: 'myModulator:wave-module.sampler',
    });
  });

  it('wires point render module to output points', () => {
    const result = curveModulatorModule({}, 'myModulator');

    const pointRenderModule = result.moduleNodes?.find(m => m.type === 'point-render-module');
    const params = pointRenderModule?.params as Record<string, unknown>;
    expect(params?.points).toEqual({
      ref: 'myModulator:curve-modulator.points',
    });
  });
});
