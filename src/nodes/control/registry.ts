import type { LegacyControlNodeDef, ControlNodeDef } from '../../graphEngine/externalInterfaces/ControlNodeDefinition';
import { convertControlNodeDefToLegacy } from './implementControlNode';
import type { ControlNodeKinds } from '../../schema/typeHelpers';

const modules = import.meta.glob<{ default: ControlNodeDef<ControlNodeKinds> }>(
  './nodes/*.tsx',
  { eager: true }
);

export const controlRegistry = new Map<string, LegacyControlNodeDef>(
  Object.values(modules).map((module) => {
    const def = module.default as ControlNodeDef<ControlNodeKinds>;
    return [def.nodeKind, convertControlNodeDefToLegacy(def)] as [string, LegacyControlNodeDef];
  })
);
