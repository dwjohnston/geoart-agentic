// Graph engine public entry point.
// This is the only module permitted to import from all three node zones.

import { compile } from "../compiler/compiler";
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
import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import { validateGeoArtGraph } from '../../schema/validateGeoArtGraph';

export const realNodeRegistry: LegacyNodeRegistry = {
  computeRegistry,
  renderRegistry,
  controlRegistry,
};

export type CompileResult = { success: true } | { success: false; error: string };

export function tryCompileGraph(graph: unknown): CompileResult {
  if (!validateGeoArtGraph(graph)) {
    return { success: false, error: 'Graph does not match schema' };
  }

  try {
    compile(graph as GeoArtGraph, { computeRegistry, renderRegistry, controlRegistry });
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}
