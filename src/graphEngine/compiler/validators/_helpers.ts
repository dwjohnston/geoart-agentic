import type { GeoArtGraph } from '../../../schema/_generated/schema-types';
import type { NodeDef } from '../../../nodes/compute/defineComputeNode';
import type { LegacyControlNodeDef } from '../../../nodes/control/types';
import type { LegacyRenderNodeDef } from '../../../nodes/render/types';
import { computeRegistry } from '../../../nodes/compute/registry';
import { controlRegistry } from '../../../nodes/control/registry';
import { renderRegistry } from '../../../nodes/render/registry';

export type RawEdge = {
  fromNodeId: string;
  fromPortName: string;
  toNodeId: string;
  toPortName: string;
};

export type NodeLayer = 'control' | 'compute' | 'render';
export type AnyNodeDef = NodeDef | LegacyControlNodeDef | LegacyRenderNodeDef;
export type NodeEntry = { layer: NodeLayer; def: AnyNodeDef };

/** Extract all { ref: "nodeId.portName" } params from all nodes in the graph. */
export function parseRefs(graph: GeoArtGraph): RawEdge[] {
  const edges: RawEdge[] = [];
  const allNodes = [
    ...graph.control.nodes,
    ...graph.compute.nodes,
    ...graph.render.nodes,
  ];
  for (const node of allNodes) {
    const params = (node.params ?? {}) as Record<string, unknown>;
    for (const [paramName, paramValue] of Object.entries(params)) {
      if (paramValue !== null && typeof paramValue === 'object' && 'ref' in paramValue) {
        const ref = (paramValue as { ref: string }).ref;
        const dotIndex = ref.indexOf('.');
        if (dotIndex !== -1) {
          edges.push({
            fromNodeId: ref.slice(0, dotIndex),
            fromPortName: ref.slice(dotIndex + 1),
            toNodeId: node.id,
            toPortName: paramName,
          });
        }
      }
    }
  }
  return edges;
}

/** Build a map of node id → { layer, def } by consulting all three registries. */
export function buildNodeMap(graph: GeoArtGraph): Map<string, NodeEntry> {
  const map = new Map<string, NodeEntry>();
  for (const node of graph.control.nodes) {
    const def = controlRegistry.get(node.type);
    if (def) map.set(node.id, { layer: 'control', def });
  }
  for (const node of graph.compute.nodes) {
    const def = computeRegistry.get(node.type);
    if (def) map.set(node.id, { layer: 'compute', def });
  }
  for (const node of graph.render.nodes) {
    const def = renderRegistry.get(node.type);
    if (def) map.set(node.id, { layer: 'render', def });
  }
  return map;
}
