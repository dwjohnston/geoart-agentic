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
import { convertComputeNodeDefinitionToLegacyDefinition } from './implementComputeNode';
import type { ComputeNodeDef, LegacyComputeNodeDef } from '../../graphEngine/externalInterfaces/ComputeNodeDefinition';
import type { ComputeNodeKinds } from '../../schema/typeHelpers';
${imports}

export const computeRegistry = new Map<string, LegacyComputeNodeDef>(
  [${moduleList}].map((def) => {
    if ('nodeKind' in def) {
      return [def.nodeKind, convertComputeNodeDefinitionToLegacyDefinition(def as ComputeNodeDef<ComputeNodeKinds>)] as [string, LegacyComputeNodeDef];
    }
    return [(def as LegacyComputeNodeDef).type, def as LegacyComputeNodeDef] as [string, LegacyComputeNodeDef];
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
import type { LegacyRenderNodeDef, RenderNodeDef } from '../../graphEngine/externalInterfaces/RenderNodeDefinition';
import { convertRenderNodeDefToLegacy } from './implementRenderNode';
import type { RenderNodeKinds } from '../../schema/typeHelpers';
${imports}

export const renderRegistry = new Map<string, LegacyRenderNodeDef>(
  [${moduleList}].map((def) => {
    const typedDef = def as RenderNodeDef<RenderNodeKinds>;
    return [typedDef.nodeKind, convertRenderNodeDefToLegacy(typedDef)] as [string, LegacyRenderNodeDef];
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
import type { LegacyControlNodeDef, ControlNodeDef } from '../../graphEngine/externalInterfaces/ControlNodeDefinition';
import { convertControlNodeDefToLegacy } from './implementControlNode';
import type { ControlNodeKinds } from '../../schema/typeHelpers';
${imports}

export const controlRegistry = new Map<string, LegacyControlNodeDef>(
  [${moduleList}].map((def) => {
    const typedDef = def as ControlNodeDef<ControlNodeKinds>;
    return [typedDef.nodeKind, convertControlNodeDefToLegacy(typedDef)] as [string, LegacyControlNodeDef];
  })
);
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

  console.log('Generated registry files.');
}
