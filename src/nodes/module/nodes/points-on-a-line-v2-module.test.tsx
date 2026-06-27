import { describe, it, expect } from 'bun:test';
import pointsOnALineV2Module from './points-on-a-line-v2-module';

describe('points-on-a-line-v2-module', () => {
  it('has the correct kind', () => {
    expect(pointsOnALineV2Module._kind).toBe('points-on-a-line-v2-module');
  });

  it('expands to no control nodes, one compute node, and one render node', () => {
    const moduleId = 'testPoal';
    const result = pointsOnALineV2Module({}, moduleId);

    expect(result.controlNodes).toHaveLength(0);

    expect(result.computeNodes).toHaveLength(1);
    expect(result.computeNodes[0].type).toBe('pointsOnALineV2');
    expect(result.computeNodes[0].id).toBe(`${moduleId}:points-on-a-line-v2`);

    expect(result.renderNodes).toHaveLength(1);
    expect(result.renderNodes[0].type).toBe('circle');
    expect(result.renderNodes[0].id).toBe(`${moduleId}:circles`);
  });

  it('wires compute node inputs from the input marker', () => {
    const moduleId = 'poalWireTest';
    const result = pointsOnALineV2Module({}, moduleId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = result.computeNodes[0].params as any;
    const marker = `${moduleId}:input-marker`;
    expect(p.colorPoints).toEqual({ ref: `${marker}.colorPoints` });
    expect(p.numPoints).toEqual({ ref: `${marker}.numPoints` });
    expect(p.curveMode).toEqual({ ref: `${marker}.curveMode` });
  });

  it('wires circle render node centerPoints to compute node points output', () => {
    const moduleId = 'poalRenderTest';
    const result = pointsOnALineV2Module({}, moduleId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const circleParams = result.renderNodes[0].params as any;
    expect(circleParams.centerPoints).toEqual({ ref: `${moduleId}:points-on-a-line-v2.points` });
  });

  it('wires the output marker to the compute node points output', () => {
    const moduleId = 'poalOutputTest';
    const result = pointsOnALineV2Module({}, moduleId);

    expect(result.outputMarkerNode.id).toBe(moduleId);
    expect(result.outputMarkerNode.outputRefs).toEqual({
      points: { ref: `${moduleId}:points-on-a-line-v2.points` },
    });
  });

  it('namespaces all internal ids with the module id', () => {
    const result = pointsOnALineV2Module({}, 'myPoal');
    const allIds = [
      ...result.computeNodes.map(n => n.id),
      ...result.renderNodes.map(n => n.id),
      result.inputMarkerNode.id,
    ];
    for (const id of allIds) {
      expect(id).toMatch(/^myPoal:/);
    }
  });

  it('uses provided params in the input marker, defaulting the rest', () => {
    const moduleId = 'poalParamTest';
    const externalRef = { ref: 'orbit.points' };
    const result = pointsOnALineV2Module({ colorPoints: externalRef }, moduleId);

    expect(result.inputMarkerNode.params.colorPoints).toEqual(externalRef);
    expect(result.inputMarkerNode.params.numPoints).toEqual({ v: 10 });
    expect(result.inputMarkerNode.params.curveMode).toEqual({ v: 'straight' });
  });

  it('render node is on the live layer with correct tags', () => {
    const result = pointsOnALineV2Module({}, 'poalTagTest');

    expect(result.renderNodes[0].renderConfig.layer).toBe('live');
    expect(result.renderNodes[0].renderConfig.tags).toContain('points-on-a-line-v2');
    expect(result.renderNodes[0].renderConfig.tags).toContain('point');
  });

  it('render node is displayed by default', () => {
    const result = pointsOnALineV2Module({}, 'poalDisplayTest');
    expect(result.renderNodes[0].renderConfig.displayByDefault).toBe(true);
  });

  it('accepts a provided curveMode param', () => {
    const result = pointsOnALineV2Module({ curveMode: { v: 'catmull-rom' } }, 'poalCurveModeTest');
    expect(result.inputMarkerNode.params.curveMode).toEqual({ v: 'catmull-rom' });
  });
});
