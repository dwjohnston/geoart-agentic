import { describe, it, expect, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ModuleRenderToggles } from './ModuleRenderToggles';
import type { ModuleRenderToggleInfo } from '../graphEngine/externalInterfaces/ModuleImplementation';

const nodes: ModuleRenderToggleInfo['nodes'] = [
  { nodeId: 'myOrbit:point-circle', renderConfig: { layer: 'live' }, enabled: true },
  { nodeId: 'myOrbit:orbit-path', renderConfig: { layer: 'live' }, enabled: false },
];

describe('ModuleRenderToggles', () => {
  it('renders nothing when there are no render nodes', () => {
    const markup = renderToStaticMarkup(
      <ModuleRenderToggles nodes={[]} onToggle={mock()} />
    );
    expect(markup).toBe('');
  });

  it('renders one checkbox per render node, checked to match its enabled state', () => {
    const markup = renderToStaticMarkup(
      <ModuleRenderToggles nodes={nodes} onToggle={mock()} />
    );

    // Two checkboxes, one checked, one not.
    expect((markup.match(/type="checkbox"/g) ?? []).length).toBe(2);
    expect(markup).toContain('checked=""');

    // Labels are stripped of the `{moduleId}:` namespace prefix.
    expect(markup).toContain('point-circle');
    expect(markup).toContain('orbit-path');
    expect(markup).not.toContain('myOrbit:point-circle');
  });

  it('shows "Enable All" when not every node is enabled, "Disable All" when all are', () => {
    const partial = renderToStaticMarkup(<ModuleRenderToggles nodes={nodes} onToggle={mock()} />);
    expect(partial).toContain('Enable All');

    const allEnabled: ModuleRenderToggleInfo['nodes'] = nodes.map(n => ({ ...n, enabled: true }));
    const full = renderToStaticMarkup(<ModuleRenderToggles nodes={allEnabled} onToggle={mock()} />);
    expect(full).toContain('Disable All');
  });
});
