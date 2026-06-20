import { describe, it, expect } from 'bun:test';
import rotateModule from './rotate-module';

describe('rotate-module', () => {
  it('has the correct kind', () => {
    expect(rotateModule._kind).toBe('rotate-module');
  });

  it('expands to no control nodes, one rotate compute node, and one render node', () => {
    const moduleId = 'testRotate';
    const result = rotateModule({}, moduleId);

    expect(result.controlNodes).toHaveLength(0);

    expect(result.computeNodes).toHaveLength(1);
    expect(result.computeNodes[0].type).toBe('rotate');
    expect(result.computeNodes[0].id).toBe(`${moduleId}:rotate`);

    expect(result.renderNodes).toHaveLength(1);
    expect(result.renderNodes[0].type).toBe('circle');
    expect(result.renderNodes[0].id).toBe(`${moduleId}:rotation-circles`);
  });

  it('wires rotate compute node inputs from the input marker', () => {
    const moduleId = 'rotateWireTest';
    const result = rotateModule({}, moduleId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = result.computeNodes[0].params as any;
    const marker = `${moduleId}:input-marker`;
    expect(p.inputPoints).toEqual({ ref: `${marker}.inputPoints` });
    expect(p.rotationCenters).toEqual({ ref: `${marker}.rotationCenters` });
    expect(p.rotationAmount).toEqual({ ref: `${marker}.rotationAmount` });
  });

  it('wires circle render node centerPoints to rotationCenters from input marker', () => {
    const moduleId = 'rotateRenderTest';
    const result = rotateModule({}, moduleId);

    const marker = `${moduleId}:input-marker`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const circleParams = result.renderNodes[0].params as any;
    expect(circleParams.centerPoints).toEqual({ ref: `${marker}.rotationCenters` });
  });

  it('wires the output marker to the rotate compute node', () => {
    const moduleId = 'rotateOutputTest';
    const result = rotateModule({}, moduleId);

    expect(result.outputMarkerNode.id).toBe(moduleId);
    expect(result.outputMarkerNode.outputRefs).toEqual({
      points: { ref: `${moduleId}:rotate.points` },
    });
  });

  it('namespaces all internal ids with the module id', () => {
    const result = rotateModule({}, 'myRotate');
    const allIds = [
      ...result.computeNodes.map(n => n.id),
      ...result.renderNodes.map(n => n.id),
      result.inputMarkerNode.id,
    ];
    for (const id of allIds) {
      expect(id).toMatch(/^myRotate:/);
    }
  });

  it('uses provided params in the input marker, defaulting the rest', () => {
    const moduleId = 'rotateParamTest';
    const externalRef = { ref: 'orbit.points' };
    const result = rotateModule({ inputPoints: externalRef }, moduleId);

    expect(result.inputMarkerNode.params.inputPoints).toEqual(externalRef);
    expect(result.inputMarkerNode.params.rotationCenters).toEqual({ v: [] });
    expect(result.inputMarkerNode.params.rotationAmount).toEqual({ v: 0 });
  });

  it('render node is on the live layer and tagged', () => {
    const result = rotateModule({}, 'rotateTagTest');

    expect(result.renderNodes[0].renderConfig.layer).toBe('live');
    expect(result.renderNodes[0].renderConfig.tags).toContain('rotate');
  });
});
