import { convertComputeNodeDefinitionToLegacyDefinition } from './implementComputeNode';
import type { ComputeNodeDef, LegacyComputeNodeDef } from '../../graphEngine/externalInterfaces/ComputeNodeDefinition';
import { timeNodeDef } from './nodes/time.node';
import { orbitNodeDef } from './nodes/orbit.node';
import { colorPointNodeDef } from './nodes/colorPointCompute.node';
import { waveNodeDef } from './nodes/wave.node';
import { pointsOnALineNodeDef } from './nodes/pointsOnALine.node';
import { multiplierNodeDef } from './nodes/multiplier.node';
import { addNodeImplementation } from './nodes/add.node';
import { colorShiftNodeDef } from './nodes/colorShift.node';
import type { ComputeNodeKinds } from '../../schema/typeHelpers';
import { curveModulatorNodeDef } from './nodes/curveModulator.node';

export const computeRegistry = new Map<string, LegacyComputeNodeDef>([
  [timeNodeDef.type, timeNodeDef],
  ...([orbitNodeDef, colorPointNodeDef, waveNodeDef, pointsOnALineNodeDef, multiplierNodeDef, addNodeImplementation, curveModulatorNodeDef, colorShiftNodeDef] as Array<ComputeNodeDef<ComputeNodeKinds>>).map((v) => {
    return [v.nodeKind, convertComputeNodeDefinitionToLegacyDefinition(v)] as [string, LegacyComputeNodeDef]
  })

]);
