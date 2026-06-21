// Generates registry.generated.ts for compute, render, and control nodes,
// replacing import.meta.glob (Vite-only) with static imports compatible with bun test.
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateComputeRegistryContent(nodeBasenames: string[]): string {
  const imports = nodeBasenames
    .map((b) => `import ${b} from './nodes/${b}';`)
    .join('\n');
  const moduleList = nodeBasenames.join(', ');

  return `// AUTO-GENERATED — do not edit by hand. Run \`bun generate:registries\` to regenerate.
import { convertComputeNodeImplementationToLegacy } from './implementComputeNode';
import type { ComputeNodeImplementation, LegacyComputeNodeImplementation } from '../../graphEngine/externalInterfaces/ComputeNodeImplementation';
import type { ComputeNodeKinds } from '../../schema/typeHelpers';
${imports}

export const computeRegistry = new Map<string, LegacyComputeNodeImplementation>(
  [${moduleList}].map((def) => {
    if ('nodeKind' in def) {
      return [def.nodeKind, convertComputeNodeImplementationToLegacy(def as ComputeNodeImplementation<ComputeNodeKinds>)] as [string, LegacyComputeNodeImplementation];
    }
    return [(def as LegacyComputeNodeImplementation).type, def as LegacyComputeNodeImplementation] as [string, LegacyComputeNodeImplementation];
  })
);
`;
}

export function generateRenderRegistryContent(nodeBasenames: string[]): string {
  const imports = nodeBasenames
    .map((b) => `import ${b} from './nodes/${b}';`)
    .join('\n');
  const moduleList = nodeBasenames.join(', ');

  return `// AUTO-GENERATED — do not edit by hand. Run \`bun generate:registries\` to regenerate.
import type { LegacyRenderNodeImplementation, RenderNodeImplementation } from '../../graphEngine/externalInterfaces/RenderNodeImplementation';
import { convertRenderNodeImplementationToLegacy } from './implementRenderNode';
import type { RenderNodeKinds } from '../../schema/typeHelpers';
${imports}

export const renderRegistry = new Map<string, LegacyRenderNodeImplementation>(
  [${moduleList}].map((def) => {
    const typedDef = def as RenderNodeImplementation<RenderNodeKinds>;
    return [typedDef.nodeKind, convertRenderNodeImplementationToLegacy(typedDef)] as [string, LegacyRenderNodeImplementation];
  })
);
`;
}

export function generateControlRegistryContent(nodeBasenames: string[]): string {
  const imports = nodeBasenames
    .map((b) => `import ${b} from './nodes/${b}';`)
    .join('\n');
  const moduleList = nodeBasenames.join(', ');

  return `// AUTO-GENERATED — do not edit by hand. Run \`bun generate:registries\` to regenerate.
import type { LegacyControlNodeImplementation, ControlNodeImplementation } from '../../graphEngine/externalInterfaces/ControlNodeImplementation';
import { convertControlNodeImplementationToLegacy } from './implementControlNode';
import type { ControlNodeKinds } from '../../schema/typeHelpers';
${imports}

export const controlRegistry = new Map<string, LegacyControlNodeImplementation>(
  [${moduleList}].map((def) => {
    const typedDef = def as ControlNodeImplementation<ControlNodeKinds>;
    return [typedDef.nodeKind, convertControlNodeImplementationToLegacy(typedDef)] as [string, LegacyControlNodeImplementation];
  })
);
`;
}

// Module node files are named after their module kind (e.g. `orbit-module.tsx`),
// so the registry key is derived directly from the filename. The hyphenated
// basename is camelCased to form a valid import identifier.
function toIdentifier(basename: string): string {
  return basename.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function generateModuleRegistryContent(nodeBasenames: string[]): string {
  const imports = nodeBasenames
    .map((b) => `import ${toIdentifier(b)} from './nodes/${b}';`)
    .join('\n');
  const entries = nodeBasenames
    .map((b) => `  ['${b}', ${toIdentifier(b)}],`)
    .join('\n');

  return `// AUTO-GENERATED — do not edit by hand. Run \`bun generate:registries\` to regenerate.
import type { ModuleRegistry } from '../../graphEngine/externalInterfaces/ModuleImplementation';
${imports}

export const moduleRegistry: ModuleRegistry = new Map([
${entries}
] as Parameters<ModuleRegistry['set']>[]);
`;
}

function scanNodeFiles(dir: string, ext: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext) && !f.includes('.test.') && !f.includes('.snapshot.'))
    .sort()
    .map((f) => path.basename(f, ext));
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const nodesDir = path.resolve(__dirname, '..');

  const computeBasenames = scanNodeFiles(path.join(nodesDir, 'compute/nodes'), '.ts');
  const renderBasenames = scanNodeFiles(path.join(nodesDir, 'render/nodes'), '.ts');
  const controlBasenames = scanNodeFiles(path.join(nodesDir, 'control/nodes'), '.tsx');
  const moduleBasenames = scanNodeFiles(path.join(nodesDir, 'module/nodes'), '.tsx');

  fs.writeFileSync(
    path.join(nodesDir, 'compute/registry.generated.ts'),
    generateComputeRegistryContent(computeBasenames)
  );
  fs.writeFileSync(
    path.join(nodesDir, 'render/registry.generated.ts'),
    generateRenderRegistryContent(renderBasenames)
  );
  fs.writeFileSync(
    path.join(nodesDir, 'control/registry.generated.ts'),
    generateControlRegistryContent(controlBasenames)
  );
  fs.writeFileSync(
    path.join(nodesDir, 'module/registry.generated.ts'),
    generateModuleRegistryContent(moduleBasenames)
  );

  console.log('Generated registry files.');
}
