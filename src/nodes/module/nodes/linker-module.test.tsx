import { describe, it, expect } from 'bun:test';
import linkerModule from './linker-module';

describe('linker-module', () => {
  it('has the correct kind', () => {
    expect(linkerModule._kind).toBe('linker-module');
  });

  it('expands to control nodes for mode and interval mode, and a timedLineArray render node', () => {
    const moduleId = 'testLinker';
    const result = linkerModule({}, moduleId);

    expect(result.controlNodes).toHaveLength(2);
    expect(result.controlNodes[0].type).toBe('timedLineArrayModeSelector');
    expect(result.controlNodes[0].id).toBe(`${moduleId}:mode-selector`);
    expect(result.controlNodes[1].type).toBe('timedLineArrayIntervalModeSelector');
    expect(result.controlNodes[1].id).toBe(`${moduleId}:interval-mode-selector`);

    expect(result.computeNodes).toHaveLength(0);

    expect(result.renderNodes).toHaveLength(1);
    const renderNode = result.renderNodes[0];
    expect(renderNode.type).toBe('timedLineArray');
    expect(renderNode.id).toBe(`${moduleId}:timed-line-array`);
    expect(renderNode.renderConfig.layer).toBe('paint');

    expect(result.inputMarkerNode.type).toBe('module-input-marker');
    expect(result.outputMarkerNode.type).toBe('module-output-marker');
    expect(Object.keys(result.outputMarkerNode.outputRefs)).toHaveLength(0);
  });

  it('wires render node inputs from input marker and control nodes', () => {
    const moduleId = 'linkerWireTest';
    const result = linkerModule({}, moduleId);

    const renderNode = result.renderNodes[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = renderNode.params as any;
    expect(p.intervalTicks).toEqual({ ref: `${moduleId}:input-marker.intervalTicks` });
    expect(p.colorPointsA).toEqual({ ref: `${moduleId}:input-marker.pointsFrom` });
    expect(p.colorPointsB).toEqual({ ref: `${moduleId}:input-marker.pointsTo` });
    expect(p.mode).toEqual({ ref: `${moduleId}:mode-selector.value` });
    expect(p.intervalMode).toEqual({ ref: `${moduleId}:interval-mode-selector.value` });
  });

  it('uses provided params in the input marker', () => {
    const moduleId = 'linkerParamTest';
    const externalRef = { ref: 'orbitA.points' };
    const result = linkerModule({ pointsFrom: externalRef }, moduleId);

    expect(result.inputMarkerNode.params.pointsFrom).toEqual(externalRef);
    expect(result.inputMarkerNode.params.intervalTicks).toEqual({ v: 6 });
  });
});
