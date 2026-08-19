import { useState } from 'react';
import type { ModuleRenderToggleInfo } from '../graphEngine/externalInterfaces/ModuleImplementation';

type Props = ModuleRenderToggleInfo;

function createInitialEnabledSet(nodes: ModuleRenderToggleInfo['nodes']): Set<string> {
  return new Set(nodes.filter(n => n.enabled).map(n => n.nodeId));
}

/**
 * Render-node visibility toggles scoped to a single module, meant to be shown
 * inline inside that module's own `ModulePanel`. This is a companion to (not a
 * replacement for) the global `RenderToggles` panel, which still provides the
 * "toggle all" behaviour across every module.
 */
export function ModuleRenderToggles({ nodes, onToggle }: Props) {
  const nodeKey = nodes.map(n => n.nodeId).join(',');
  const [prevNodeKey, setPrevNodeKey] = useState(nodeKey);
  const [enabled, setEnabled] = useState<Set<string>>(() => createInitialEnabledSet(nodes));

  if (prevNodeKey !== nodeKey) {
    setPrevNodeKey(nodeKey);
    setEnabled(createInitialEnabledSet(nodes));
  }

  if (nodes.length === 0) {
    return null;
  }

  const allEnabled = nodes.every(n => enabled.has(n.nodeId));

  const handleToggle = (nodeId: string) => {
    setEnabled(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
    onToggle(nodeId);
  };

  const handleToggleAll = () => {
    if (allEnabled) {
      nodes.forEach(node => {
        if (enabled.has(node.nodeId)) onToggle(node.nodeId);
      });
      setEnabled(new Set());
    } else {
      nodes.forEach(node => {
        if (!enabled.has(node.nodeId)) onToggle(node.nodeId);
      });
      setEnabled(new Set(nodes.map(n => n.nodeId)));
    }
  };

  // Strip the `{moduleId}:` namespace prefix for a shorter, more readable label.
  const shortLabel = (nodeId: string) => nodeId.includes(':') ? nodeId.slice(nodeId.indexOf(':') + 1) : nodeId;

  return (
    <div style={{ borderTop: '1px solid #555', paddingTop: 8, marginTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1, color: '#a8a8a8' }}>
          Render Nodes
        </div>
        <button
          onClick={handleToggleAll}
          style={{ fontSize: 10, cursor: 'pointer', padding: '2px 6px', background: '#2a2a2a', color: '#ccc', border: '1px solid #555', borderRadius: 3 }}
        >
          {allEnabled ? 'Disable All' : 'Enable All'}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {nodes.map(node => (
          <label key={node.nodeId} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
            <input
              type="checkbox"
              checked={enabled.has(node.nodeId)}
              onChange={() => handleToggle(node.nodeId)}
              style={{ cursor: 'pointer' }}
            />
            <span>{shortLabel(node.nodeId)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
