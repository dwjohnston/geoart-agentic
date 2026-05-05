import type { LegacyRenderNodeDef, RenderNodeDef } from '../../graphEngine/externalInterfaces/RenderNodeDefinition';
import { convertRenderNodeDefToLegacy } from './defineRenderNode';
import type { RenderNodeKinds } from '../../schema/typeHelpers';
import { timedLineNodeDef } from './nodes/timedLine.node';
import { timedLineArrayNodeDef } from './nodes/timedLineArray.node';
import { circleNodeDef } from './nodes/circle.node';

export const renderRegistry = new Map<string, LegacyRenderNodeDef>(
  ([timedLineNodeDef, timedLineArrayNodeDef, circleNodeDef] as Array<RenderNodeDef<RenderNodeKinds>>)
    .map(v => [v.nodeKind, convertRenderNodeDefToLegacy(v)] as [string, LegacyRenderNodeDef])
);
