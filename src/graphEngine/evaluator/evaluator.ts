/**
 * CANONICAL LEVEL: 🗑️ - 2026-05-14
 */


import type { Value } from '../../schema/types';
import type { CompiledGraph } from '../compiler/compiler';
import type { EvalContext } from './EvalContext';
import type { ComputeNodeEvalContext, LegacyComputeNodeImplementation } from '../../graphEngine/externalInterfaces/ComputeNodeImplementation';
import type { LegacyRenderNodeImplementation } from '../../graphEngine/externalInterfaces/RenderNodeImplementation';
import type { LegacyControlNodeImplementation } from '../../graphEngine/externalInterfaces/ControlNodeImplementation';

// ---------------------------------------------------------------------------
// resolveInput
// ---------------------------------------------------------------------------

/**
 * Resolve the Value for a single input port on a node.
 *
 * Priority order:
 *  1. Incoming edge (look up the source node's cached output).
 *  2. Static param stored in compiled.nodes.
 *  3. Port default defined in the node's def.
 */
export function resolveInput(
  compiled: CompiledGraph,
  nodeId: string,
  portIndex: number,
  cache: Map<string, Value[]>,
): Value {
  // 1a. Check for array-assembled edges (from { v: [{ ref }, { ref }] } declarations).
  const arrayEdges = compiled.edges.filter(
    (e) => e.toNode === nodeId && e.toPort === portIndex && e.arrayIndex !== undefined,
  );
  if (arrayEdges.length > 0) {
    const sorted = [...arrayEdges].sort((a, b) => a.arrayIndex! - b.arrayIndex!);
    const items = sorted.map((e) => {
      const fromOutput = cache.get(e.fromNode);
      if (!fromOutput) {
        throw new Error(
          `resolveInput: no cached output for node "${e.fromNode}" ` +
          `(needed for array element ${e.arrayIndex} of "${nodeId}" port ${portIndex}). ` +
          `This indicates a topological sort failure.`,
        );
      }
      return fromOutput[e.fromPort].v;
    });
    const firstVal = cache.get(sorted[0].fromNode)![sorted[0].fromPort];
    const arrayKind = `${firstVal.kind}Array` as unknown as string;
    return { kind: arrayKind, v: items } as Value;
  }

  // 1b. Check for a single incoming edge.
  const edge = compiled.edges.find(
    (e) => e.toNode === nodeId && e.toPort === portIndex && e.arrayIndex === undefined,
  );
  if (edge) {
    const fromOutput = cache.get(edge.fromNode);
    if (!fromOutput) {
      throw new Error(
        `resolveInput: no cached output for node "${edge.fromNode}" ` +
        `(needed by "${nodeId}" port ${portIndex}). ` +
        `This indicates a topological sort failure.`,
      );
    }
    return fromOutput[edge.fromPort];
  }

  // 2. Fall back to static param.
  const compiledNode = compiled.nodes.get(nodeId)!;
  const def = compiledNode.def;

  // Control nodes have no inputs array — they should never reach here.
  const inputs = (def as LegacyComputeNodeImplementation | LegacyRenderNodeImplementation).inputs;
  if (!inputs || portIndex >= inputs.length) {
    throw new Error(
      `resolveInput: port ${portIndex} out of range for node "${nodeId}"`,
    );
  }
  const portDef = inputs[portIndex];
  const staticParam = compiledNode.params[portDef.name];
  if (staticParam !== undefined) {
    return staticParam;
  }

  // 3. Fall back to port default.
  if (portDef.default !== undefined) {
    return portDef.default as Value;
  }

  throw new Error(
    `resolveInput: no value for port "${portDef.name}" (index ${portIndex}) ` +
    `on node "${nodeId}" — no edge, no static param, and no default.`,
  );
}

// ---------------------------------------------------------------------------
// Dirty propagation
// ---------------------------------------------------------------------------

function propagateDirty(compiled: CompiledGraph): void {
  // Walk nodes in topological order so upstream dirtiness propagates forward.
  for (const nodeId of compiled.sortedNodes) {
    const state = compiled.states.get(nodeId)!;
    if (!state.isDirty) continue;

    // Mark all downstream nodes that receive an edge from this node.
    for (const edge of compiled.edges) {
      if (edge.fromNode !== nodeId) continue;
      compiled.states.get(edge.toNode)!.isDirty = true;
    }
  }
}

// ---------------------------------------------------------------------------
// Per-node evaluation
// ---------------------------------------------------------------------------

