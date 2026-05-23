import { useState } from 'react';
import { Modal } from './Modal';
import { validateGeoArtGraph } from '../schema/validateGeoArtGraph';
import { tryCompileGraph } from '../graphEngine/graphEngine/tryCompileGraph';
import { useAlgorithmStorage } from './algorithmStorage/AlgorithmStorageContext';
import type { GeoArtGraph } from '../schema/_generated/schema-types';
import type { StoredAlgorithmEntry } from './algorithmStorage/IAlgorithmStorageService';

type Props = {
  onClose: () => void;
  onImported: (entry: StoredAlgorithmEntry) => void;
};

export function ImportAlgorithmModal({ onClose, onImported }: Props) {
  const storage = useAlgorithmStorage();
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setErrors([]);
    setSubmitting(true);

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setErrors([`JSON parse error: ${e instanceof Error ? e.message : String(e)}`]);
      setSubmitting(false);
      return;
    }

    // const schemaResult = validateGeoArtGraph(parsed);
    // if (!schemaResult) {
    //   setErrors(['has errors']);
    //   setSubmitting(false);
    //   return;
    // }

    const compileResult = tryCompileGraph(parsed as GeoArtGraph);
    if (!compileResult.success) {
      setErrors([`Compiler error: ${compileResult.error}`]);
      setSubmitting(false);
      return;
    }

    try {
      const entry = await storage.saveAlgorithm(parsed as GeoArtGraph);
      onImported(entry);
      onClose();
    } catch (e) {
      setErrors([`Save error: ${e instanceof Error ? e.message : String(e)}`]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Import Algorithm" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ fontSize: 13, color: '#aaa' }}>
          Paste a JSON algorithm definition below:
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={12}
          spellCheck={false}
          style={{
            background: '#111',
            color: '#eee',
            border: '1px solid #333',
            borderRadius: 4,
            padding: 8,
            fontSize: 13,
            fontFamily: 'monospace',
            resize: 'vertical',
          }}
        />
        {errors.length > 0 && (
          <div
            role="alert"
            style={{
              background: '#2a1a1a',
              border: '1px solid #a33',
              borderRadius: 4,
              padding: '8px 12px',
              fontSize: 13,
              color: '#f88',
            }}
          >
            {errors.map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid #444',
              borderRadius: 4,
              color: '#aaa',
              padding: '6px 16px',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            style={{
              background: '#3a5a8a',
              border: 'none',
              borderRadius: 4,
              color: '#eee',
              padding: '6px 16px',
              cursor: submitting || !text.trim() ? 'not-allowed' : 'pointer',
              fontSize: 14,
              opacity: submitting || !text.trim() ? 0.6 : 1,
            }}
          >
            {submitting ? 'Importing…' : 'Import'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
