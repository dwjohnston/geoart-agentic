import { useState } from 'react';
import type { GRAPHS } from '../algorithms/index';
import { GraphView } from './GraphView';
import { Modal } from './Modal';

type BundledGraphEntry = (typeof GRAPHS)[number];

export type AlgorithmEntry = BundledGraphEntry & { source: 'bundled' | 'imported' };

type Props = {
  algorithms: readonly AlgorithmEntry[];
  defaultId: string;
  onChange: (id: string) => void;
  onImportClick: () => void;
};

export function AlgorithmPicker({ algorithms, defaultId, onChange, onImportClick }: Props) {
  const [selectedId, setSelectedId] = useState(defaultId);
  const [showGraphView, setShowGraphView] = useState(false);
  const current = algorithms.find(g => g.id === selectedId);
  const currentName = current?.name ?? selectedId;

  const bundled = algorithms.filter(a => a.source === 'bundled');
  const imported = algorithms.filter(a => a.source === 'imported');

  const bundledByFolder = bundled.reduce<Record<string, AlgorithmEntry[]>>((acc, entry) => {
    const f = entry.folder ?? '';
    (acc[f] ??= []).push(entry);
    return acc;
  }, {});

  function formatFolderLabel(folder: string): string {
    return folder.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  function handleChange(id: string) {
    setSelectedId(id);
    onChange(id);
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 13, color: '#aaa' }}>Graph</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <select
            value={selectedId}
            onChange={e => handleChange(e.target.value)}
            style={{
              flex: 1,
              background: '#1a1a26',
              color: '#eee',
              border: '1px solid #333',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {Object.entries(bundledByFolder).map(([folder, entries]) => (
              <optgroup key={folder} label={formatFolderLabel(folder)}>
                {entries.map(entry => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </optgroup>
            ))}
            {imported.length > 0 && (
              <optgroup label="Imported">
                {imported.map(entry => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <button
            onClick={onImportClick}
            title="Import algorithm"
            style={{
              background: '#1a1a26',
              border: '1px solid #333',
              borderRadius: 4,
              color: '#aaa',
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
          >
            Import
          </button>
          <button
            onClick={() => setShowGraphView(true)}
            title="View graph structure"
            style={{
              background: '#1a1a26',
              border: '1px solid #333',
              borderRadius: 4,
              color: '#aaa',
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
          >
            View graph
          </button>
        </div>
      </div>

      <h2 style={{ margin: 0, fontSize: 16, color: '#eee' }}>
        {currentName}
        {current?.source === 'imported' && (
          <span style={{ fontSize: 11, color: '#5af', marginLeft: 8, fontWeight: 'normal' }}>
            imported
          </span>
        )}
      </h2>

      {showGraphView && current && (
        <Modal onClose={() => setShowGraphView(false)}>
          <GraphView graph={current.graph} />
        </Modal>
      )}
    </>
  );
}
