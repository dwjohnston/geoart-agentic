import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import type { NodeDef } from '../../nodes/compute/types';
import type { RenderNodeDef } from '../../nodes/render/types';
import type { ValidationError } from './types';
import { parseRefs, buildNodeMap, type AnyNodeDef, type NodeLayer } from './_helpers';

const layerOrder: Record<NodeLayer, number> = { control: 0, compute: 1, render: 2 };

function getOutputs(def: AnyNodeDef): { name: string; type: string }[] {
  return (def.outputs ?? []) as { name: string; type: string }[];
}

function getInputs(def: AnyNodeDef): { name: string; type: string }[] | undefined {
  if ('inputs' in def) {
    return ((def as NodeDef | RenderNodeDef).inputs) as { name: string; type: string }[];
  }
  return undefined;
}

export function validateRefs(graph: GeoArtGraph): ValidationError[] {
  const errors: ValidationError[] = [];
  const nodeMap = buildNodeMap(graph);
  const edges = parseRefs(graph);

  for (const { fromNodeId, fromPortName, toNodeId, toPortName } of edges) {
    // 1. Source node must exist
    const fromEntry = nodeMap.get(fromNodeId);
    if (!fromEntry) {
      errors.push({
        code: 'UNKNOWN_REF_NODE',
        severity: 'error',
        message: `Ref "${fromNodeId}.${fromPortName}" on "${toNodeId}.${toPortName}": unknown source node "${fromNodeId}"`,
        nodeId: toNodeId,
        paramName: toPortName,
      });
      continue;
    }

    // 2. Source output port must exist
    const fromPort = getOutputs(fromEntry.def).find(p => p.name === fromPortName);
    if (!fromPort) {
      errors.push({
        code: 'UNKNOWN_REF_PORT',
        severity: 'error',
        message: `Ref "${fromNodeId}.${fromPortName}" on "${toNodeId}.${toPortName}": node "${fromNodeId}" has no output port named "${fromPortName}"`,
        nodeId: toNodeId,
        paramName: toPortName,
      });
      continue;
    }

    const toEntry = nodeMap.get(toNodeId);
    if (!toEntry) continue; // unknown target node type — caught by schema validation

    // 3. Layer direction: data may only flow control → compute → render
    if (layerOrder[fromEntry.layer] > layerOrder[toEntry.layer]) {
      errors.push({
        code: 'LAYER_VIOLATION',
        severity: 'error',
        message: `Illegal ref: "${fromNodeId}" (${fromEntry.layer}) → "${toNodeId}" (${toEntry.layer}). Data may only flow control → compute → render`,
        nodeId: toNodeId,
        paramName: toPortName,
      });
      // Continue to also report type mismatches if present
    }

    // 4. Port type must match
    const toInputs = getInputs(toEntry.def);
    if (toInputs) {
      const toPort = toInputs.find(p => p.name === toPortName);
      if (toPort && toPort.type !== fromPort.type) {
        errors.push({
          code: 'TYPE_MISMATCH',
          severity: 'error',
          message: `Type mismatch on "${toNodeId}.${toPortName}": expected "${toPort.type}" but ref "${fromNodeId}.${fromPortName}" provides "${fromPort.type}"`,
          nodeId: toNodeId,
          paramName: toPortName,
        });
      }
    }
  }

  return errors;
}
