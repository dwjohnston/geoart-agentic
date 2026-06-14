import { describe, it, expect } from 'bun:test';
import reflectModule from './reflect-module';

describe('reflect-module', () => {
  it('has the correct kind', () => {
    expect(reflectModule._kind).toBe('reflect-module');
  });

  it('expands to no control nodes, one reflect compute node, and two render nodes', () => {
    const moduleId = 'testReflect';
    const result = reflectModule({}, moduleId);

    expect(result.controlNodes).toHaveLength(0);

    expect(result.computeNodes).toHaveLength(1);
    expect(result.computeNodes[0].type).toBe('reflect');
    expect(result.computeNodes[0].id).toBe(`${moduleId}:reflect`);

    expect(result.renderNodes).toHaveLength(2);
    expect(result.renderNodes[0].type).toBe('circle');
    expect(result.renderNodes[0].id).toBe(`${moduleId}:reflection-circles`);
    expect(result.renderNodes[1].type).toBe('linesThroughPoint');
    expect(result.renderNodes[1].id).toBe(`${moduleId}:reflection-tangents`);
  });

  it('wires reflect compute node inputs from the input marker', () => {
    const moduleId = 'reflectWireTest';
    const result = reflectModule({}, moduleId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = result.computeNodes[0].params as any;
    const marker = `${moduleId}:input-marker`;
    expect(p.inputPoints).toEqual({ ref: `${marker}.inputPoints` });
    expect(p.reflectionPoints).toEqual({ ref: `${marker}.reflectionPoints` });
  });

  it('wires render nodes to reflection points from the input marker', () => {
    const moduleId = 'reflectRenderTest';
    const result = reflectModule({}, moduleId);

    const marker = `${moduleId}:input-marker`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const circleParams = result.renderNodes[0].params as any;
    expect(circleParams.centerPoints).toEqual({ ref: `${marker}.reflectionPoints` });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tangentParams = result.renderNodes[1].params as any;
    expect(tangentParams.points).toEqual({ ref: `${marker}.reflectionPoints` });
  });

  it('wires the output marker to the reflect compute node', () => {
    const moduleId = 'reflectOutputTest';
    const result = reflectModule({}, moduleId);

    expect(result.outputMarkerNode.id).toBe(moduleId);
    expect(result.outputMarkerNode.outputRefs).toEqual({
      points: { ref: `${moduleId}:reflect.points` },
    });
  });

  it('namespaces all internal ids with the module id', () => {
    const result = reflectModule({}, 'myReflect');
    const allIds = [
      ...result.computeNodes.map(n => n.id),
      ...result.renderNodes.map(n => n.id),
      result.inputMarkerNode.id,
    ];
    for (const id of allIds) {
      expect(id).toMatch(/^myReflect:/);
    }
  });

  it('uses provided params in the input marker, defaulting the rest', () => {
    const moduleId = 'reflectParamTest';
    const externalRef = { ref: 'orbit.points' };
    const result = reflectModule({ inputPoints: externalRef }, moduleId);

    expect(result.inputMarkerNode.params.inputPoints).toEqual(externalRef);
    expect(result.inputMarkerNode.params.reflectionPoints).toEqual({ v: [] });
  });

  it('render nodes are on the live layer and tagged', () => {
    const result = reflectModule({}, 'reflectTagTest');

    expect(result.renderNodes[0].renderConfig.layer).toBe('live');
    expect(result.renderNodes[0].renderConfig.tags).toContain('reflect');

    expect(result.renderNodes[1].renderConfig.layer).toBe('live');
    expect(result.renderNodes[1].renderConfig.tags).toContain('reflect');
  });
});
