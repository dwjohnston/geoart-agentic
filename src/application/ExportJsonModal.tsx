import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Modal } from './Modal';
import type { GeoArtGraph } from '../schema/_generated/schema-types';
import { graphToBuilderCode } from '../schema/builderCodegen';

type Props = {
  graph: GeoArtGraph;
  onClose: () => void;
};

type Tab = 'json' | 'typescript';

export function ExportJsonModal({ graph, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>('json');
  const json = JSON.stringify(graph, null, 2);

  const builderCode = useMemo(() => {
    try {
      return { code: graphToBuilderCode(graph), error: null as string | null };
    } catch (err) {
      return { code: null as string | null, error: err instanceof Error ? err.message : String(err) };
    }
  }, [graph]);

  const activeText = tab === 'json' ? json : (builderCode.code ?? '');

  function handleCopy() {
    navigator.clipboard.writeText(activeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function tabButtonStyle(isActive: boolean): CSSProperties {
    return {
      background: isActive ? '#3a5a8a' : '#2a2a3a',
      color: '#eee',
      border: '1px solid #444',
      borderRadius: 4,
      padding: '6px 14px',
      cursor: 'pointer',
      fontSize: 13,
    };
  }

  return (
    <Modal title="Export JSON" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('json')} style={tabButtonStyle(tab === 'json')}>
            JSON
          </button>
          <button onClick={() => setTab('typescript')} style={tabButtonStyle(tab === 'typescript')}>
            TypeScript
          </button>
        </div>
        <button
          onClick={handleCopy}
          disabled={tab === 'typescript' && builderCode.error !== null}
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
        {tab === 'typescript' && builderCode.error !== null ? (
          <div
            style={{
              boxSizing: 'border-box',
              width: '100%',
              minHeight: 400,
              background: '#111',
              color: '#e88',
              border: '1px solid #333',
              borderRadius: 4,
              padding: 12,
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          >
            Failed to generate TypeScript: {builderCode.error}
          </div>
        ) : (
          <textarea
            readOnly
            value={activeText}
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
        )}
      </div>
    </Modal>
  );
}
