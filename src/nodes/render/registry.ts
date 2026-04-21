import type { RenderNodeDef } from './types';
import { timedLineNodeDef } from './nodes/timedLine.node';
import { circleNodeDef } from './nodes/circle.node';

export const renderRegistry = new Map<string, RenderNodeDef>([
  [timedLineNodeDef.type, timedLineNodeDef],
  [circleNodeDef.type, circleNodeDef],
]);
