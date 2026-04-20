import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import type { ValidationError } from './types';

export function validateNoDuplicateIds(graph: GeoArtGraph): ValidationError[] {
  const errors: ValidationError[] = [];
  const seen = new Map<string, string>(); // id → first-seen layer name

  const layers = [
    { layerName: 'control', nodes: graph.control.nodes as { id: string }[] },
    { layerName: 'compute', nodes: graph.compute.nodes as { id: string }[] },
    { layerName: 'render',  nodes: graph.render.nodes  as { id: string }[] },
  ];

  for (const { layerName, nodes } of layers) {
    for (const node of nodes) {
      const existing = seen.get(node.id);
      if (existing !== undefined) {
        errors.push({
          code: 'DUPLICATE_NODE_ID',
          severity: 'error',
          message: `Node id "${node.id}" in ${layerName} layer is already used in the ${existing} layer`,
          nodeId: node.id,
        });
      } else {
        seen.set(node.id, layerName);
      }
    }
  }

  return errors;
}
