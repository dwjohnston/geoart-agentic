import { useEffect, useRef, useState } from 'react';
import { compile } from '../graph/compiler';
import { tick } from '../graph/evaluator';
import type { CompiledGraph } from '../graph/compiler';
import type { EvalContext } from '../graph/EvalContext';
import { GRAPHS, DEFAULT_GRAPH_ID, getGraph } from '../graphs/index';
import type { ControlNode } from '../schema/_generated/schema-types';
import { Canvas } from './Canvas';
import { SidePanel } from './SidePanel';
import { AlgorithmPicker } from './AlgorithmPicker';
import { Controls } from './Controls';
import { SpeedControl } from './SpeedControl';
import type { ColorValue, SliderNode, ColorPickerNode } from './Controls';

const CANVAS_SIZE = 800;

type ControlValue = number | ColorValue;

function initControlValues(controlNodes: ControlNode[]): Record<string, ControlValue> {
  const initial: Record<string, ControlValue> = {};
  for (const node of controlNodes) {
    if (node.type === 'slider') {
      initial[node.id] = node.params.value?.v ?? 0;
    } else if (node.type === 'colorPicker') {
      initial[node.id] = node.params.value?.v ?? { r: 1, g: 1, b: 1, a: 1 };
    }
  }
  return initial;
}

function App() {
  const orbitCanvasRef = useRef<HTMLCanvasElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const compiledRef = useRef<CompiledGraph | null>(null);
  const stateMapRef = useRef<Map<string, unknown>>(new Map());
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number>(0);
  const scaledElapsedRef = useRef<number>(0);
  const speedRef = useRef<number>(1.0);

  const [selectedGraphId, setSelectedGraphId] = useState<string>(DEFAULT_GRAPH_ID);
  const [speed, setSpeed] = useState<number>(1.0);
  const [controlValues, setControlValues] = useState<Record<string, ControlValue>>(() =>
    initControlValues(getGraph(DEFAULT_GRAPH_ID).graph.control.nodes),
  );

  const currentGraph = getGraph(selectedGraphId).graph;

  useEffect(() => {
    const { graph } = getGraph(selectedGraphId);

    startTimeRef.current = null;
    prevTimeRef.current = 0;
    scaledElapsedRef.current = 0;
    stateMapRef.current = new Map();

    const orbitCtx = orbitCanvasRef.current?.getContext('2d');
    const trailCtx = trailCanvasRef.current?.getContext('2d');
    orbitCtx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    trailCtx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    compiledRef.current = compile(graph);
  }, [selectedGraphId]);

  useEffect(() => {
    const orbitCanvas = orbitCanvasRef.current;
    const trailCanvas = trailCanvasRef.current;
    if (!orbitCanvas || !trailCanvas) return;

    const orbitCtx = orbitCanvas.getContext('2d');
    const trailCtx = trailCanvas.getContext('2d');
    if (!orbitCtx || !trailCtx) return;

    let cancelled = false;

    function frame(wallMs: number) {
      if (cancelled) return;

      if (startTimeRef.current === null) {
        startTimeRef.current = wallMs;
      }

      const wallElapsed = wallMs - startTimeRef.current;
      const deltaTime = wallElapsed - prevTimeRef.current;
      prevTimeRef.current = wallElapsed;

      scaledElapsedRef.current += deltaTime * speedRef.current;
      const scaledElapsed = scaledElapsedRef.current;

      const compiled = compiledRef.current;
      if (compiled) {
        orbitCtx!.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        const stateMap = stateMapRef.current;

        const ctx: EvalContext = {
          time: scaledElapsed,
          deltaTime,
          canvas: {
            orbit: orbitCtx!,
            trail: trailCtx!,
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
          },
          getState<T>(): T {
            return stateMap.get('__current__') as T;
          },
          setState<T>(s: T): void {
            stateMap.set('__current__', s);
          },
        };

        tick(compiled, scaledElapsed, ctx);
      }

      rafIdRef.current = requestAnimationFrame(frame);
    }

    rafIdRef.current = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  function handleValueChange(nodeId: string, value: ControlValue) {
    setControlValues(prev => ({ ...prev, [nodeId]: value }));

    const compiled = compiledRef.current;
    if (!compiled) return;

    const compiledNode = compiled.nodes.get(nodeId);
    if (!compiledNode) return;

    compiledNode.params['value'] = typeof value === 'number'
      ? { kind: 'number', v: value }
      : { kind: 'color', v: value };

    const state = compiled.states.get(nodeId);
    if (state) {
      state.isDirty = true;
    }

    trailCanvasRef.current?.getContext('2d')?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }

  function handleSpeedChange(value: number) {
    setSpeed(value);
    speedRef.current = value;
  }

  function handleGraphChange(id: string) {
    const { graph } = getGraph(id);
    const graphSpeed = graph.speed ?? 1.0;

    setSelectedGraphId(id);
    setSpeed(graphSpeed);
    speedRef.current = graphSpeed;
    setControlValues(initControlValues(graph.control.nodes));
  }

  const controlNodesWithValues = currentGraph.control.nodes.map(node => {
    if (node.type === 'slider') {
      const n = node as SliderNode;
      return { ...n, params: { ...n.params, value: { v: (controlValues[n.id] as number) ?? n.params.value?.v ?? 0 } } };
    }
    if (node.type === 'colorPicker') {
      const n = node as ColorPickerNode;
      return { ...n, params: { ...n.params, value: { v: (controlValues[n.id] as ColorValue) ?? n.params.value?.v ?? { r: 1, g: 1, b: 1, a: 1 } } } };
    }
    return node;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 24, padding: 24 }}>
      <Canvas orbitCanvasRef={orbitCanvasRef} trailCanvasRef={trailCanvasRef} size={CANVAS_SIZE} />
      <SidePanel>
        <AlgorithmPicker
          graphs={GRAPHS}
          defaultId={DEFAULT_GRAPH_ID}
          onChange={handleGraphChange}
        />
        <SpeedControl speed={speed} onChange={handleSpeedChange} />
        <Controls nodes={controlNodesWithValues} onValueChange={handleValueChange} />
      </SidePanel>
    </div>
  );
}

export default App;
