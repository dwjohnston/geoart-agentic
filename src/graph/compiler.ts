import type { GeoArtGraph, Edge } from '../schema/_generated/schema-types';
import type { Value } from './types';
import type { NodeDef } from '../compute/types';
import type { RenderNodeDef } from '../render/types';
import type { ControlNodeDef } from '../control/types';
import { computeRegistry } from '../compute/registry';
import { renderRegistry } from '../render/registry';
import { controlRegistry } from '../control/registry';

/** Layer tag used to enforce direction constraints at compile time. */
type Layer = 'control' | 'compute' | 'render';

/** Union of all node definition shapes. */
type AnyNodeDef = NodeDef | RenderNodeDef | ControlNodeDef;

/**
 * A single compiled node entry — pairs a definition with its static params
 * and records which layer it belongs to.
 */
type CompiledNode = {
  def: AnyNodeDef;
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
  /** All edges from both compute.edges and render.edges, flattened. */
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
    // Treat as enum/string — store as number NaN placeholder; compute nodes
    // that accept enum values cast to string themselves.
    // Actually, string params don't map to Value — they are consumed differently.
    // For now return a number with NaN so callers that don't use it won't crash.
    return { kind: 'number', v: Number.NaN };
  }
  if (typeof inner === 'object' && inner !== null) {
    const obj = inner as Record<string, unknown>;
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
 * Keys whose values cannot be mapped (e.g. string/boolean params) are
 * silently skipped — the evaluator falls back to the port default for those.
 */
function buildParams(rawParams: Record<string, unknown>): Record<string, Value> {
  const out: Record<string, Value> = {};
  for (const [key, val] of Object.entries(rawParams)) {
    if (val === null || val === undefined) continue;
    const envelope = val as { v: unknown };
    // Skip array and boolean values — they aren't representable as Value.
    if (Array.isArray(envelope.v) || typeof envelope.v === 'boolean') continue;
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
 * - Edges that violate layer ordering (render → compute, etc.)
 * - Cycles in the graph
 */
export function compile(graph: GeoArtGraph): CompiledGraph {
  const nodes = new Map<string, CompiledNode>();

  // ------------------------------------------------------------------
  // 1. Register control nodes
  // ------------------------------------------------------------------
  for (const node of graph.control.nodes) {
    const def = controlRegistry.get(node.type);
    if (!def) {
      throw new Error(`Unknown control node type: "${node.type}" (id: "${node.id}")`);
    }
    const rawParams = (node.params ?? {}) as Record<string, unknown>;
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
    const def = computeRegistry.get(node.type);
    if (!def) {
      throw new Error(`Unknown compute node type: "${node.type}" (id: "${node.id}")`);
    }
    const rawParams = (node.params ?? {}) as Record<string, unknown>;
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
    const def = renderRegistry.get(node.type);
    if (!def) {
      throw new Error(`Unknown render node type: "${node.type}" (id: "${node.id}")`);
    }
    const rawParams = (node.params ?? {}) as Record<string, unknown>;
    nodes.set(node.id, {
      def,
      layer: 'render',
      params: buildParams(rawParams),
      renderConfig: { layer: node.renderConfig.layer },
    });
  }

  // ------------------------------------------------------------------
  // 4. Collect all edges into one flat array
  // ------------------------------------------------------------------
  const allEdges: Edge[] = [...graph.compute.edges, ...graph.render.edges];

  // ------------------------------------------------------------------
  // 5. Validate layer direction on edges
  // ------------------------------------------------------------------
  for (const edge of allEdges) {
    const fromNode = nodes.get(edge.fromNode);
    const toNode = nodes.get(edge.toNode);

    if (!fromNode) {
      throw new Error(
        `Edge references unknown source node "${edge.fromNode}"`,
      );
    }
    if (!toNode) {
      throw new Error(
        `Edge references unknown target node "${edge.toNode}"`,
      );
    }

    const fromOrder = layerOrder[fromNode.layer];
    const toOrder = layerOrder[toNode.layer];

    if (fromOrder > toOrder) {
      throw new Error(
        `Illegal backwards edge: ${edge.fromNode} (${fromNode.layer}) → ` +
          `${edge.toNode} (${toNode.layer}). ` +
          `Edges may only flow control → compute → render.`,
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
