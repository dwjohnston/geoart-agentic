import type { NodeDef } from './types';
import { timeNodeDef }           from './nodes/time.node';
import { orbitNodeDef }          from './nodes/orbit.node';
import { colorPointNodeDef }     from './nodes/colorPoint.node';
import { waveNodeDef }           from './nodes/wave.node';
import { pointsOnALineNodeDef }  from './nodes/pointsOnALine.node';
import { multiplierNodeDef }     from './nodes/multiplier.node';
import { addNodeDef }            from './nodes/add.node';

export const computeRegistry = new Map<string, NodeDef>([
  [timeNodeDef.type,          timeNodeDef],
  [orbitNodeDef.type,         orbitNodeDef],
  [colorPointNodeDef.type,    colorPointNodeDef],
  [waveNodeDef.type,          waveNodeDef],
  [pointsOnALineNodeDef.type, pointsOnALineNodeDef],
  [multiplierNodeDef.type,    multiplierNodeDef],
  [addNodeDef.type,           addNodeDef],
]);
