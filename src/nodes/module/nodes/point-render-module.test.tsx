import { describe, it, expect } from 'bun:test';
import pointRenderModule from './point-render-module';

describe('point-render-module', () => {
  it('has the correct kind', () => {
    expect(pointRenderModule._kind).toBe('point-render-module');
  });

  it('expands to circle and linesThroughPoint render nodes', () => {
    const moduleId = 'testPointRender';
    const result = pointRenderModule({}, moduleId);

    // Check control nodes
    expect(result.controlNodes).toHaveLength(0);

    // Check compute nodes
    expect(result.computeNodes).toHaveLength(1);
    expect(result.computeNodes[0].type).toBe('colorPointArrayCompute');
    expect(result.computeNodes[0].id).toBe(`${moduleId}:add-gradient`);

    // Check render nodes
    expect(result.renderNodes).toHaveLength(2);

    const circleNode = result.renderNodes[0];
    expect(circleNode.type).toBe('circle');
    expect(circleNode.id).toBe(`${moduleId}:circles`);
    expect(circleNode.renderConfig.layer).toBe('live');

    const crosshairsNode = result.renderNodes[1];
    expect(crosshairsNode.type).toBe('linesThroughPoint');
    expect(crosshairsNode.id).toBe(`${moduleId}:crosshairs`);
    expect(crosshairsNode.renderConfig.layer).toBe('live');

    // Check markers
    expect(result.inputMarkerNode.type).toBe('module-input-marker');
    expect(result.outputMarkerNode.type).toBe('module-output-marker');
    expect(Object.keys(result.outputMarkerNode.outputRefs)).toHaveLength(0);
  });

  it('namespaces all internal ids with the module id', () => {
    const result = pointRenderModule({}, 'myPoints');
    const allIds = [
      ...result.computeNodes.map(n => n.id),
      ...result.renderNodes.map(n => n.id),
      result.inputMarkerNode.id,
    ];
    for (const id of allIds) {
      expect(id).toMatch(/^myPoints:/);
    }
  });

  it('wires input marker to compute node', () => {
    const result = pointRenderModule({}, 'myPoints');

    const computeNode = result.computeNodes[0];
    const params = computeNode.params as unknown as Record<string, unknown>;
    expect(params.points).toEqual({
      ref: `myPoints:input-marker.points`
    });
  });
});
