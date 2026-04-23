import type { Value, PointValue, ColorPointValue, ColorPointArrayValue } from './types';
import type { CompiledGraph } from './compiler';
import type { EvalContext } from './EvalContext';
import type { NodeDef } from '../nodes/compute/types';
import type { RenderNodeDef } from '../nodes/render/types';
import type { ControlNodeDef } from '../nodes/control/types';

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
  // 1. Check for an incoming edge.
  const edge = compiled.edges.find(
    (e) => e.toNode === nodeId && e.toPort === portIndex,
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
  const inputs = (def as NodeDef | RenderNodeDef).inputs;
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
// Coordinate scaling for render nodes
// ---------------------------------------------------------------------------

/**
 * Scale a normalised point (-1..1) to canvas pixel coordinates.
 * Canvas origin is the centre of the viewport; positive y is up.
 */
function normalisedToCanvas(
  v: { x: number; y: number },
  width: number,
  height: number,
): { x: number; y: number } {
  return {
    x: (v.x * 0.5 + 0.5) * width,
    // y-flip: normalised +1 is top, canvas y grows downward.
    y: (1 - (v.y * 0.5 + 0.5)) * height,
  };
}

/**
 * Apply the normalised-to-canvas coordinate transform to all `point`-type
 * inputs in the resolved input array, for render nodes only.
 */
function scalePointInputs(inputs: Value[], width: number, height: number): Value[] {
  return inputs.map((val) => {
    if (val.kind === 'point') {
      return {
        kind: 'point',
        v: normalisedToCanvas(val.v, width, height),
      } satisfies PointValue;
    }
    if (val.kind === 'colorPoint') {
      const scaled = normalisedToCanvas({ x: val.v.x, y: val.v.y }, width, height);
      return {
        kind: 'colorPoint',
        v: { ...val.v, x: scaled.x, y: scaled.y },
      } satisfies ColorPointValue;
    }
    if (val.kind === 'colorPointArray') {
      return {
        kind: 'colorPointArray',
        v: val.v.map(p => {
          const scaled = normalisedToCanvas({ x: p.x, y: p.y }, width, height);
          return { ...p, x: scaled.x, y: scaled.y };
        }),
      } satisfies ColorPointArrayValue;
    }
    return val;
  });
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
    const controlDef = def as ControlNodeDef;
    // Build ResolvedParams from the compiled static params.
    const resolvedParams: Record<string, { v: unknown }> = {};
    for (const [key, val] of Object.entries(compiledNode.params)) {
      resolvedParams[key] = { v: val.v };
    }
    return controlDef.evaluate(resolvedParams);
  }

  // ---- Compute node -------------------------------------------------------
  if (layer === 'compute') {
    const computeDef = def as NodeDef;
    const inputs: Value[] = computeDef.inputs.map((_, i) =>
      resolveInput(compiled, nodeId, i, cache),
    );
    // Build a scoped EvalContext for this node (getState/setState scoped by id).
    const nodeState = compiled.states.get(nodeId)!;
    const nodeCtx = buildScopedCtx(ctx, nodeState);
    return computeDef.evaluate(inputs, nodeCtx);
  }

  // ---- Render node --------------------------------------------------------
  const renderDef = def as RenderNodeDef;

  // Resolve all inputs for the render node.
  const rawInputs: Value[] = renderDef.inputs.map((_, i) =>
    resolveInput(compiled, nodeId, i, cache),
  );

  // intervalTicks is port 0 — used for scheduling (already checked before this call).
  // Scale all point inputs from normalised space to canvas pixels.
  const scaledInputs = scalePointInputs(
    rawInputs,
    ctx.canvas.width,
    ctx.canvas.height,
  );

  // Select the target canvas based on renderConfig.layer.
  const renderLayer = compiledNode.renderConfig?.layer ?? 'paint';
  const targetCanvas = renderLayer === 'live' ? ctx.canvas.orbit : ctx.canvas.trail;

  renderDef.evaluate(scaledInputs, {
    canvas: targetCanvas,
    width: ctx.canvas.width,
    height: ctx.canvas.height,
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
): import('../nodes/compute/types').EvalContext {
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
    const def = node.def as Partial<import('../nodes/compute/types').NodeDef>;
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
