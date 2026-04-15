import { useEffect, useRef, useState } from 'react';
import { compile } from './graph/compiler';
import { tick } from './graph/evaluator';
import type { CompiledGraph } from './graph/compiler';
import type { EvalContext } from './graph/EvalContext';
import { threeOrbitsGraph } from './graphs/threeOrbits';
import { SliderControl } from './control/ui/SliderControl';
import type { ControlNode } from './schema/_generated/schema-types';

// Extract slider nodes from the control layer.
type SliderNode = Extract<ControlNode, { type: 'slider' }>;

const CANVAS_SIZE = 800;

function App() {
  const orbitCanvasRef = useRef<HTMLCanvasElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const compiledRef = useRef<CompiledGraph | null>(null);
  const stateMapRef = useRef<Map<string, unknown>>(new Map());
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number>(0);

  // Slider values are stored in React state so the UI re-renders when they change.
  const [sliderValues, setSliderValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const node of threeOrbitsGraph.control.nodes) {
      if (node.type === 'slider') {
        initial[node.id] = node.params.value?.v ?? 0;
      }
    }
    return initial;
  });

  // Compile on mount — once only.
  useEffect(() => {
    compiledRef.current = compile(threeOrbitsGraph);
  }, []);

  // RAF loop — start after canvases are ready.
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

      const elapsed = wallMs - startTimeRef.current;
      const deltaTime = elapsed - prevTimeRef.current;
      prevTimeRef.current = elapsed;

      const compiled = compiledRef.current;
      if (compiled) {
        // Clear only the orbit canvas each frame. Trail canvas accumulates.
        orbitCtx!.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        const stateMap = stateMapRef.current;

        const ctx: EvalContext = {
          time: elapsed,
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

        tick(compiled, elapsed, ctx);
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

  // When a slider changes, update the compiled graph's param so the evaluator
  // picks it up on the next tick, and clear the trail canvas so the drawing
  // restarts from the new configuration.
  function handleSliderChange(nodeId: string, value: number) {
    setSliderValues(prev => ({ ...prev, [nodeId]: value }));

    const compiled = compiledRef.current;
    if (!compiled) return;

    const compiledNode = compiled.nodes.get(nodeId);
    if (!compiledNode) return;

    // Mutate the static param in-place so the evaluator reads the updated value.
    compiledNode.params['value'] = { kind: 'number', v: value };

    // Mark the node dirty so downstream nodes re-evaluate next tick.
    const state = compiled.states.get(nodeId);
    if (state) {
      state.isDirty = true;
    }

    // Clear the trail canvas so accumulated paint restarts from the new config.
    trailCanvasRef.current?.getContext('2d')?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }

  const sliderNodes = threeOrbitsGraph.control.nodes.filter(
    (n): n is SliderNode => n.type === 'slider',
  );

  // Build slider nodes with current React state values so the UI reflects
  // the live value.
  const sliderNodesWithValues: SliderNode[] = sliderNodes.map(n => ({
    ...n,
    params: {
      ...n.params,
      value: { v: sliderValues[n.id] ?? n.params.value?.v ?? 0 },
    },
  }));

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
        <h2 style={{ margin: 0, fontSize: 16, color: '#eee' }}>Three Orbits</h2>
        {sliderNodesWithValues.map(node => (
          <SliderControl
            key={node.id}
            node={node}
            onChange={handleSliderChange}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
