import type { RenderNodeDef } from './types';
import { timedLineNodeDef } from './nodes/timedLine.node';

export const renderRegistry = new Map<string, RenderNodeDef>([
  [timedLineNodeDef.type, timedLineNodeDef],
]);
