import { useEffect, useRef } from 'react';
import { ensureMonacoConfigured, getOrCreateUserModel, monaco } from './monacoSetup';

type Props = {
  value: string;
  onChange: (value: string) => void;
  height?: number | string;
};

/**
 * A self-contained Monaco-based TypeScript editor, pre-wired with real
 * autocomplete and type-checking against `AlgorithmBuilder` (exposed as an
 * ambient global — no import statement needed in user code). Runs fully
 * offline: Monaco and its web workers are bundled locally, no CDN involved.
 *
 * Controlled component: `value` / `onChange` behave like a textarea's.
 */
export function TypeScriptCodeEditor({ value, onChange, height = 400 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const modelRef = useRef<monaco.editor.ITextModel | null>(null);
  // Tracks whether the last model change came from this component's own
  // setValue call (driven by a `value` prop update) so the onChange handler
  // below doesn't feed it straight back into the parent redundantly.
  const lastPushedValueRef = useRef<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    ensureMonacoConfigured();

    if (!containerRef.current) return;

    // The model is a long-lived singleton (see getOrCreateUserModel) so it
    // survives this component unmounting/remounting — only the editor view
    // below is torn down on cleanup.
    const model = getOrCreateUserModel(value);
    if (model.getValue() !== value) {
      model.setValue(value);
    }
    modelRef.current = model;
    lastPushedValueRef.current = model.getValue();

    const editor = monaco.editor.create(containerRef.current, {
      model,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 13,
      scrollBeyondLastLine: false,
    });
    editorRef.current = editor;

    const subscription = model.onDidChangeContent(() => {
      const next = model.getValue();
      lastPushedValueRef.current = next;
      onChangeRef.current(next);
    });

    return () => {
      subscription.dispose();
      editor.dispose();
      // Intentionally not disposing `model` — it's a page-lifetime singleton,
      // see getOrCreateUserModel's doc comment for why.
      editorRef.current = null;
      modelRef.current = null;
    };
    // Mount/unmount only — `value` updates after the initial mount are
    // synced via the effect below rather than tearing the editor down.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the model in sync with external `value` changes (e.g. the parent
  // resetting the field) without clobbering the user's cursor position on
  // every keystroke-driven update that originated from this same editor.
  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;
    if (value === lastPushedValueRef.current) return;
    lastPushedValueRef.current = value;
    model.setValue(value);
  }, [value]);

  return <div ref={containerRef} style={{ height, border: '1px solid #333', borderRadius: 4, overflow: 'hidden' }} />;
}
