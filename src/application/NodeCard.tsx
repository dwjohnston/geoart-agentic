import type { InputDescriptor, NodeRepresentationProps, PortSchemaMeta, RenderRepresentationFn } from '../graphEngine/externalInterfaces/graphViewTypes';

type NodeCardProps = {
  nodeId: string;
  nodeKind: string;
  layerKind: 'control' | 'compute' | 'render';
  inputs: Record<string, InputDescriptor>;
  inputPorts: PortSchemaMeta[];
  outputPorts: PortSchemaMeta[];
  renderBody: RenderRepresentationFn;
  isActive: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  isRefHighlighted: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onRefHover: (nodeId: string | null) => void;
  onOutputPortHover: (portRef: string | null) => void;
};

const LAYER_COLOURS: Record<string, string> = {
  control: '#2a3a1a',
  compute: '#1a2a3a',
  render: '#3a1a2a',
};

const LAYER_TITLE_COLOURS: Record<string, string> = {
  control: '#8bc34a',
  compute: '#4fc3f7',
  render: '#f48fb1',
};

export function NodeCard({ nodeId, nodeKind, layerKind, inputs, inputPorts, outputPorts, renderBody, isActive, isHighlighted, isDimmed, isRefHighlighted, onMouseEnter, onMouseLeave, onRefHover, onOutputPortHover }: NodeCardProps) {
  const props: NodeRepresentationProps = { nodeId, nodeKind, inputs, inputPorts, outputPorts, onRefHover, onOutputPortHover };

  const borderColor = isActive ? LAYER_TITLE_COLOURS[layerKind] ?? '#fff'
    : isHighlighted ? '#666'
    : '#444';

  return (
    <div
      data-testid={`node-card-${nodeId}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 4,
        marginBottom: 8,
        background: LAYER_COLOURS[layerKind] ?? '#1a1a2e',
        minWidth: 200,
        maxWidth: 280,
        opacity: isDimmed ? 0.25 : 1,
        boxShadow: isRefHighlighted ? `0 0 0 2px #fff, 0 0 10px 2px rgba(255,255,255,0.3)` : 'none',
        transition: 'opacity 0.15s, border-color 0.15s, box-shadow 0.1s',
      }}
    >
      {/* Title bar */}
      <div
        style={{
          background: 'rgba(0,0,0,0.3)',
          padding: '3px 8px',
          borderRadius: '4px 4px 0 0',
          borderBottom: '1px solid #333',
          fontSize: 11,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
        }}
      >
        <span style={{ color: LAYER_TITLE_COLOURS[layerKind] ?? '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}>
          {nodeKind}
        </span>
        <span style={{ color: '#555', fontFamily: 'monospace', fontSize: 10 }}>{nodeId}</span>
      </div>

      {/* Content area */}
      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 28 }}>
        {/* Input handles (left side) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            padding: '6px 4px',
            gap: 4,
          }}
        >
          {inputPorts.map(port => {
            const descriptor = inputs[port.name];
            const isConnected = descriptor?.kind === 'ref';
            return (
              <div
                key={port.name}
                data-port-id={`input:${nodeId}:${port.name}`}
                title={`${port.name}: ${port.valueKind}`}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: isConnected ? '#4fc3f7' : '#444',
                  border: `2px solid ${isConnected ? '#7dd6f7' : '#666'}`,
                  flexShrink: 0,
                  cursor: 'default',
                }}
              />
            );
          })}
        </div>

        {/* Inner body */}
        <div style={{ flex: 1, padding: '4px 8px', fontSize: 11, overflow: 'hidden' }}>
          {renderBody(props)}
        </div>

      </div>
    </div>
  );
}
