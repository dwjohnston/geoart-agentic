import type { LegacyRenderNodeDef, RenderNodeDef } from '../../graphEngine/externalInterfaces/RenderNodeDefinition';
import { convertRenderNodeDefToLegacy } from './implementRenderNode';
import type { RenderNodeKinds } from '../../schema/typeHelpers';

const modules = import.meta.glob<{ default: RenderNodeDef<RenderNodeKinds> }>(
  './nodes/*.node.ts',
  { eager: true }
);

export const renderRegistry = new Map<string, LegacyRenderNodeDef>(
  Object.values(modules).map((module) => {
    const def = module.default as RenderNodeDef<RenderNodeKinds>;
    return [def.nodeKind, convertRenderNodeDefToLegacy(def)] as [string, LegacyRenderNodeDef];
  })
);
