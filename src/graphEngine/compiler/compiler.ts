/**
 * CANONICAL LEVEL: 🗑️ - 2026-05-14
 */


import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import type { Value } from '../../schema/types';
import type { LegacyComputeNodeImplementation, LegacyComputeNodePortImplementation } from '../../graphEngine/externalInterfaces/ComputeNodeImplementation';
import type { LegacyRenderNodeImplementation } from '../../graphEngine/externalInterfaces/RenderNodeImplementation';
import type { LegacyControlNodeImplementation } from '../../graphEngine/externalInterfaces/ControlNodeImplementation';

import type { LegacyNodeRegistry } from '../externalInterfaces/AllNodeImplementations';

/** Layer tag used to enforce direction constraints at compile time. */
type Layer = 'control' | 'compute' | 'render';

/** Union of all node definition shapes. */
type AnyNodeImplementation = LegacyComputeNodeImplementation | LegacyRenderNodeImplementation | LegacyControlNodeImplementation;

/**
 * Internal edge representation — produced by the compiler from inline param refs
 * and used by the evaluator for fast input resolution.
 *
 * When `arrayIndex` is set, this edge contributes one element of an array-valued
 * input assembled from individual refs: `{ v: [{ ref: "a.x" }, { ref: "b.x" }] }`.
 */
type Edge = {
  fromNode: string;
  fromPort: number;
  toNode: string;
  toPort: number;
  /** Present when this edge supplies element [arrayIndex] of an array-valued port. */
  arrayIndex?: number;
};

/**
 * A single compiled node entry — pairs a definition with its static params
 * and records which layer it belongs to.
 */
type CompiledNode = {
  def: AnyNodeImplementation;
  layer: Layer;
  /** Static params from the serialised graph, keyed by param name. */
  params: Record<string, Value>;
  /** Which canvas layer to draw to — only set for render nodes. */
  renderConfig?: { layer: 'paint' | 'live' };
};

/** Per-node mutable evaluation state, reset/updated on each tick. */
type NodeState = {
  isDirty: boolean;
  lastOutput: Value[];
  /** Milliseconds timestamp of the last render-node fire (render nodes only). */
  lastFiredAt: number;
};

/** The result of compiling a GeoArtGraph — consumed every frame by tick(). */
export type CompiledGraph = {
  /** Node IDs in topological order (sources first). */
  sortedNodes: string[];
  nodes: Map<string, CompiledNode>;
  /** Internal edges derived from inline param refs. */
  edges: Edge[];
  states: Map<string, NodeState>;
};

// ---------------------------------------------------------------------------
// Param conversion helpers
// ---------------------------------------------------------------------------

/**
 * Convert a serialised param value (a `{ v: ... }` envelope) into an internal
 * Value. The param's type is determined by the shape of `v`.
 */
function paramToValue(v: unknown): Value {
  if (v === null || v === undefined) {
    throw new Error('Param value is null or undefined');
  }
  const raw = v as { v: unknown };
  const inner = raw.v;
  if (typeof inner === 'number') {
    return { kind: 'number', v: inner };
  }
  if (typeof inner === 'string') {
    return { kind: 'string', v: inner };
  }
  if (Array.isArray(inner)) {
    const items = inner as Array<unknown>;
    if (items.length === 0) {
      throw new Error(`Cannot determine array item type for empty array`);
    }

    // Convert each array item (handling both wrapped and raw items)
    const convertedItems: Value[] = [];
    for (const item of items) {
      if (typeof item === 'object' && item !== null && 'v' in item) {
        // Item is wrapped with { v: ... }, convert recursively
        convertedItems.push(paramToValue(item));
      } else {
        throw new Error(
          `Array item must be wrapped with { v: ... }: ${JSON.stringify(item)}. ` +
          `Received: ${JSON.stringify(v)}`
        );
      }
    }

    // All items must have the same kind
    const firstKind = convertedItems[0].kind;
    if (!convertedItems.every((item) => item.kind === firstKind)) {
      throw new Error(
        `Array items have mixed kinds: ${convertedItems
          .map((v) => v.kind)
          .join(', ')}. All array items must be the same type.`
      );
    }

    // Build array value kind dynamically from item kind
    const arrayKind = `${firstKind}Array` as unknown as string;
    return {
      kind: arrayKind,
      v: convertedItems.map((item) => item.v),
    } as Value;
  }
  if (typeof inner === 'object' && inner !== null) {
    const obj = inner as Record<string, unknown>;
    if ('x' in obj && 'y' in obj && 'r' in obj && 'g' in obj && 'b' in obj && 'a' in obj) {
      return {
        kind: 'colorPoint',
        v: {
          x: obj['x'] as number,
          y: obj['y'] as number,
          dx: (obj['dx'] as number) ?? 0,
          dy: (obj['dy'] as number) ?? 0,
          r: obj['r'] as number,
          g: obj['g'] as number,
          b: obj['b'] as number,
          a: obj['a'] as number,
        },
      };
    }
    if ('r' in obj && 'g' in obj && 'b' in obj && 'a' in obj) {
      return {
        kind: 'color',
        v: {
          r: obj['r'] as number,
          g: obj['g'] as number,
          b: obj['b'] as number,
          a: obj['a'] as number,
        },
      };
    }
    if ('x' in obj && 'y' in obj) {
      return { kind: 'point', v: { x: obj['x'] as number, y: obj['y'] as number } };
    }
  }
  throw new Error(`Cannot convert param value to internal Value: ${JSON.stringify(v)}`);
}

