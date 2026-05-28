import { useState } from 'react';
import type { NodeRepresentationProps } from '../graphEngine/externalInterfaces/graphViewTypes';

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'object') {
    const str = JSON.stringify(value);
    return str.length > 32 ? str.slice(0, 29) + '…' : str;
  }
  return String(value);
}

export function DefaultNodeBody({ nodeId, inputs, inputPorts, outputPorts, onRefHover, onOutputPortHover }: NodeRepresentationProps) {
  const [hoveredInputPort, setHoveredInputPort] = useState<string | null>(null);
  const [hoveredOutputPort, setHoveredOutputPort] = useState<string | null>(null);

  const hasInputs = inputPorts.length > 0;
  const hasOutputs = outputPorts.length > 0;

  if (!hasInputs && !hasOutputs) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {inputPorts.map(port => {
        const descriptor = inputs[port.name];
        return (
          <div key={port.name} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ color: '#777', fontFamily: 'monospace', fontSize: 10, minWidth: 60 }}>
              {port.name}
            </span>
            {descriptor?.kind === 'static' && (
              <span style={{ color: '#e8d44d', fontFamily: 'monospace', fontSize: 10 }}>
                {formatValue(descriptor.value)}
              </span>
            )}
            {descriptor?.kind === 'default' && (
              <span style={{ color: '#e8d44d', fontFamily: 'monospace', fontSize: 10, opacity: 0.7 }}>
                {formatValue(descriptor.value)}
              </span>
            )}
            {descriptor?.kind === 'ref' && (
              <span
                style={{
                  color: hoveredInputPort === port.name ? '#fff' : '#4fc3f7',
                  fontFamily: 'monospace',
                  fontSize: 10,
                  opacity: hoveredInputPort === port.name ? 1 : 0.7,
                  cursor: 'default',
                  transition: 'color 0.1s, opacity 0.1s',
                }}
                onMouseEnter={() => { setHoveredInputPort(port.name); onRefHover?.(descriptor.ref.split('.')[0]); }}
                onMouseLeave={() => { setHoveredInputPort(null); onRefHover?.(null); }}
              >
                ↩ {descriptor.ref}
              </span>
            )}
          </div>
        );
      })}

      {hasOutputs && (
        <div style={{ borderTop: '1px solid #555', margin: '4px -8px 0', padding: '4px 8px 2px', background: 'rgba(255, 255, 255, 0.04)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {outputPorts.map(port => (
            <div key={port.name} style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'flex-end' }}>
              <span
                style={{
                  color: hoveredOutputPort === port.name ? '#fff' : '#e8d44d',
                  fontFamily: 'monospace',
                  fontSize: 10,
                  opacity: hoveredOutputPort === port.name ? 1 : 0.7,
                  cursor: 'default',
                  transition: 'color 0.1s, opacity 0.1s',
                }}
                onMouseEnter={() => { setHoveredOutputPort(port.name); onOutputPortHover?.(`${nodeId}.${port.name}`); }}
                onMouseLeave={() => { setHoveredOutputPort(null); onOutputPortHover?.(null); }}
              >
                {port.name} ↪
              </span>
              <div
                data-port-id={`output:${nodeId}:${port.name}`}
                title={`${port.name}: ${port.valueKind}`}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#e8d44d',
                  border: '2px solid #c8b43d',
                  flexShrink: 0,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
