import React from 'react';
import { compile } from '../compiler/compiler';
import { tick as evaluatorTick } from '../../graphEngine/evaluator/evaluator';
import { controlRegistry } from '../../nodes/control/registry';
import type { CompiledGraph } from '../compiler/compiler';
import type { EvalContext } from '../evaluator/EvalContext';
import type { Value } from '../../schema/types';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import { computeRegistry } from '../../nodes/compute/registry';
import { renderRegistry } from '../../nodes/render/registry';
import { moduleRegistry } from '../../nodes/module/registry';
import type { LegacyComputeNodeImplementation } from '../externalInterfaces/ComputeNodeImplementation';

function flattenParams(params: Record<string, Value>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    result[key] = value.v;
  }
  return result;
}

function rawValueToValue(portType: string, rawValue: unknown): Value {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { kind: portType, v: rawValue } as any;
}

export type GraphLoadPayload = {
  renderControlNodes: () => React.ReactNode;
  renderingNodes: Array<{ nodeId: string; label: string; layer: 'live' | 'paint' }>;
};

export type GraphEngine = {
  load: (graph: GeoArtGraph) => GraphLoadPayload;
  setSpeed: (value: number) => void;
  tick: () => void;
  toggleRenderNode: (nodeId: string) => void;
};

export function createGraphEngine(
  orbitCtx: CanvasRenderingContext2D,
  trailCtx: CanvasRenderingContext2D,
  canvasSize: number,
  registry?: {
    computeRegistry?: typeof computeRegistry;
    renderRegistry?: typeof renderRegistry;
    controlRegistry?: typeof controlRegistry;
    moduleRegistry?: typeof moduleRegistry;
  },
): GraphEngine {
  let compiled: CompiledGraph | null = null;
  let tickCount = 0;
  let frameCount = 0;
  let speed = 1;
  const enabledRenderNodes = new Set<string>();

  function runTick(): void {
    if (!compiled) return;
    tickCount++;
    orbitCtx.clearRect(0, 0, canvasSize, canvasSize);
    const ctx: EvalContext = {
      tickCount,
      canvas: { orbit: orbitCtx, trail: trailCtx, width: canvasSize, height: canvasSize },
      getState<T>(): T { return undefined as unknown as T; },
      setState(): void { },
      enabledRenderNodes,
    };
    evaluatorTick(compiled, tickCount, ctx);
  }

  function tick(): void {
    frameCount++;

    if (speed >= 1) {
      const ticksThisFrame = Math.round(speed);
      for (let i = 0; i < ticksThisFrame; i++) {
        runTick();
      }
    } else {
      const skipFrames = Math.round(1 / speed);
      if (frameCount % skipFrames === 0) {
        runTick();
      }
    }
  }

  function mutateControl(nodeId: string, paramKey: string, value: Value): void {
    if (!compiled) return;
    const compiledNode = compiled.nodes.get(nodeId);
    if (!compiledNode) return;
    compiledNode.params[paramKey] = value;
    const state = compiled.states.get(nodeId);
    if (state) state.isDirty = true;
    trailCtx.clearRect(0, 0, canvasSize, canvasSize);
  }

  function load(graph: GeoArtGraph): GraphLoadPayload {
    tickCount = 0;
    frameCount = 0;
    orbitCtx.clearRect(0, 0, canvasSize, canvasSize);
    trailCtx.clearRect(0, 0, canvasSize, canvasSize);
    compiled = compile(graph, {
      computeRegistry: registry?.computeRegistry ?? computeRegistry,
      controlRegistry: registry?.controlRegistry ?? controlRegistry,
      renderRegistry: registry?.renderRegistry ?? renderRegistry,
      moduleRegistry: registry?.moduleRegistry ?? moduleRegistry
    });

    // Extract render nodes and initialize enabled set
    const renderingNodes: Array<{ nodeId: string; label: string; layer: 'live' | 'paint' }> = [];
    enabledRenderNodes.clear();

    if (compiled) {
      for (const nodeId of compiled.sortedNodes) {
        const compiledNode = compiled.nodes.get(nodeId);
        if (compiledNode && compiledNode.layer === 'render') {
          const nodeDecl = graph.render.nodes.find(n => n.id === nodeId);
          const label = nodeDecl?.id || nodeId;
          const layer = compiledNode.renderConfig?.layer || 'paint';
          renderingNodes.push({ nodeId, label, layer });
          enabledRenderNodes.add(nodeId);
        }
      }
    }

    return {
      renderControlNodes: () => {
        const controlNodeIds: string[] = [];

        // Collect control node IDs from compiled graph (includes both original and module-generated)
        if (compiled) {
          for (const nodeId of compiled.sortedNodes) {
            const compiledNode = compiled.nodes.get(nodeId);
            // Include both control layer nodes and module input marker nodes
            if (compiledNode && (compiledNode.layer === 'control' || compiledNode.def.type === 'module-input-marker')) {
              controlNodeIds.push(nodeId);
            }
          }
        }

        return controlNodeIds.map(nodeId => {
          const compiledNode = compiled?.nodes.get(nodeId);
          if (!compiledNode) return null;

          // Handle module input marker nodes specially
          if (compiledNode.def.type === 'module-input-marker' && compiledNode.moduleInputMarkerRenderControl) {
            const element = compiledNode.moduleInputMarkerRenderControl(
              flattenParams(compiledNode.params), (paramKey, value) => {
                const portDef = ((compiledNode.def) as LegacyComputeNodeImplementation).outputs?.find((p) => p.name === paramKey);
                if (!portDef) {
                  console.error(`Port ${paramKey} not found`);
                  return;
                }
                const valueObj = rawValueToValue(portDef.type, value);
                return mutateControl(nodeId, paramKey, valueObj)
              });
            return React.createElement(React.Fragment, { key: nodeId }, element);
          }

          const def = (registry?.controlRegistry ?? controlRegistry).get(compiledNode.def.type);
          if (!def) return null;

          // Build node descriptor for renderControl
          const node = {
            id: nodeId,
            type: compiledNode.def.type,
            params: compiledNode.params,
          };
          //@ts-expect-error - ignore for now

          const element = def.renderControl(node, (paramKey, value) => {
            //@ts-expect-error - ignore for now
            return mutateControl(nodeId, paramKey, value)
          });
          return React.createElement(React.Fragment, { key: nodeId }, element);
        });
      },
      renderingNodes,
    };
  }

  function toggleRenderNode(nodeId: string): void {
    if (enabledRenderNodes.has(nodeId)) {
      enabledRenderNodes.delete(nodeId);
    } else {
      enabledRenderNodes.add(nodeId);
    }
    trailCtx.clearRect(0, 0, canvasSize, canvasSize);
  }

  return {
    load,
    setSpeed: value => { speed = value; },
    tick,
    toggleRenderNode,
  };
}
