import { useEffect, useRef, useState } from 'react';
import { compile } from './graph/compiler';
import { tick } from './graph/evaluator';
import type { CompiledGraph } from './graph/compiler';
import type { EvalContext } from './graph/EvalContext';
import { GRAPHS, DEFAULT_GRAPH_ID, getGraph } from './graphs/index';
import { SliderControl } from './control/ui/SliderControl';
import { ColorPickerControl } from './control/ui/ColorPickerControl';
import type { ControlNode } from './schema/_generated/schema-types';

type SliderNode = Extract<ControlNode, { type: 'slider' }>;
type ColorPickerNode = Extract<ControlNode, { type: 'colorPicker' }>;
type ColorValue = { r: number; g: number; b: number; a: number };

const CANVAS_SIZE = 800;

function initSliderValues(controlNodes: ControlNode[]): Record<string, number> {
  const initial: Record<string, number> = {};
  for (const node of controlNodes) {
    if (node.type === 'slider') {
      initial[node.id] = node.params.value?.v ?? 0;
    }
  }
  return initial;
}

function initColorValues(controlNodes: ControlNode[]): Record<string, ColorValue> {
  const initial: Record<string, ColorValue> = {};
  for (const node of controlNodes) {
    if (node.type === 'colorPicker') {
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
  const [sliderValues, setSliderValues] = useState<Record<string, number>>(() =>
    initSliderValues(getGraph(DEFAULT_GRAPH_ID).graph.control.nodes),
  );
  const [colorValues, setColorValues] = useState<Record<string, ColorValue>>(() =>
    initColorValues(getGraph(DEFAULT_GRAPH_ID).graph.control.nodes),
  );

  const currentGraph = getGraph(selectedGraphId).graph;

  // When the selected graph changes, clear canvases, reset timing, and recompile.
  // State resets (speed, sliders, colors) are handled in handleGraphChange to
  // avoid calling setState synchronously inside an effect.
  useEffect(() => {
    const { graph } = getGraph(selectedGraphId);

    // Reset animation timing so the new graph starts from t=0.
    startTimeRef.current = null;
    prevTimeRef.current = 0;
    scaledElapsedRef.current = 0;
    stateMapRef.current = new Map();

    // Clear both canvases.
    const orbitCtx = orbitCanvasRef.current?.getContext('2d');
    const trailCtx = trailCanvasRef.current?.getContext('2d');
    orbitCtx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    trailCtx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    compiledRef.current = compile(graph);
  }, [selectedGraphId]);

  // RAF loop — starts once after canvases mount, runs for the lifetime of the app.
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

  function handleSliderChange(nodeId: string, value: number) {
    setSliderValues(prev => ({ ...prev, [nodeId]: value }));

    const compiled = compiledRef.current;
    if (!compiled) return;

    const compiledNode = compiled.nodes.get(nodeId);
    if (!compiledNode) return;

    compiledNode.params['value'] = { kind: 'number', v: value };

    const state = compiled.states.get(nodeId);
    if (state) {
      state.isDirty = true;
    }

    trailCanvasRef.current?.getContext('2d')?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }

  function handleColorPickerChange(nodeId: string, value: ColorValue) {
    setColorValues(prev => ({ ...prev, [nodeId]: value }));

    const compiled = compiledRef.current;
    if (!compiled) return;

    const compiledNode = compiled.nodes.get(nodeId);
    if (!compiledNode) return;

    compiledNode.params['value'] = { kind: 'color', v: value };

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
    setSliderValues(initSliderValues(graph.control.nodes));
    setColorValues(initColorValues(graph.control.nodes));
  }

  const sliderNodes = currentGraph.control.nodes.filter(
    (n): n is SliderNode => n.type === 'slider',
  );

  const sliderNodesWithValues: SliderNode[] = sliderNodes.map(n => ({
    ...n,
    params: {
      ...n.params,
      value: { v: sliderValues[n.id] ?? n.params.value?.v ?? 0 },
    },
  }));

  const colorPickerNodes = currentGraph.control.nodes.filter(
    (n): n is ColorPickerNode => n.type === 'colorPicker',
  );

  const colorPickerNodesWithValues: ColorPickerNode[] = colorPickerNodes.map(n => ({
    ...n,
    params: {
      ...n.params,
      value: { v: colorValues[n.id] ?? n.params.value?.v ?? { r: 1, g: 1, b: 1, a: 1 } },
    },
  }));

  const currentEntry = getGraph(selectedGraphId);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 24, padding: 24 }}>
      {/* Canvas stack */}
      <div
        style={{
          position: 'relative',
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          flexShrink: 0,
          background: '#0a0a0f',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {/* Trail canvas — bottom layer, never cleared */}
        <canvas
          ref={trailCanvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
        {/* Orbit canvas — top layer, cleared every frame */}
        <canvas
          ref={orbitCanvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>

      {/* Controls panel */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          minWidth: 220,
          padding: 16,
          background: '#111118',
          borderRadius: 8,
          color: '#ccc',
        }}
      >
        {/* Graph selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, color: '#aaa' }}>Graph</label>
          <select
            value={selectedGraphId}
            onChange={e => handleGraphChange(e.target.value)}
            style={{
              background: '#1a1a26',
              color: '#eee',
              border: '1px solid #333',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {GRAPHS.map(entry => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </select>
        </div>

        <h2 style={{ margin: 0, fontSize: 16, color: '#eee' }}>{currentEntry.name}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, color: '#aaa' }}>Speed: {speed.toFixed(2)}x</label>
          <input
            type="range"
            min={0.125}
            max={8}
            step={0.125}
            value={speed}
            onChange={e => handleSpeedChange(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {sliderNodesWithValues.map(node => (
          <SliderControl
            key={node.id}
            node={node}
            onChange={handleSliderChange}
          />
        ))}
        {colorPickerNodesWithValues.map(node => (
          <ColorPickerControl
            key={node.id}
            node={node}
            onChange={handleColorPickerChange}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
