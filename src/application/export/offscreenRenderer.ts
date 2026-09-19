import { createGraphEngine } from '../../graphEngine/exports';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';

/** Matches the visible canvas backdrop in Canvas.tsx. */
export const EXPORT_BACKGROUND = '#0a0a0f';

export type OffscreenRenderer = {
  /** Advances the graph by one engine tick. */
  tick(): void;
  /**
   * Redraws the composite canvas — background, then paint layer, then live
   * layer, scaled to `outputSize` — and returns it. The same canvas is
   * reused between calls.
   */
  composite(): HTMLCanvasElement;
};

/**
 * Runs a graph in a fresh engine on off-screen canvases, independent of the
 * animation the user is watching. The graph is rendered at `renderSize`
 * (the app's canvas size, so node geometry and line widths match what the
 * user sees) and composited down to `outputSize`.
 *
 * Speed is left at 1 — one engine tick per `tick()` — so the frame shown is
 * governed entirely by the caller (previewSettings), the same as the
 * server-side render.
 */
export function createOffscreenRenderer(graph: GeoArtGraph, renderSize: number, outputSize: number): OffscreenRenderer {
  const live = createCanvas(renderSize);
  const paint = createCanvas(renderSize);
  const composite = createCanvas(outputSize);
  const compositeCtx = getContext(composite);

  const engine = createGraphEngine(getContext(live), getContext(paint), renderSize);
  engine.load(graph);

  function draw(): HTMLCanvasElement {
    compositeCtx.fillStyle = EXPORT_BACKGROUND;
    compositeCtx.fillRect(0, 0, outputSize, outputSize);
    compositeCtx.drawImage(paint, 0, 0, outputSize, outputSize);
    compositeCtx.drawImage(live, 0, 0, outputSize, outputSize);
    return composite;
  }

  return {
    tick: () => engine.tick(),
    composite: draw,
  };
}

function createCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  return ctx;
}
