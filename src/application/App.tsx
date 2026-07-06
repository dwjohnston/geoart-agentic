import { useEffect, useRef, useState } from 'react';
import { GRAPHS, DEFAULT_GRAPH_ID } from '../algorithms/index';
import { createGraphEngine } from '../graphEngine/exports';
import type { GraphEngine, GraphLoadPayload } from '../graphEngine/exports';

import type { GeoArtGraph } from '../schema/_generated/schema-types';
import { Canvas } from './Canvas';
import { type FpsCounterHandle } from './FpsCounter';
import { SidePanel } from './SidePanel';
import { AlgorithmPicker } from './AlgorithmPicker';
import type { AlgorithmEntry } from './AlgorithmPicker';
import { Controls } from './Controls';
import { SpeedControl } from './SpeedControl';
import { RenderToggles } from './RenderToggles';
import { ImportAlgorithmModal } from './ImportAlgorithmModal';
import { ExportJsonModal } from './ExportJsonModal';
import { Toast } from './Toast';
import { useAlgorithmStorage } from './algorithmStorage/AlgorithmStorageContext';
import { NeverShouldHappenError } from '../common-tooling/errors/NeverShouldHappenError';

const CANVAS_SIZE = 800;

function toBundledEntries(): AlgorithmEntry[] {
  return GRAPHS.map(g => ({ ...g, source: 'bundled' as const }));
}

function decodeUrlGraph(): GeoArtGraph | null {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('a');
  if (!encoded) return null;
  try {
    const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as GeoArtGraph;
  } catch {
    return null;
  }
}

function encodeGraphToBase64(graph: GeoArtGraph): string {
  const json = JSON.stringify(graph);
  const bytes = new TextEncoder().encode(json);
  return btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
}

export function App() {
  const storage = useAlgorithmStorage();

  const liveCanvasRef = useRef<HTMLCanvasElement>(null);
  const paintCanvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GraphEngine | null>(null);

  const fpsCounterRef = useRef<FpsCounterHandle>(null);

  const [algorithms, setAlgorithms] = useState<AlgorithmEntry[]>(toBundledEntries);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportGraph, setExportGraph] = useState<GeoArtGraph | null>(null);
  const [showLinkCopiedToast, setShowLinkCopiedToast] = useState(false);
  const [payload, setPayload] = useState<GraphLoadPayload>({ renderControlNodes: () => null, renderingNodes: [] });

  // Graph loaded from ?a= URL param — stable, set once on init
  const [urlGraph] = useState<GeoArtGraph | null>(decodeUrlGraph);

  // selectedGraphId is null when the active graph was loaded from ?a=
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(() => {
    if (urlGraph !== null) return null;
    const params = new URLSearchParams(window.location.search);
    const paramId = params.get('algorithm');
    if (paramId && GRAPHS.some(g => g.id === paramId)) return paramId;
    return DEFAULT_GRAPH_ID;
  });

  const [speed, setSpeed] = useState(() => {
    const graph = urlGraph ?? GRAPHS.find(g => g.id === (selectedGraphId ?? DEFAULT_GRAPH_ID))?.graph;
    return graph?.speed ?? 1.0;
  });

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
    const liveCtx = liveCanvasRef.current!.getContext('2d')!;
    const paintCtx = paintCanvasRef.current!.getContext('2d')!;

    const engine = createGraphEngine(liveCtx, paintCtx, CANVAS_SIZE);
    engineRef.current = engine;

    const graph = selectedGraphId !== null ? getGraph(selectedGraphId) : urlGraph!;
    engine.setSpeed(graph.speed ?? 1.0);
    setPayload(engine.load(graph));

    let rafId: number;
    const frame = () => {
      engine.tick();
      fpsCounterRef.current?.tick();
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGraphId]);

  function handleGraphChange(id: string) {
    window.history.replaceState(null, '', `?algorithm=${encodeURIComponent(id)}`);
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

  async function handleShare() {
    const engine = engineRef.current;
    if (!engine) return;
    const snapshot = engine.snapshotGraph();
    if (!snapshot) return;
    const encoded = encodeGraphToBase64(snapshot);
    const newParams = new URLSearchParams();
    newParams.set('a', encoded);
    const newUrl = `${window.location.origin}${window.location.pathname}?${newParams.toString()}`;
    window.history.replaceState(null, '', newUrl);
    try {
      await navigator.clipboard.writeText(newUrl);
    } catch {
      // clipboard access may be unavailable in some contexts
    }
    setShowLinkCopiedToast(true);
  }

  function handleExportJson() {
    const engine = engineRef.current;
    if (!engine) return;
    const snapshot = engine.snapshotGraph();
    if (!snapshot) return;
    setExportGraph(snapshot);
    setShowExportModal(true);
  }

  const graphKey = selectedGraphId ?? 'url-graph';

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 24, padding: 24 }}>
      <SidePanel>
        <RenderToggles key={graphKey} renderingNodes={payload.renderingNodes} onToggle={handleRenderNodeToggle} />
      </SidePanel>
      <Canvas liveCanvasRef={liveCanvasRef} paintCanvasRef={paintCanvasRef} size={CANVAS_SIZE} fpsCounterRef={fpsCounterRef} />
      <SidePanel>
        <AlgorithmPicker
          algorithms={algorithms}
          defaultId={selectedGraphId}
          blankName={urlGraph?.title ?? 'Custom graph'}
          onChange={handleGraphChange}
          onImportClick={() => setShowImportModal(true)}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleShare}
            style={{
              flex: 1,
              background: '#1a1a26',
              color: '#eee',
              border: '1px solid #333',
              borderRadius: 4,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Share
          </button>
          <button
            onClick={handleExportJson}
            style={{
              flex: 1,
              background: '#1a1a26',
              color: '#eee',
              border: '1px solid #333',
              borderRadius: 4,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Export JSON
          </button>
        </div>
        <SpeedControl speed={speed} onChange={handleSpeedChange} />
        <Controls key={graphKey} renderControlNodes={payload.renderControlNodes} />
      </SidePanel>
      {showImportModal && (
        <ImportAlgorithmModal
          onClose={() => setShowImportModal(false)}
          onImported={handleImported}
        />
      )}
      {showExportModal && exportGraph && (
        <ExportJsonModal
          graph={exportGraph}
          onClose={() => { setShowExportModal(false); setExportGraph(null); }}
        />
      )}
      {showLinkCopiedToast && (
        <Toast message="Link copied!" onDismiss={() => setShowLinkCopiedToast(false)} />
      )}
    </div>
  );
}
