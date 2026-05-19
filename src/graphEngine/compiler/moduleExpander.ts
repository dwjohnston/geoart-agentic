import type { ModuleDef } from '../../schema/modules/types';

/**
 * A GeoArtGraph that may contain a modules section.
 * After expansion the modules section is removed and its nodes are inlined
 * into the control/compute/render sections.
 */
export type GraphWithModules = {
  version: string;
  title?: string;
  description?: string;
  speed?: number;
  modules?: {
    nodes: Array<{
      id: string;
      type: 'module';
      module: string;
      params?: Record<string, { v?: unknown; ref?: string }>;
    }>;
  };
  control: { nodes: unknown[] };
  compute: { nodes: unknown[] };
  render: { nodes: unknown[] };
};

type AnyParam = { v?: unknown; ref?: string };
type AnyNode = { id: string; type: string; params?: Record<string, AnyParam> };
type AnyRenderNode = AnyNode & { renderConfig?: { layer: 'paint' | 'live' } };

/**
 * Expand all module declarations in a graph into their constituent nodes.
 *
 * Module expansion is purely a graph-rewriting step — no node implementations
 * are touched and the evaluator never sees module declarations.
 *
 * For each module declaration:
 * - Inputs supplied as `{ ref: '...' }` are wired directly to the internal node.
 * - Inputs supplied as `{ v: ... }` or omitted generate a control node whose output
 *   is wired to the internal node.
 * - Any `{ ref: 'moduleId.portName' }` found in the existing control/compute/render
 *   nodes is rewritten to the module's internal ref.
 *
 * Returns a new graph object with the modules section removed and all module nodes
 * inlined, ready to pass to compile().
 */
export function expandModules(
  graph: GraphWithModules,
  registry: Map<string, ModuleDef>,
): GraphWithModules {
  const moduleNodes = graph.modules?.nodes ?? [];
  if (moduleNodes.length === 0) return graph;

  const extraControl: AnyNode[] = [];
  const extraCompute: AnyNode[] = [];
  const extraRender: AnyRenderNode[] = [];

  // Map from 'moduleId.outputPort' → actual internal ref string.
  const refRewriteMap = new Map<string, string>();

  for (const decl of moduleNodes) {
    const moduleDef = registry.get(decl.module);
    if (!moduleDef) {
      throw new Error(`Unknown module "${decl.module}" (declared as id "${decl.id}")`);
    }

    const moduleId = decl.id;
    const userParams = decl.params ?? {};

    // Build resolvedInputs: inputName → ref string that supplies the value.
    const resolvedInputs = new Map<string, string>();

    for (const inputDef of moduleDef.inputs) {
      const userParam = userParams[inputDef.name];

      if (userParam && 'ref' in userParam && userParam.ref !== undefined) {
        // User supplied a ref — wire directly.
        resolvedInputs.set(inputDef.name, userParam.ref);
      } else {
        // User supplied a static value or nothing — generate control node (if defined).
        const controlNodeId = `${moduleId}__${inputDef.name}`;
        resolvedInputs.set(inputDef.name, `${controlNodeId}.value`);

        if (inputDef.controlNode) {
          const controlParams = { ...inputDef.controlNode.defaultParams };
          if (userParam && 'v' in userParam && userParam.v !== undefined) {
            controlParams.value = { v: userParam.v };
          }
          extraControl.push({
            id: controlNodeId,
            type: inputDef.controlNode.type,
            params: controlParams as Record<string, AnyParam>,
          });
        }
        // If no controlNode (e.g. time input), the static default is used as-is
        // but no UI control is materialised.
      }
    }

    // Register output ref rewrites.
    for (const outputDef of moduleDef.outputs) {
      refRewriteMap.set(
        `${moduleId}.${outputDef.name}`,
        outputDef.getInternalRef(moduleId),
      );
    }

    // Expand module nodes into control/compute/render buckets.
    const expanded = moduleDef.buildNodes(moduleId, resolvedInputs);
    for (const node of expanded) {
      if (node.layer === 'control') {
        extraControl.push({ id: node.id, type: node.type, params: node.params as Record<string, AnyParam> });
      } else if (node.layer === 'compute') {
        extraCompute.push({ id: node.id, type: node.type, params: node.params as Record<string, AnyParam> });
      } else {
        extraRender.push({
          id: node.id,
          type: node.type,
          params: node.params as Record<string, AnyParam>,
          renderConfig: node.renderConfig,
        });
      }
    }
  }

  // Rewrite refs in a params map.
  function rewriteParams(params: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== null && typeof val === 'object' && 'ref' in (val as object)) {
        const ref = (val as { ref: string }).ref;
        out[key] = { ref: refRewriteMap.get(ref) ?? ref };
      } else {
        out[key] = val;
      }
    }
    return out;
  }

  function rewriteNode<T extends { params?: Record<string, unknown> }>(node: T): T {
    if (!node.params) return node;
    return { ...node, params: rewriteParams(node.params) };
  }

  return {
    ...graph,
    modules: undefined,
    control: {
      nodes: [
        ...extraControl,
        ...(graph.control.nodes as AnyNode[]).map(rewriteNode),
      ],
    },
    compute: {
      nodes: [
        ...extraCompute,
        ...(graph.compute.nodes as AnyNode[]).map(rewriteNode),
      ],
    },
    render: {
      nodes: [
        ...extraRender,
        ...(graph.render.nodes as AnyRenderNode[]).map(rewriteNode),
      ],
    },
  };
}
