import { describe, it, expect, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import orbitModule from './orbit-module';

describe('orbit-module', () => {
  it('has the correct kind', () => {
    expect(orbitModule._kind).toBe('orbit-module');
  });

  it('shows its own render-node toggles when renderToggles has nodes', () => {
    const moduleId = 'orbitTogglesTest';
    const result = orbitModule({}, moduleId);

    const markup = renderToStaticMarkup(
      result.inputMarkerNode.renderControl({}, mock(), {
        nodes: [
          { nodeId: `${moduleId}:point-circle`, renderConfig: { layer: 'live' }, enabled: true },
          { nodeId: `${moduleId}:orbit-trace`, renderConfig: { layer: 'paint' }, enabled: false },
        ],
        onToggle: mock(),
      }) as React.ReactElement
    );

    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain('point-circle');
    expect(markup).toContain('orbit-trace');
  });
});
