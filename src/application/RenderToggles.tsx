import { useState } from 'react';
import type { GraphLoadPayload } from '../graphEngine/exports';

type Props = {
  renderingNodes: GraphLoadPayload['renderingNodes'];
  onToggle: (nodeId: string) => void;
};


function createInitialEnabledSet(renderingNodes: GraphLoadPayload['renderingNodes']): Set<string> {
  return new Set(renderingNodes.filter(n => n.renderConfig.displayByDefault !== false).map(n => n.nodeId));
}

export function RenderToggles({ renderingNodes, onToggle }: Props) {


  const nodeKey = renderingNodes.map(n => n.nodeId).join(',');
  const [prevNodeKey, setPrevNodeKey] = useState(nodeKey);
  const [enabled, setEnabled] = useState<Set<string>>(
    () => createInitialEnabledSet(renderingNodes)
  );

  if (prevNodeKey !== nodeKey) {
    setPrevNodeKey(nodeKey);
    setEnabled(createInitialEnabledSet(renderingNodes));
  }

  if (renderingNodes.length === 0) {
    return null;
  }

  const allEnabled = renderingNodes.every(n => enabled.has(n.nodeId));

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
      renderingNodes.forEach(node => {
        if (enabled.has(node.nodeId)) onToggle(node.nodeId);
      });
      setEnabled(new Set());
    } else {
      renderingNodes.forEach(node => {
        if (!enabled.has(node.nodeId)) onToggle(node.nodeId);
      });
      setEnabled(new Set(renderingNodes.map(n => n.nodeId)));
    }
  };

  const handleToggleLayer = (layer: string) => {
    const layerNodes = renderingNodes.filter(n => n.renderConfig.layer === layer);
    const anyLayerEnabled = layerNodes.some(n => enabled.has(n.nodeId));
    setEnabled(prev => {
      const next = new Set(prev);
      if (anyLayerEnabled) {
        layerNodes.forEach(n => next.delete(n.nodeId));
      } else {
        layerNodes.forEach(n => next.add(n.nodeId));
      }
      return next;
    });
    if (anyLayerEnabled) {
      layerNodes.filter(n => enabled.has(n.nodeId)).forEach(n => onToggle(n.nodeId));
    } else {
      layerNodes.forEach(n => onToggle(n.nodeId));
    }
  };

  const handleToggleTag = (tag: string) => {
    const tagNodes = renderingNodes.filter(n => n.renderConfig.tags?.includes(tag));
    const anyTagEnabled = tagNodes.some(n => enabled.has(n.nodeId));
    setEnabled(prev => {
      const next = new Set(prev);
      if (anyTagEnabled) {
        tagNodes.forEach(n => next.delete(n.nodeId));
      } else {
        tagNodes.forEach(n => next.add(n.nodeId));
      }
      return next;
    });
    if (anyTagEnabled) {
      tagNodes.filter(n => enabled.has(n.nodeId)).forEach(n => onToggle(n.nodeId));
    } else {
      tagNodes.forEach(n => onToggle(n.nodeId));
    }
  };

  const layers = [...new Set(renderingNodes.map(n => n.renderConfig.layer))];
  const allTags = [...new Set(renderingNodes.flatMap(n => n.renderConfig.tags ?? []))];

  return (
    <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 }}>
          Render Nodes
        </div>
        <button
          onClick={handleToggleAll}
          style={{ fontSize: 11, cursor: 'pointer', padding: '2px 6px', background: '#333', color: '#ccc', border: '1px solid #555', borderRadius: 3 }}
        >
          {allEnabled ? 'Disable All' : 'Enable All'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {layers.map(layer => {
          const layerNodes = renderingNodes.filter(n => n.renderConfig.layer === layer);
          const anyLayerEnabled = layerNodes.some(n => enabled.has(n.nodeId));
          return (
            <button
              key={layer}
              onClick={() => handleToggleLayer(layer)}
              style={{ fontSize: 11, cursor: 'pointer', padding: '2px 6px', background: '#333', color: '#ccc', border: '1px solid #555', borderRadius: 3 }}
            >
              {anyLayerEnabled ? `Disable ${layer}` : `Enable ${layer}`}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {allTags.map(tag => {
          const tagNodes = renderingNodes.filter(n => n.renderConfig.tags?.includes(tag));
          const anyTagEnabled = tagNodes.some(n => enabled.has(n.nodeId));
          return (
            <button
              key={tag}
              onClick={() => handleToggleTag(tag)}
              style={{ fontSize: 11, cursor: 'pointer', padding: '2px 6px', background: '#333', color: '#ccc', border: '1px solid #555', borderRadius: 3 }}
            >
              {anyTagEnabled ? `Disable ${tag}` : `Enable ${tag}`}
            </button>
          );
        })}
      </div>



      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {renderingNodes.map(node => (
          <label key={node.nodeId} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input
              type="checkbox"
              checked={enabled.has(node.nodeId)}
              onChange={() => handleToggle(node.nodeId)}
              style={{ cursor: 'pointer' }}
            />
            <span>{node.nodeId}</span>
            <span style={{ fontSize: 11, color: '#888', marginLeft: 'auto' }}>({node.renderConfig.layer})</span>
          </label>
        ))}
      </div>
    </div>
  );
}
