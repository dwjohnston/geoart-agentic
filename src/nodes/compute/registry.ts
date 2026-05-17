import { convertComputeNodeDefinitionToLegacyDefinition } from './implementComputeNode';
import type { ComputeNodeDef, LegacyComputeNodeDef } from '../../graphEngine/externalInterfaces/ComputeNodeDefinition';
import type { ComputeNodeKinds } from '../../schema/typeHelpers';

const modules = import.meta.glob<{ default: ComputeNodeDef<ComputeNodeKinds> | LegacyComputeNodeDef }>(
  './nodes/*.node.ts',
  { eager: true }
);

export const computeRegistry = new Map<string, LegacyComputeNodeDef>(
  Object.values(modules).map((module) => {
    const def = module.default;
    if ('nodeKind' in def) {
      return [def.nodeKind, convertComputeNodeDefinitionToLegacyDefinition(def as ComputeNodeDef<ComputeNodeKinds>)] as [string, LegacyComputeNodeDef];
    }
    return [(def as LegacyComputeNodeDef).type, def as LegacyComputeNodeDef] as [string, LegacyComputeNodeDef];
  })
);
