import { describe, it, expect } from 'bun:test';
import linkerModule from './linker-module';

describe('linker-module', () => {
  it('has the correct kind', () => {
    expect(linkerModule._kind).toBe('linker-module');
  });

  it('expands to no control nodes, no compute nodes, and a timedLineArray render node', () => {
    const moduleId = 'testLinker';
    const result = linkerModule({}, moduleId);

    expect(result.controlNodes).toHaveLength(0);
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

  it('wires all render node inputs from the input marker', () => {
    const moduleId = 'linkerWireTest';
    const result = linkerModule({}, moduleId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = result.renderNodes[0].params as any;
    expect(p.intervalTicks).toEqual({ ref: `${moduleId}:input-marker.intervalTicks` });
    expect(p.colorPointsA).toEqual({ ref: `${moduleId}:input-marker.pointsFrom` });
    expect(p.colorPointsB).toEqual({ ref: `${moduleId}:input-marker.pointsTo` });
    expect(p.mode).toEqual({ ref: `${moduleId}:input-marker.mode` });
    expect(p.intervalMode).toEqual({ ref: `${moduleId}:input-marker.intervalMode` });
  });

  it('uses provided params in the input marker, defaulting the rest', () => {
    const moduleId = 'linkerParamTest';
    const externalRef = { ref: 'orbitA.points' };
    const result = linkerModule({ pointsFrom: externalRef }, moduleId);

    expect(result.inputMarkerNode.params.pointsFrom).toEqual(externalRef);
    expect(result.inputMarkerNode.params.intervalTicks).toEqual({ v: 6 });
    expect(result.inputMarkerNode.params.mode).toEqual({ v: 'all-to-all' });
    expect(result.inputMarkerNode.params.intervalMode).toEqual({ v: 'all' });
  });
});
