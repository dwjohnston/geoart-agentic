import React from 'react';
import { compile } from '../compiler/compiler';
import { expandModules, type GraphWithModules } from '../compiler/moduleExpander';
import { moduleRegistry } from '../../schema/modules/index';
import { tick as evaluatorTick } from '../../graphEngine/evaluator/evaluator';
import { controlRegistry } from '../../nodes/control/registry';
import type { CompiledGraph } from '../compiler/compiler';
import type { EvalContext } from '../evaluator/EvalContext';
import type { Value } from '../../schema/types';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import { computeRegistry } from '../../nodes/compute/registry';
import { renderRegistry } from '../../nodes/render/registry';

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

    // Expand any module declarations into their constituent nodes before compiling.
    const expandedGraph = expandModules(graph as unknown as GraphWithModules, moduleRegistry) as unknown as GeoArtGraph;

    compiled = compile(expandedGraph, {
      computeRegistry: registry?.computeRegistry ?? computeRegistry,
      controlRegistry: registry?.controlRegistry ?? controlRegistry,
      renderRegistry: registry?.renderRegistry ?? renderRegistry
    });

    // Extract render nodes and initialize enabled set
    const renderingNodes: Array<{ nodeId: string; label: string; layer: 'live' | 'paint' }> = [];
    enabledRenderNodes.clear();

    if (compiled) {
      for (const nodeId of compiled.sortedNodes) {
        const compiledNode = compiled.nodes.get(nodeId);
        if (compiledNode && compiledNode.layer === 'render') {
          const nodeDecl = expandedGraph.render.nodes.find(n => n.id === nodeId);
          const label = nodeDecl?.id || nodeId;
          const layer = compiledNode.renderConfig?.layer || 'paint';
          renderingNodes.push({ nodeId, label, layer });
          enabledRenderNodes.add(nodeId);
        }
      }
    }

    return {
      renderControlNodes: () => expandedGraph.control.nodes.map(node => {
        const def = (registry?.controlRegistry ?? controlRegistry).get(node.type);
        if (!def) return null;
        //@ts-expect-error - ignore for now
        const element = def.renderControl(node, (paramKey, value) => mutateControl(node.id, paramKey, value));
        return React.createElement(React.Fragment, { key: node.id }, element);
      }),
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
