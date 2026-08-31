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

    setTimeout(() => {
      editor.layout();
    }, 1000)
    editorRef.current = editor;

    // Mounting behind `lazy()`/`<Suspense>` means this container appears in
    // the DOM the same tick the editor is created, before the browser has
    // settled the surrounding flex layout. Monaco can measure a stale width
    // at creation time, leaving the text layer out of sync with the gutter/
    // cursor until something triggers a resize. `automaticLayout` only
    // re-measures on a *subsequent* size change, so force one layout pass
    // once the browser has actually painted the final size.
    requestAnimationFrame(() => editor.layout());

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

  return (
    <div>
      {/* Debug aid: forces a layout re-measure without waiting for a resize event. */}
      <button type="button" onClick={() => editorRef.current?.layout()}>
        Relayout editor
      </button>
      {/*
       * `#root` sets `text-align: center` for the app shell. Monaco never
       * resets text-align on its own DOM, so it inherits into every
       * `.view-line` — those are deliberately `width: 100%` (needed for
       * trailing-whitespace selection/decorations past EOL), so centered
       * text drifts right of the cursor, which is positioned by independent
       * pixel math and unaffected by text-align. Cut the cascade here
       * instead of fighting `.view-line`'s width.
       * https://github.com/Microsoft/monaco-editor/issues/1038
       */}
      <div
        ref={containerRef}
        style={{ height, border: '1px solid #333', borderRadius: 4, overflow: 'hidden', textAlign: 'initial' }}
      />
    </div>
  );
}
