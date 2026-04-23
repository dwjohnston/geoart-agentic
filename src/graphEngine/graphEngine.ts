import { compile } from '../graph/compiler';
import { tick as evaluatorTick } from '../graph/evaluator';
import type { CompiledGraph } from '../graph/compiler';
import type { EvalContext } from '../graph/EvalContext';
import type { GeoArtGraph, ControlNode } from '../schema/_generated/schema-types';

export type ColorValue = { r: number; g: number; b: number; a: number };

type SliderNode = Extract<ControlNode, { type: 'slider' }>;
type ColorPickerNode = Extract<ControlNode, { type: 'colorPicker' }>;
type DropdownNode = Extract<ControlNode, { type: 'dropdown' }>;

export type SliderRegistration = {
  type: 'slider';
  node: SliderNode;
  setValue: (value: number) => void;
};

export type ColorPickerRegistration = {
  type: 'colorPicker';
  node: ColorPickerNode;
  setValue: (value: ColorValue) => void;
};

export type DropdownRegistration = {
  type: 'dropdown';
  node: DropdownNode;
  setValue: (value: string) => void;
};

export type ControlRegistration = SliderRegistration | ColorPickerRegistration | DropdownRegistration;

export type GraphEngine = {
  load: (graph: GeoArtGraph) => ControlRegistration[];
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
      setState(): void {},
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
      // speed = 1/n — fire one tick every n frames
      const skipFrames = Math.round(1 / speed);
      if (frameCount % skipFrames === 0) {
        runTick();
      }
    }
  }

  function mutateControl(nodeId: string, value: { kind: 'number'; v: number } | { kind: 'color'; v: ColorValue } | { kind: 'string'; v: string }): void {
    if (!compiled) return;
    const compiledNode = compiled.nodes.get(nodeId);
    if (!compiledNode) return;
    compiledNode.params['value'] = value;
    const state = compiled.states.get(nodeId);
    if (state) state.isDirty = true;
    trailCtx.clearRect(0, 0, canvasSize, canvasSize);
  }

  function load(graph: GeoArtGraph): ControlRegistration[] {
    tickCount = 0;
    frameCount = 0;
    orbitCtx.clearRect(0, 0, canvasSize, canvasSize);
    trailCtx.clearRect(0, 0, canvasSize, canvasSize);
    compiled = compile(graph);

    return graph.control.nodes.flatMap((node): ControlRegistration[] => {
      if (node.type === 'slider') {
        return [{ type: 'slider' as const, node: node as SliderNode, setValue: (v: number) => mutateControl(node.id, { kind: 'number', v }) }];
      }
      if (node.type === 'colorPicker') {
        return [{ type: 'colorPicker' as const, node: node as ColorPickerNode, setValue: (v: ColorValue) => mutateControl(node.id, { kind: 'color', v }) }];
      }
      if (node.type === 'dropdown') {
        return [{ type: 'dropdown' as const, node: node as DropdownNode, setValue: (v: string) => mutateControl(node.id, { kind: 'string', v }) }];
      }
      return [];
    });
  }

  return {
    load,
    setSpeed: value => { speed = value; },
    tick,
  };
}
