import type { GraphLoadPayload } from '../graphEngine/exports';

type Props = {
  renderingNodes: GraphLoadPayload['renderingNodes'];
  onToggle: (nodeId: string) => void;
};

export function RenderToggles({ renderingNodes, onToggle }: Props) {


  if (renderingNodes.length === 0) {
    return null;
  }

  return (
    <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>

      <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Render Nodes
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {renderingNodes.map(node => (
          <label key={node.nodeId} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input
              type="checkbox"
              defaultChecked
              onChange={() => onToggle(node.nodeId)}
              style={{ cursor: 'pointer' }}
            />
            <span>{node.label}</span>
            <span style={{ fontSize: 11, color: '#888', marginLeft: 'auto' }}>({node.layer})</span>
          </label>
        ))}
      </div>
    </div>
  );
}
