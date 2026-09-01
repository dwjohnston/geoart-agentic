import { describe, it, expect, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
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
    expect(result.computeNodes[0].type).toBe('curveModulator');
    expect(result.computeNodes[0].id).toBe(`${moduleId}:arrow-head`);

    // Check render nodes
    expect(result.renderNodes).toHaveLength(3);

    const circleNode = result.renderNodes[0];
    expect(circleNode.type).toBe('circle');
    expect(circleNode.id).toBe(`${moduleId}:circles`);
    expect(circleNode.renderConfig.layer).toBe('live');

    const arrowHeadsNode = result.renderNodes[1];
    expect(arrowHeadsNode.type).toBe('circle');
    expect(arrowHeadsNode.id).toBe(`${moduleId}:arrow-heads-render`);
    expect(arrowHeadsNode.renderConfig.layer).toBe('live');

    const crosshairsNode = result.renderNodes[2];
    expect(crosshairsNode.type).toBe('linesThroughPoint');
    expect(crosshairsNode.id).toBe(`${moduleId}:crosshairs`);
    expect(crosshairsNode.renderConfig.layer).toBe('live');

    // Check markers
    expect(result.inputMarkerNode.type).toBe('module-input-marker');
    expect(result.outputMarkerNode.type).toBe('module-output-marker');
    expect(Object.keys(result.outputMarkerNode.outputRefs)).toHaveLength(0);
  });

  it('renders nothing when there are no render toggles to show', () => {
    const result = pointRenderModule({}, 'togglelessPointRender');
    const element = result.inputMarkerNode.renderControl({}, mock(), { nodes: [], onToggle: mock() });
    expect(element).toBeNull();
  });

  it('shows a control panel of render-node toggles when renderToggles has nodes', () => {
    const moduleId = 'pointRenderTogglesTest';
    const result = pointRenderModule({}, moduleId);

    const markup = renderToStaticMarkup(
      result.inputMarkerNode.renderControl({}, mock(), {
        nodes: [{ nodeId: `${moduleId}:circles`, renderConfig: { layer: 'live' }, enabled: true }],
        onToggle: mock(),
      }) as React.ReactElement
    );

    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain('circles');
  });
});