/**
 * Convert all params from a serialised node into the internal Value map.
 * Params with a `ref` key (dynamic references) are skipped — they will be
 * resolved via edges at eval time. Keys whose values cannot be mapped (e.g.
 * string/boolean params) are also silently skipped — the evaluator falls back
 * to the port default for those.
 */
function buildParams(rawParams: Record<string, unknown>): Record<string, Value> {
  const out: Record<string, Value> = {};
  for (const [key, val] of Object.entries(rawParams)) {
    if (val === null || val === undefined) continue;
    const envelope = val as { v?: unknown; ref?: unknown };
    // Skip ref params — they're handled by edge resolution.
    if ('ref' in envelope) continue;
    // Skip boolean values — they aren't representable as Value.
    if (typeof envelope.v === 'boolean') continue;
    try {
      out[key] = paramToValue(val);
    } catch {
      // Non-mappable param — skip; port default will be used.
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Topological sort
// ---------------------------------------------------------------------------

/**
 * Kahn's algorithm topological sort.
 * Throws if a cycle is detected.
 */
function topologicalSort(nodeIds: string[], edges: Edge[]): string[] {
  // Build adjacency and in-degree maps.
  const inDegree = new Map<string, number>();
  const dependants = new Map<string, string[]>(); // node → nodes that depend on it

  for (const id of nodeIds) {
    inDegree.set(id, 0);
    dependants.set(id, []);
  }

  for (const edge of edges) {
    const { fromNode, toNode } = edge;
    // Only count edges between nodes we know about.
    if (!inDegree.has(fromNode) || !inDegree.has(toNode)) continue;
    inDegree.set(toNode, (inDegree.get(toNode) ?? 0) + 1);
    dependants.get(fromNode)!.push(toNode);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    sorted.push(id);
    for (const dep of dependants.get(id) ?? []) {
      const newDeg = (inDegree.get(dep) ?? 1) - 1;
      inDegree.set(dep, newDeg);
      if (newDeg === 0) queue.push(dep);
    }
  }

  if (sorted.length !== nodeIds.length) {
    throw new Error(
      `Graph contains a cycle — could not sort all nodes. ` +
      `Sorted ${sorted.length} of ${nodeIds.length}.`,
    );
  }

  return sorted;
}

// ---------------------------------------------------------------------------
// Layer ordering helpers
// ---------------------------------------------------------------------------

const layerOrder: Record<Layer, number> = { control: 0, compute: 1, render: 2 };

// ---------------------------------------------------------------------------
// compile()
// ---------------------------------------------------------------------------

/**
 * Compile a validated GeoArtGraph into a CompiledGraph ready for tick().
 *
 * Throws a descriptive error for any of:
 * - Unknown node type strings
 * - Param refs that point to non-existent nodes or ports
 * - Edges that violate layer ordering (render → compute, etc.)
 * - Cycles in the graph
 */
export function compile(graph: GeoArtGraph, nodeRegistry: LegacyNodeRegistry): CompiledGraph {
  const nodes = new Map<string, CompiledNode>();
  // Raw (unparsed) params per node — needed for ref scanning below.
  const rawParamsByNodeId = new Map<string, Record<string, unknown>>();

  // ------------------------------------------------------------------
  // 1. Register control nodes
  // ------------------------------------------------------------------
  for (const node of graph.control.nodes) {
    const def = nodeRegistry.controlRegistry.get(node.type);
    if (!def) {
      throw new Error(`Unknown control node type: "${node.type}" (id: "${node.id}")`);
    }
    const rawParams = (node.params ?? {}) as Record<string, unknown>;
    rawParamsByNodeId.set(node.id, rawParams);
    nodes.set(node.id, {
      def,
      layer: 'control',
      params: buildParams(rawParams),
    });
  }

  // ------------------------------------------------------------------
  // 2. Register compute nodes
  // ------------------------------------------------------------------
  for (const node of graph.compute.nodes) {
    const def = nodeRegistry.computeRegistry.get(node.type);
    if (!def) {
      throw new Error(`Unknown compute node type: "${node.type}" (id: "${node.id}")`);
    }
    const rawParams = (node.params ?? {}) as Record<string, unknown>;
    rawParamsByNodeId.set(node.id, rawParams);
    nodes.set(node.id, {
      def,
      layer: 'compute',
      params: buildParams(rawParams),
    });
  }

  // ------------------------------------------------------------------
  // 3. Register render nodes
  // ------------------------------------------------------------------
  for (const node of graph.render.nodes) {
    const def = nodeRegistry.renderRegistry.get(node.type);
    if (!def) {
      throw new Error(`Unknown render node type: "${node.type}" (id: "${node.id}")`);
    }
    const rawParams = (node.params ?? {}) as Record<string, unknown>;
    rawParamsByNodeId.set(node.id, rawParams);
    nodes.set(node.id, {
      def,
      layer: 'render',
      params: buildParams(rawParams),
      renderConfig: { layer: node.renderConfig.layer },
    });
  }

  // ------------------------------------------------------------------
  // 4. Scan params for {ref: "nodeId.portName"} and build internal edges
  // ------------------------------------------------------------------
  const allEdges: Edge[] = [];

  for (const [toNodeId, compiledNode] of nodes.entries()) {
    const { def } = compiledNode;
    // Control nodes have no inputs — skip.
    const inputs = ((def as LegacyComputeNodeImplementation).inputs ?? (def as LegacyRenderNodeImplementation).inputs) as
      | LegacyComputeNodePortImplementation[]
      | undefined;
    if (!inputs) continue;

    const rawParams = rawParamsByNodeId.get(toNodeId) ?? {};

    for (let toPort = 0; toPort < inputs.length; toPort++) {
      const portName = inputs[toPort].name;
      const rawParam = rawParams[portName];

      if (rawParam === null || rawParam === undefined) continue;
      if (typeof rawParam !== 'object') continue;

      // Helper to resolve a single ref string into an edge.
      const resolveRef = (ref: string, context: string, arrayIndex?: number) => {
        const dotIndex = ref.indexOf('.');
        if (dotIndex === -1) {
          throw new Error(
            `Invalid ref "${ref}" on "${context}": expected format "nodeId.portName"`,
          );
        }
        const fromNodeId = ref.slice(0, dotIndex);
        const fromPortName = ref.slice(dotIndex + 1);

        const fromCompiledNode = nodes.get(fromNodeId);
        if (!fromCompiledNode) {
          throw new Error(`Ref "${ref}" on "${context}": unknown source node "${fromNodeId}"`);
        }

        const fromDef = fromCompiledNode.def as LegacyComputeNodeImplementation | LegacyControlNodeImplementation | LegacyRenderNodeImplementation;
        const fromOutputs = fromDef.outputs ?? [];
        const fromPort = fromOutputs.findIndex((p) => p.name === fromPortName);
        if (fromPort === -1) {
          throw new Error(
            `Ref "${ref}" on "${context}": node "${fromNodeId}" has no output port named "${fromPortName}"`,
          );
        }

        allEdges.push({ fromNode: fromNodeId, fromPort, toNode: toNodeId, toPort, arrayIndex });
      };

      const context = `"${toNodeId}.${portName}"`;

      // Case 1: direct ref — { ref: "nodeId.portName" }
      if ('ref' in rawParam) {
        resolveRef((rawParam as { ref: string }).ref, context);
        continue;
      }

      // Case 2: array of refs — { v: [{ ref: "..." }, ...] }
      const envelope = rawParam as { v?: unknown };
      if (Array.isArray(envelope.v)) {
        const items = envelope.v as Array<unknown>;
        for (let arrayIndex = 0; arrayIndex < items.length; arrayIndex++) {
          const item = items[arrayIndex];
          if (typeof item !== 'object' || item === null || !('ref' in item)) continue;
          resolveRef((item as { ref: string }).ref, `${context}[${arrayIndex}]`, arrayIndex);
        }
        continue;
      }
    }
  }

  // ------------------------------------------------------------------
  // 5. Validate layer direction on edges
  // ------------------------------------------------------------------
  for (const edge of allEdges) {
    const fromNode = nodes.get(edge.fromNode)!;
    const toNode = nodes.get(edge.toNode)!;

    const fromOrder = layerOrder[fromNode.layer];
    const toOrder = layerOrder[toNode.layer];

    if (fromOrder > toOrder) {
      throw new Error(
        `Illegal backwards ref: ${edge.fromNode} (${fromNode.layer}) → ` +
        `${edge.toNode} (${toNode.layer}). ` +
        `Data may only flow control → compute → render.`,
      );
    }
  }

  // ------------------------------------------------------------------
  // 6. Topological sort
  // ------------------------------------------------------------------
  const allIds = Array.from(nodes.keys());
  const sortedNodes = topologicalSort(allIds, allEdges);

  // ------------------------------------------------------------------
  // 7. Build initial state entries
  // ------------------------------------------------------------------
  const states = new Map<string, NodeState>();
  for (const id of allIds) {
    states.set(id, {
      isDirty: true, // treat everything as dirty on first tick
      lastOutput: [],
      lastFiredAt: -Infinity,
    });
  }

  return { sortedNodes, nodes, edges: allEdges, states };
}
