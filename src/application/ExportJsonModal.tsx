import { useState } from 'react';
import { Modal } from './Modal';
import type { GeoArtGraph } from '../schema/_generated/schema-types';

type Props = {
  graph: GeoArtGraph;
  onClose: () => void;
};

export function ExportJsonModal({ graph, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(graph, null, 2);

  function handleCopy() {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Modal title="Export JSON" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={handleCopy}
          style={{
            alignSelf: 'flex-start',
            background: '#2a2a3a',
            color: copied ? '#5af' : '#eee',
            border: '1px solid #444',
            borderRadius: 4,
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
        <textarea
          readOnly
          value={json}
          style={{
            boxSizing: 'border-box',
            width: '100%',
            minHeight: 400,
            background: '#111',
            color: '#aef',
            border: '1px solid #333',
            borderRadius: 4,
            padding: 12,
            fontFamily: 'monospace',
            fontSize: 12,
            resize: 'vertical',
          }}
        />
      </div>
    </Modal>
  );
}
