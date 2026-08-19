import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createGraphEngine } from '../graphEngine/graphEngine';
import type { GraphEngine, GraphLoadPayload } from '../graphEngine/graphEngine';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';

/**
 * The embeddable unit for "export an algorithm as a React component" (see issue #136).
 *
 * Wraps the imperative `createGraphEngine` API (canvas refs, compile, tick loop) behind a
 * plain React component, so a graph can be dropped into any React tree — this app's own
 * UI, or a consumer embedding an exported algorithm elsewhere.
 */

export type AlgorithmCanvasHandle = {
  setSpeed: (value: number) => void;
  toggleRenderNode: (nodeId: string) => void;
};

export type AlgorithmCanvasProps = {
  /** The compiled graph to run. Swapping this reloads the engine. */
  graph: GeoArtGraph;
  /** Canvas size in pixels (square). Defaults to 800. */
  size?: number;
  /** Playback speed multiplier. Defaults to the graph's own `speed`, or 1. */
  speed?: number;
  /** Called once the graph has loaded, with the control/render metadata for building UI around the canvas. */
  onLoad?: (payload: GraphLoadPayload) => void;
};

export const AlgorithmCanvas = forwardRef<AlgorithmCanvasHandle, AlgorithmCanvasProps>(
  function AlgorithmCanvas({ graph, size = 800, speed, onLoad }, ref) {
    const liveCanvasRef = useRef<HTMLCanvasElement>(null);
    const paintCanvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<GraphEngine | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        setSpeed: value => engineRef.current?.setSpeed(value),
        toggleRenderNode: nodeId => engineRef.current?.toggleRenderNode(nodeId),
      }),
      [],
    );

    useEffect(() => {
      const liveCtx = liveCanvasRef.current!.getContext('2d')!;
      const paintCtx = paintCanvasRef.current!.getContext('2d')!;

      const engine = createGraphEngine(liveCtx, paintCtx, size);
      engineRef.current = engine;

      engine.setSpeed(speed ?? graph.speed ?? 1.0);
      const payload = engine.load(graph);
      onLoad?.(payload);

      let rafId: number;
      const frame = () => {
        engine.tick();
        rafId = requestAnimationFrame(frame);
      };
      rafId = requestAnimationFrame(frame);

      return () => cancelAnimationFrame(rafId);
      // Reloading is driven by `graph`/`size` identity; `speed` and `onLoad` are handled
      // separately below so changing them doesn't restart the engine.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [graph, size]);

    useEffect(() => {
      if (speed !== undefined) engineRef.current?.setSpeed(speed);
    }, [speed]);

    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <canvas
          ref={paintCanvasRef}
          width={size}
          height={size}
          data-testid="paint-canvas"
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
        <canvas
          ref={liveCanvasRef}
          width={size}
          height={size}
          data-testid="live-canvas"
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>
    );
  },
);
