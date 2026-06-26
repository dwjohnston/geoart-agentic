import { describe, it, expect } from 'bun:test';
import colorShiftModule from './color-shift-module';

describe('color-shift-module', () => {
  it('has the correct kind', () => {
    expect(colorShiftModule._kind).toBe('color-shift-module');
  });

  it('expands to no control nodes, one colorShift compute node, and one circle render node', () => {
    const moduleId = 'testColorShift';
    const result = colorShiftModule({}, moduleId);

    expect(result.controlNodes).toHaveLength(0);

    expect(result.computeNodes).toHaveLength(1);
    expect(result.computeNodes[0].type).toBe('colorShift');
    expect(result.computeNodes[0].id).toBe(`${moduleId}:color-shift`);

    expect(result.renderNodes).toHaveLength(1);
    const renderNode = result.renderNodes[0];
    expect(renderNode.type).toBe('circle');
    expect(renderNode.id).toBe(`${moduleId}:target-circles`);
    expect(renderNode.renderConfig.layer).toBe('live');

    expect(result.inputMarkerNode.type).toBe('module-input-marker');
    expect(result.outputMarkerNode.type).toBe('module-output-marker');
    expect(result.outputMarkerNode.outputRefs).toEqual({
      points: { ref: `${moduleId}:color-shift.points` },
    });
  });

  it('wires all compute node inputs from the input marker', () => {
    const moduleId = 'colorShiftWireTest';
    const result = colorShiftModule({}, moduleId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = result.computeNodes[0].params as any;
    const marker = `${moduleId}:input-marker`;
    expect(p.inputPoints).toEqual({ ref: `${marker}.inputPoints` });
    expect(p.targetPoints).toEqual({ ref: `${marker}.targetPoints` });
    expect(p.falloff).toEqual({ ref: `${marker}.falloff` });
    expect(p.strength).toEqual({ ref: `${marker}.strength` });
    expect(p.mode).toEqual({ ref: `${marker}.mode` });
  });

  it('wires the circle render node centerPoints and radius from the input marker', () => {
    const moduleId = 'colorShiftCircleTest';
    const result = colorShiftModule({}, moduleId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = result.renderNodes[0].params as any;
    const marker = `${moduleId}:input-marker`;
    expect(p.centerPoints).toEqual({ ref: `${marker}.targetPoints` });
    expect(p.radius).toEqual({ v: 0.01 });
  });

  it('uses provided params in the input marker, defaulting the rest', () => {
    const moduleId = 'colorShiftParamTest';
    const externalRef = { ref: 'orbit.points' };
    const result = colorShiftModule({ inputPoints: externalRef }, moduleId);

    expect(result.inputMarkerNode.params.inputPoints).toEqual(externalRef);
    expect(result.inputMarkerNode.params.falloff).toEqual({ v: 1 });
    expect(result.inputMarkerNode.params.strength).toEqual({ v: 1 });
    expect(result.inputMarkerNode.params.targetPoints).toEqual({ v: [] });
    expect(result.inputMarkerNode.params.mode).toEqual({ v: 'proximity' });
  });
});
