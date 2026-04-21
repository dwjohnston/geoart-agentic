import type { NodeDef } from './types';
import { timeNodeDef }       from './nodes/time.node';
import { orbitNodeDef }      from './nodes/orbit.node';
import { colorPointNodeDef } from './nodes/colorPoint.node';

export const computeRegistry = new Map<string, NodeDef>([
  [timeNodeDef.type,       timeNodeDef],
  [orbitNodeDef.type,      orbitNodeDef],
  [colorPointNodeDef.type, colorPointNodeDef],
]);
