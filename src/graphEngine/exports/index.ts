// Graph engine public entry point.
// This is the only module permitted to import from all three node zones.

export { compile } from '../compiler/compiler';
export type { CompiledGraph } from '../compiler/compiler';

export { tick } from '../evaluator/evaluator';

export { createGraphEngine } from '../graphEngine/graphEngine';
export type { GraphEngine, GraphLoadPayload } from '../graphEngine/graphEngine';

export { implementComputeNode, convertComputeNodeImplementationToLegacy } from '../../nodes/compute/implementComputeNode';
export { implementRenderNode, convertRenderNodeImplementationToLegacy } from '../../nodes/render/implementRenderNode';
export { implementControlNode, convertControlNodeImplementationToLegacy } from '../../nodes/control/implementControlNode';

export { computeRegistry } from '../../nodes/compute/registry';
export { renderRegistry } from '../../nodes/render/registry';
export { controlRegistry } from '../../nodes/control/registry';

export type { LegacyNodeRegistry } from '../externalInterfaces/AllNodeImplementations';

import { computeRegistry } from '../../nodes/compute/registry';
import { renderRegistry } from '../../nodes/render/registry';
import { controlRegistry } from '../../nodes/control/registry';
import type { LegacyNodeRegistry } from '../externalInterfaces/AllNodeImplementations';

export const realNodeRegistry: LegacyNodeRegistry = {
  computeRegistry,
  renderRegistry,
  controlRegistry,
};