function evaluateNode(
  compiled: CompiledGraph,
  nodeId: string,
  cache: Map<string, Value[]>,
  ctx: EvalContext,
): Value[] {
  const compiledNode = compiled.nodes.get(nodeId)!;
  const { def, layer } = compiledNode;

  // ---- Control node -------------------------------------------------------
  if (layer === 'control') {
    const controlDef = def as LegacyControlNodeImplementation;
    // Build ResolvedParams from the compiled static params.
    const resolvedParams: Record<string, { v: unknown }> = {};
    for (const [key, val] of Object.entries(compiledNode.params)) {
      resolvedParams[key] = { v: val.v };
    }
    return controlDef.evaluate(resolvedParams);
  }

  // ---- Compute node -------------------------------------------------------
  if (layer === 'compute') {
    const computeDef = def as LegacyComputeNodeImplementation;
    const inputs: Value[] = computeDef.inputs.map((_, i) =>
      resolveInput(compiled, nodeId, i, cache),
    );
    // Build a scoped EvalContext for this node (getState/setState scoped by id).
    const nodeState = compiled.states.get(nodeId)!;
    const nodeCtx = buildScopedCtx(ctx, nodeState);
    return computeDef.evaluate(inputs, nodeCtx);
  }

  // ---- Render node --------------------------------------------------------
  const renderDef = def as LegacyRenderNodeImplementation;

  // Resolve all inputs for the render node.
  const rawInputs: Value[] = renderDef.inputs.map((_, i) =>
    resolveInput(compiled, nodeId, i, cache),
  );

  // Select the target canvas based on renderConfig.layer.
  const renderLayer = compiledNode.renderConfig?.layer ?? 'paint';
  const targetCanvas = renderLayer === 'live' ? ctx.canvas.live : ctx.canvas.paint;

  const renderNodeState = compiled.states.get(nodeId)! as NodeStateWithExtra;
  renderDef.evaluate(rawInputs, {
    canvas: targetCanvas,
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    getState: <T>() => renderNodeState._nodeLocalState as T | undefined,
    setState: <T>(s: T) => { renderNodeState._nodeLocalState = s; },
  });

  // Render nodes have no outputs.
  return [];
}

// ---------------------------------------------------------------------------
// Scoped EvalContext
// ---------------------------------------------------------------------------

/**
 * Node-local state storage, separate from the tick-level NodeState.
 * Stored as an arbitrary value on the node's state object.
 */
type NodeStateWithExtra = {
  isDirty: boolean;
  lastOutput: Value[];
  lastFiredAt: number;
  _nodeLocalState?: unknown;
};

function buildScopedCtx(
  ctx: EvalContext,
  nodeState: ReturnType<Map<string, NodeStateWithExtra>['get']> & object,
): ComputeNodeEvalContext {
  const state = nodeState as NodeStateWithExtra;
  return {
    tickCount: ctx.tickCount,
    getState<T>(): T {
      return state._nodeLocalState as T;
    },
    setState<T>(s: T): void {
      state._nodeLocalState = s;
    },
  };
}

// ---------------------------------------------------------------------------
// tick()
// ---------------------------------------------------------------------------

/**
 * Evaluate the compiled graph for a single animation frame.
 *
 * @param compiled - The compiled graph (mutated in-place: states updated).
 * @param t        - Tick count since graph start.
 * @param ctx      - Frame context including canvas references.
 */
export function tick(compiled: CompiledGraph, t: number, ctx: EvalContext): void {
  const cache = new Map<string, Value[]>();

  // 1. Mark time-dependant compute nodes dirty.
  for (const nodeId of compiled.sortedNodes) {
    const node = compiled.nodes.get(nodeId)!;
    const def = node.def as LegacyComputeNodeImplementation;
    if (def.isTimeDependant) {
      compiled.states.get(nodeId)!.isDirty = true;
    }
  }

  // 2. Propagate dirtiness forward through edges.
  propagateDirty(compiled);

  // 3. Evaluate in topological order, skipping clean nodes.
  for (const nodeId of compiled.sortedNodes) {
    const state = compiled.states.get(nodeId)!;
    const node = compiled.nodes.get(nodeId)!;

    // For render nodes: decide whether to fire this frame.
    if (node.layer === 'render') {
      const isLive = node.renderConfig?.layer === 'live';

      if (isLive) {
        // Live-layer canvas is cleared every frame — always redraw, no interval.
        state.lastFiredAt = t;
      } else {
        // Paint-layer: rate-limit via intervalTicks.
        let intervalTicks = 6; // sensible default
        try {
          const intervalVal = resolveInput(compiled, nodeId, 0, cache);
          if (intervalVal.kind === 'number') {
            intervalTicks = intervalVal.v;
          }
        } catch {
          // Port 0 may not exist on all render nodes — use default.
        }

        if (t - state.lastFiredAt < intervalTicks) {
          cache.set(nodeId, state.lastOutput);
          continue;
        }
        state.lastFiredAt = t;
      }
    }

    // Check if render node is enabled.
    if (node.layer === 'render' && ctx.enabledRenderNodes && !ctx.enabledRenderNodes.has(nodeId)) {
      cache.set(nodeId, state.lastOutput);
      continue;
    }

    // Live-layer render nodes always run (canvas was cleared this frame).
    // Paint-layer render nodes and compute/control nodes skip if not dirty.
    const isLiveRender = node.layer === 'render' && node.renderConfig?.layer === 'live';
    if (!state.isDirty && !isLiveRender) {
      cache.set(nodeId, state.lastOutput);
      continue;
    }

    const output = evaluateNode(compiled, nodeId, cache, ctx);
    state.lastOutput = output;
    state.isDirty = false;
    cache.set(nodeId, output);
  }
}
