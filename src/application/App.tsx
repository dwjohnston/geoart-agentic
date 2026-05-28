import { useEffect, useRef, useState } from 'react';
import { GRAPHS, DEFAULT_GRAPH_ID } from '../algorithms/index';
import { createGraphEngine } from '../graphEngine/exports';
import type { GraphEngine, GraphLoadPayload } from '../graphEngine/exports';

import type { GeoArtGraph } from '../schema/_generated/schema-types';
import { Canvas } from './Canvas';
import { SidePanel } from './SidePanel';
import { AlgorithmPicker } from './AlgorithmPicker';
import type { AlgorithmEntry } from './AlgorithmPicker';
import { Controls } from './Controls';
import { SpeedControl } from './SpeedControl';
import { RenderToggles } from './RenderToggles';
import { ImportAlgorithmModal } from './ImportAlgorithmModal';
import { useAlgorithmStorage } from './algorithmStorage/AlgorithmStorageContext';
import { GraphView } from './GraphView';
import { Modal } from './Modal';
import { NeverShouldHappenError } from '../common-tooling/errors/NeverShouldHappenError';

const CANVAS_SIZE = 800;

function toBundledEntries(): AlgorithmEntry[] {
  return GRAPHS.map(g => ({ ...g, source: 'bundled' as const }));
}

export function App() {
  const storage = useAlgorithmStorage();

  const orbitCanvasRef = useRef<HTMLCanvasElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GraphEngine | null>(null);

  const [algorithms, setAlgorithms] = useState<AlgorithmEntry[]>(toBundledEntries);
  const [showImportModal, setShowImportModal] = useState(false);
  const [payload, setPayload] = useState<GraphLoadPayload>({ renderControlNodes: () => null, renderingNodes: [] });

  const getInitialGraphId = () => {
    const params = new URLSearchParams(window.location.search);
    const paramId = params.get('algorithm');
    if (paramId && algorithms.some(g => g.id === paramId)) return paramId;
    return DEFAULT_GRAPH_ID;
  };

  const [selectedGraphId, setSelectedGraphId] = useState(getInitialGraphId);
  const [showGraphView, setShowGraphView] = useState(false);

  const currentGraph = algorithms.find(a => a.id === selectedGraphId);
  const [speed, setSpeed] = useState(() => currentGraph?.graph.speed ?? 1.0);

  useEffect(() => {
    storage.listSavedAlgorithms().then(saved => {
      if (saved.length === 0) return;
      setAlgorithms(prev => [
        ...prev,
        ...saved.map(e => ({ id: e.id, name: e.name, graph: e.graph, source: 'imported' as const })),
      ]);
    });
  }, [storage]);

  function getGraph(id: string): GeoArtGraph {
    const entry = algorithms.find(a => a.id === id);
    if (!entry) throw new NeverShouldHappenError();
    return entry.graph;
  }

  useEffect(() => {
    const orbitCtx = orbitCanvasRef.current!.getContext('2d')!;
    const trailCtx = trailCanvasRef.current!.getContext('2d')!;

    const engine = createGraphEngine(orbitCtx, trailCtx, CANVAS_SIZE);
    engineRef.current = engine;

    const graph = getGraph(selectedGraphId);
    engine.setSpeed(graph.speed ?? 1.0);
    setPayload(engine.load(graph));

    let rafId: number;
    const frame = () => {
      engine.tick();
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGraphId]);

  function handleGraphChange(id: string) {
    if (!engineRef.current) throw new NeverShouldHappenError();
    const params = new URLSearchParams(window.location.search);
    params.set('algorithm', id);
    window.history.replaceState(null, '', `?${params.toString()}`);
    setSelectedGraphId(id);
  }

  function handleSpeedChange(value: number) {
    if (!engineRef.current) throw new NeverShouldHappenError();
    setSpeed(value);
    engineRef.current.setSpeed(value);
  }

  function handleRenderNodeToggle(nodeId: string) {
    if (!engineRef.current) throw new NeverShouldHappenError();
    engineRef.current.toggleRenderNode(nodeId);
  }

  function handleImported(entry: { id: string; name: string; graph: GeoArtGraph }) {
    setAlgorithms(prev => [...prev, { ...entry, source: 'imported' as const }]);
    handleGraphChange(entry.id);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 24, padding: 24 }}>
      <SidePanel>
        <RenderToggles renderingNodes={payload.renderingNodes} onToggle={handleRenderNodeToggle} />
      </SidePanel>
      <Canvas orbitCanvasRef={orbitCanvasRef} trailCanvasRef={trailCanvasRef} size={CANVAS_SIZE} />
      <button
        onClick={() => setShowGraphView(v => !v)}
        style={{
          padding: '6px 16px',
          background: showGraphView ? '#4fc3f7' : '#333',
          color: showGraphView ? '#000' : '#ccc',
          border: '1px solid #555',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 12,
          fontFamily: 'monospace',
        }}
      >
        {showGraphView ? 'Hide graph view' : 'Show graph view'}
      </button>
      <SidePanel>
        <AlgorithmPicker
          algorithms={algorithms}
          defaultId={selectedGraphId}
          onChange={handleGraphChange}
          onImportClick={() => setShowImportModal(true)}
        />
        <SpeedControl speed={speed} onChange={handleSpeedChange} />
        <Controls key={selectedGraphId} renderControlNodes={payload.renderControlNodes} />
      </SidePanel>
      {showImportModal && (
        <ImportAlgorithmModal
          onClose={() => setShowImportModal(false)}
          onImported={handleImported}
        />
      )}

      {showGraphView && currentGraph && (
        <Modal onClose={() => setShowGraphView(false)}>
          <GraphView graph={currentGraph.graph} />
        </Modal>)}

    </div>
  );
}
