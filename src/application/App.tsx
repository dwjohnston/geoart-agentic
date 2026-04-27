import { useEffect, useRef, useState } from 'react';
import { GRAPHS, DEFAULT_GRAPH_ID, getGraph } from '../graphs/index';
import { createGraphEngine } from '../graphEngine/graphEngine';
import type { GraphEngine, GraphLoadPayload } from '../graphEngine/graphEngine';
import { Canvas } from './Canvas';
import { SidePanel } from './SidePanel';
import { AlgorithmPicker } from './AlgorithmPicker';
import { Controls } from './Controls';
import { SpeedControl } from './SpeedControl';
import { NeverShouldHappenError } from '../common-tooling/errors/NeverShouldHappenError';

const CANVAS_SIZE = 800;

function App() {
  const orbitCanvasRef = useRef<HTMLCanvasElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GraphEngine | null>(null);

  const [payload, setPayload] = useState<GraphLoadPayload>({ renderControlNodes: () => null });
  const [speed, setSpeed] = useState(() => getGraph(DEFAULT_GRAPH_ID).graph.speed ?? 1.0);

  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    const orbitCtx = orbitCanvasRef.current!.getContext('2d')!;
    const trailCtx = trailCanvasRef.current!.getContext('2d')!;

    const engine = createGraphEngine(orbitCtx, trailCtx, CANVAS_SIZE);
    engineRef.current = engine;

    const { graph } = getGraph(DEFAULT_GRAPH_ID);
    engine.setSpeed(graph.speed ?? 1.0);
    setPayload(engine.load(graph));

    let rafId: number;
    const frame = () => {
      engine.tick();
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(rafId);
  }, []);

  function handleGraphChange(id: string) {
    if (!engineRef.current) {
      throw new NeverShouldHappenError();
    }
    const { graph } = getGraph(id);
    const graphSpeed = graph.speed ?? 1.0;
    engineRef.current.setSpeed(graphSpeed);
    setPayload(engineRef.current.load(graph));
    setSpeed(graphSpeed);
    setLoadKey(k => k + 1);
  }

  function handleSpeedChange(value: number) {
    if (!engineRef.current) {
      throw new NeverShouldHappenError();
    }
    setSpeed(value);
    engineRef.current.setSpeed(value);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 24, padding: 24 }}>
      <Canvas orbitCanvasRef={orbitCanvasRef} trailCanvasRef={trailCanvasRef} size={CANVAS_SIZE} />
      <SidePanel>
        <AlgorithmPicker graphs={GRAPHS} defaultId={DEFAULT_GRAPH_ID} onChange={handleGraphChange} />
        <SpeedControl speed={speed} onChange={handleSpeedChange} />
        <Controls key={loadKey} renderControlNodes={payload.renderControlNodes} />
      </SidePanel>
    </div>
  );
}

export default App;
