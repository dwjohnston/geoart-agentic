import React from 'react';
import { compile } from '../compiler/compiler';
import { tick as evaluatorTick } from '../../graphEngine/evaluator/evaluator';
import { controlRegistry } from '../../nodes/control/registry';
import type { CompiledGraph } from '../compiler/compiler';
import type { EvalContext } from '../evaluator/EvalContext';
import type { Value } from '../../schema/types';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';

export type GraphLoadPayload = {
  renderControlNodes: () => React.ReactNode;
};

export type GraphEngine = {
  load: (graph: GeoArtGraph) => GraphLoadPayload;
  setSpeed: (value: number) => void;
  tick: () => void;
};

export function createGraphEngine(
  orbitCtx: CanvasRenderingContext2D,
  trailCtx: CanvasRenderingContext2D,
  canvasSize: number,
): GraphEngine {
  let compiled: CompiledGraph | null = null;
  let tickCount = 0;
  let frameCount = 0;
  let speed = 1;

  function runTick(): void {
    if (!compiled) return;
    tickCount++;
    orbitCtx.clearRect(0, 0, canvasSize, canvasSize);
    const ctx: EvalContext = {
      tickCount,
      canvas: { orbit: orbitCtx, trail: trailCtx, width: canvasSize, height: canvasSize },
      getState<T>(): T { return undefined as unknown as T; },
      setState(): void { },
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
    compiled = compile(graph);

    return {
      renderControlNodes: () => graph.control.nodes.map(node => {
        const def = controlRegistry.get(node.type);
        if (!def) return null;
        //@ts-expect-error - ignore for now
        const element = def.renderControl(node, (paramKey, value) => mutateControl(node.id, paramKey, value));
        return React.createElement(React.Fragment, { key: node.id }, element);
      }),
    };
  }

  return {
    load,
    setSpeed: value => { speed = value; },
    tick,
  };
}
