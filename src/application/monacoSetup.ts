/**
 * Shared, idempotent Monaco Editor bootstrap.
 *
 * - Configures `self.MonacoEnvironment` so Monaco's web workers are loaded from
 *   the bundle (via Vite's `?worker` import) instead of being fetched from a CDN.
 * - Registers the real source of `AlgorithmBuilder` (and everything it
 *   transitively imports) as Monaco "extra libs", so the TypeScript language
 *   service inside the editor gives real autocomplete/type-checking against
 *   the actual builder — with zero drift, since the content is pulled straight
 *   from the source files via Vite's `?raw` import suffix.
 * - Exposes `AlgorithmBuilder` as an ambient global so user code doesn't need
 *   an explicit import statement.
 *
 * Everything here is safe to call more than once (e.g. the component mounting
 * twice under React StrictMode) — guarded by a module-level flag.
 */
import * as monaco from 'monaco-editor';
// NOTE: monaco-editor's package.json `exports` map already prefixes bare
// subpaths with `esm/vs/` (`"./*": "./esm/vs/*.js"`), so the correct
// specifiers here omit that prefix — `monaco-editor/esm/vs/editor/...` would
// resolve to the (nonexistent) `esm/vs/esm/vs/editor/...`.
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import TsWorker from 'monaco-editor/language/typescript/ts.worker?worker';

import builderSrc from '../schema/builder.ts?raw';
import typeHelpersSrc from '../schema/typeHelpers.ts?raw';
import schemaTypesSrc from '../schema/_generated/schema-types.d.ts?raw';
import nodeInputsSrc from '../schema/_generated/node-inputs-2.ts?raw';
import nodeOutputsSrc from '../schema/_generated/node-outputs-2.ts?raw';
import valueKindsSrc from '../schema/_generated/value-kinds-2.ts?raw';

// Virtual project root all extra libs (and the user's editable model) live
// under. Keeping everything in one directory means the real relative import
// specifiers in the source files (`./typeHelpers`, `./_generated/schema-types`,
// etc.) resolve exactly as they do in the real project.
export const VIRTUAL_SCHEMA_DIR = 'file:///schema';
export const USER_MODEL_PATH = `${VIRTUAL_SCHEMA_DIR}/userAlgorithm.ts`;

const ambientGlobalsSrc = `import { AlgorithmBuilder as _AlgorithmBuilder } from "./builder";
declare global {
  const AlgorithmBuilder: typeof _AlgorithmBuilder;
}
export {};
`;

let initialized = false;

/**
 * Configures the Monaco environment and registers the AlgorithmBuilder
 * extra libs. Safe to call multiple times — only runs once.
 */
export function ensureMonacoConfigured(): void {
  if (initialized) return;
  initialized = true;

  self.MonacoEnvironment = {
    getWorker(_moduleId: string, label: string) {
      if (label === 'typescript' || label === 'javascript') {
        return new TsWorker();
      }
      return new EditorWorker();
    },
  };

  // NOTE: as of monaco-editor 0.56, `monaco.languages.typescript` is
  // deprecated in favor of a new top-level `monaco.typescript` namespace.
  const tsDefaults = monaco.typescript.typescriptDefaults;

  tsDefaults.setCompilerOptions({
    target: monaco.typescript.ScriptTarget.ES2020,
    module: monaco.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    allowNonTsExtensions: true,
  });

  tsDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  tsDefaults.addExtraLib(builderSrc, `${VIRTUAL_SCHEMA_DIR}/builder.ts`);
  tsDefaults.addExtraLib(typeHelpersSrc, `${VIRTUAL_SCHEMA_DIR}/typeHelpers.ts`);
  tsDefaults.addExtraLib(schemaTypesSrc, `${VIRTUAL_SCHEMA_DIR}/_generated/schema-types.d.ts`);
  tsDefaults.addExtraLib(nodeInputsSrc, `${VIRTUAL_SCHEMA_DIR}/_generated/node-inputs-2.ts`);
  tsDefaults.addExtraLib(nodeOutputsSrc, `${VIRTUAL_SCHEMA_DIR}/_generated/node-outputs-2.ts`);
  tsDefaults.addExtraLib(valueKindsSrc, `${VIRTUAL_SCHEMA_DIR}/_generated/value-kinds-2.ts`);
  tsDefaults.addExtraLib(ambientGlobalsSrc, `${VIRTUAL_SCHEMA_DIR}/algorithm-builder-globals.d.ts`);
}

/**
 * Returns the singleton editable model for the user's code, creating it on
 * first call. The model is intentionally never disposed for the lifetime of
 * the page — only the editor *view* attached to it is torn down when
 * `TypeScriptCodeEditor` unmounts.
 *
 * This matters: Monaco's TS worker syncs model content to the language
 * service keyed by URI + a per-model version counter. If a model at
 * `USER_MODEL_PATH` were disposed and later recreated (e.g. the component
 * unmounting/remounting), the new model's version counter restarts from 1,
 * which can collide with a version number the worker already has cached for
 * the old model — causing it to silently keep serving stale diagnostics for
 * the new content. Keeping one long-lived model sidesteps that entirely.
 */
export function getOrCreateUserModel(initialValue: string): monaco.editor.ITextModel {
  const uri = monaco.Uri.parse(USER_MODEL_PATH);
  const existing = monaco.editor.getModel(uri);
  if (existing) return existing;
  return monaco.editor.createModel(initialValue, 'typescript', uri);
}

export { monaco };
