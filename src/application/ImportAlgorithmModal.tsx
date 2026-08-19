import { lazy, Suspense, useState } from 'react';
import type { CSSProperties } from 'react';
import { Modal } from './Modal';
import { tryCompileGraph } from '../graphEngine/exports';
import { useAlgorithmStorage } from './algorithmStorage/AlgorithmStorageContext';
import type { GeoArtGraph } from '../schema/_generated/schema-types';
import type { StoredAlgorithmEntry } from './algorithmStorage/IAlgorithmStorageService';

type Props = {
  onClose: () => void;
  onImported: (entry: StoredAlgorithmEntry) => void;
};

type Tab = 'json' | 'typescript';

// Monaco and the TypeScript compiler are large (multi-MB) dependencies only
// needed once a user actually opens the TypeScript tab — load them on demand
// rather than bundling them into the app's eager main entry chunk.
const TypeScriptCodeEditor = lazy(() =>
  import('./TypeScriptCodeEditor').then(m => ({ default: m.TypeScriptCodeEditor }))
);

const TS_STARTER = `new AlgorithmBuilder()
  .addControlNode({
    id: 'speed',
    type: 'slider',
    params: {
      label: { v: 'Speed' },
      min: { v: 0 },
      max: { v: 5 },
      value: { v: 1 },
    },
  })
  .construct();
`;

export function ImportAlgorithmModal({ onClose, onImported }: Props) {
  const storage = useAlgorithmStorage();
  const [tab, setTab] = useState<Tab>('json');
  const [jsonText, setJsonText] = useState('');
  const [tsText, setTsText] = useState(TS_STARTER);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function compileJson(): { success: true; graph: GeoArtGraph } | { success: false; error: string } {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      return { success: false, error: `JSON parse error: ${e instanceof Error ? e.message : String(e)}` };
    }

    const compileResult = tryCompileGraph(parsed);
    if (!compileResult.success) {
      return { success: false, error: compileResult.error };
    }

    return { success: true, graph: parsed as GeoArtGraph };
  }

  async function handleSubmit() {
    setErrors([]);
    setSubmitting(true);

    const result =
      tab === 'json'
        ? compileJson()
        : await import('./compileTypeScriptToGraph').then(m => m.compileTypeScriptToGraph(tsText));
    if (!result.success) {
      setErrors([result.error]);
      setSubmitting(false);
      return;
    }

    try {
      const entry = await storage.saveAlgorithm(result.graph);
      onImported(entry);
      onClose();
    } catch (e) {
      setErrors([`Save error: ${e instanceof Error ? e.message : String(e)}`]);
    } finally {
      setSubmitting(false);
    }
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

  const isEmpty = tab === 'json' ? !jsonText.trim() : !tsText.trim();

  return (
    <Modal title="Import Algorithm" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('json')} style={tabButtonStyle(tab === 'json')}>
            JSON
          </button>
          <button onClick={() => setTab('typescript')} style={tabButtonStyle(tab === 'typescript')}>
            TypeScript
          </button>
        </div>

        {tab === 'json' ? (
          <>
            <label style={{ fontSize: 13, color: '#aaa' }}>
              Paste a JSON algorithm definition below:
            </label>
            <textarea
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
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
          </>
        ) : (
          <>
            <label style={{ fontSize: 13, color: '#aaa' }}>
              Write an algorithm using <code>AlgorithmBuilder</code> (available as a global — no import needed).
              End the script with an expression, e.g. <code>builder.construct()</code>:
            </label>
            <Suspense
              fallback={
                <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 13, border: '1px solid #333', borderRadius: 4 }}>
                  Loading editor…
                </div>
              }
            >
              <TypeScriptCodeEditor value={tsText} onChange={setTsText} height={400} />
            </Suspense>
          </>
        )}

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
              whiteSpace: 'pre-wrap',
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
            disabled={submitting || isEmpty}
            style={{
              background: '#3a5a8a',
              border: 'none',
              borderRadius: 4,
              color: '#eee',
              padding: '6px 16px',
              cursor: submitting || isEmpty ? 'not-allowed' : 'pointer',
              fontSize: 14,
              opacity: submitting || isEmpty ? 0.6 : 1,
            }}
          >
            {submitting ? 'Importing…' : 'Import'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
