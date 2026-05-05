import type { RenderNodeDef } from './types';
import { timedLineNodeDef } from './nodes/timedLine.node';
import { timedLineArrayNodeDef } from './nodes/timedLineArray.node';
import { circleNodeDef } from './nodes/circle.node';
import { lineThroughPointNodeDef } from './nodes/lineThroughPoint.node';

export const renderRegistry = new Map<string, RenderNodeDef>([
  [timedLineNodeDef.type, timedLineNodeDef],
  [timedLineArrayNodeDef.type, timedLineArrayNodeDef],
  [circleNodeDef.type, circleNodeDef],
  [lineThroughPointNodeDef.type, lineThroughPointNodeDef],
]);
