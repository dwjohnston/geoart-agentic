import React from 'react';
import { compile } from '../compiler/compiler';
import { tick as evaluatorTick } from '../../graphEngine/evaluator/evaluator';
import { controlRegistry } from '../../nodes/control/registry';
import type { CompiledGraph } from '../compiler/compiler';
import type { EvalContext } from '../evaluator/EvalContext';
import type { Value } from '../../schema/types';
import type { GeoArtGraph, RenderLayerConfig } from '../../schema/_generated/schema-types';
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
  renderingNodes: Array<{ nodeId: string; renderConfig: RenderLayerConfig }>;
};

export type GraphEngine = {
  load: (graph: GeoArtGraph) => GraphLoadPayload;
  setSpeed: (value: number) => void;
  tick: () => void;
  toggleRenderNode: (nodeId: string) => void;
  snapshotGraph: () => GeoArtGraph | null;
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
  let loadedGraph: GeoArtGraph | null = null;
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

  function snapshotGraph(): GeoArtGraph | null {
    if (!compiled || !loadedGraph) return null;

    const snapshot = JSON.parse(JSON.stringify(loadedGraph)) as GeoArtGraph;

    // The compiler's paramToValue flattens array elements: { v: [{ v: el }] } → value.v = [el].
    // To round-trip correctly, re-wrap array elements when writing back to the graph.
    function valueToParam(value: Value): unknown {
      if (Array.isArray(value.v)) {
        return { v: (value.v as unknown[]).map(el => ({ v: el })) };
      }
      return { v: value.v };
    }

    for (const controlNode of snapshot.control.nodes) {
      const compiledNode = compiled.nodes.get(controlNode.id);
      if (!compiledNode || compiledNode.layer !== 'control') continue;
      for (const [key, value] of Object.entries(compiledNode.params)) {
        (controlNode.params as Record<string, unknown>)[key] = valueToParam(value);
      }
    }

    if (snapshot.module) {
      const originalModuleNodes = (loadedGraph.module!.nodes as Array<{ id: string; params: Record<string, unknown> }>);
      for (const moduleNode of snapshot.module.nodes) {
        const compiledNode = compiled.nodes.get(`${moduleNode.id}:input-marker`);
        if (!compiledNode || compiledNode.def.type !== 'module-input-marker') continue;
        const originalParams = originalModuleNodes.find(n => n.id === moduleNode.id)?.params ?? {};
        for (const [key, value] of Object.entries(compiledNode.params)) {
          const orig = originalParams[key];
          const isRef = orig !== null && typeof orig === 'object' && 'ref' in (orig as object);
          if (!isRef) {
            (moduleNode.params as Record<string, unknown>)[key] = valueToParam(value);
          }
        }
      }
    }

    return snapshot;
  }

  function load(graph: GeoArtGraph): GraphLoadPayload {
    loadedGraph = graph;
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
    const renderingNodes: Array<{ nodeId: string; renderConfig: RenderLayerConfig }> = [];
    enabledRenderNodes.clear();

    if (compiled) {
      for (const nodeId of compiled.sortedNodes) {
        const compiledNode = compiled.nodes.get(nodeId);
        if (compiledNode && compiledNode.layer === 'render') {
          const renderConfig: RenderLayerConfig = compiledNode.renderConfig ?? { layer: 'paint' };
          if (!Object.hasOwn(renderConfig, 'displayByDefault')) {
            renderConfig.displayByDefault = true;
          }
          renderingNodes.push({ nodeId, renderConfig });
          if (renderConfig.displayByDefault !== false) {
            enabledRenderNodes.add(nodeId);
          }
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
    snapshotGraph,
  };
}
