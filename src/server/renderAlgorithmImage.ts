import { createCanvas } from '@napi-rs/canvas';
import { createGraphEngine, compileValidatedGraph } from '../graphEngine/exports';
import type { GeoArtGraph } from '../schema/_generated/schema-types';

const RENDER_PATH_PREFIX = '/render/';
const DEFAULT_STATIC_IMAGE_NUM_TICKS = 10;

// Matches App.tsx's CANVAS_SIZE — the two must stay in sync until there's a shared constant.
const CANVAS_SIZE = 800;

/**
 * Decodes a base64-encoded algorithm JSON string. Throws on any malformed input
 * (bad base64, invalid UTF-8, invalid JSON) — callers should treat a throw as "not found".
 */
export function decodeAlgorithmBase64(raw: string): unknown {
  // Query-string parsing turns unencoded `+` into a space; undo that before decoding.
  const normalized = raw.replace(/ /g, '+');
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}

export function getStaticImageNumTicks(graph: GeoArtGraph): number {
  return graph.previewSettings?.staticImageNumTicks ?? DEFAULT_STATIC_IMAGE_NUM_TICKS;
}

/**
 * Runs the graph headlessly for `numTicks` ticks and rasterises the composited
 * paint+live canvases (paint accumulates underneath, live draws on top — matching
 * how the two layers are stacked visually in the browser) to a PNG buffer.
 */
export function renderGraphToPng(graph: GeoArtGraph, numTicks: number): Buffer {
  const liveCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  const paintCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  const liveCtx = liveCanvas.getContext('2d');
  const paintCtx = paintCanvas.getContext('2d');

  const engine = createGraphEngine(
    liveCtx as unknown as CanvasRenderingContext2D,
    paintCtx as unknown as CanvasRenderingContext2D,
    CANVAS_SIZE,
  );
  engine.load(graph);
  for (let i = 0; i < numTicks; i++) {
    engine.tick();
  }

  const outputCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  const outputCtx = outputCanvas.getContext('2d');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputCtx.drawImage(paintCanvas as any, 0, 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputCtx.drawImage(liveCanvas as any, 0, 0);

  return outputCanvas.toBuffer('image/png');
}

/**
 * Handles `/render/<base64-encoded-algorithm-json>` requests: decode, validate,
 * construct, and render the algorithm to a static PNG. 404s on any failure along
 * the way (malformed base64/JSON, or a graph that fails schema validation or
 * graph construction) rather than surfacing an error.
 */
export async function renderAlgorithmResponse(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith(RENDER_PATH_PREFIX)) {
    return new Response('Not found', { status: 404 });
  }
  const encoded = url.pathname.slice(RENDER_PATH_PREFIX.length);

  let decoded: unknown;
  try {
    decoded = decodeAlgorithmBase64(encoded);
  } catch {
    return new Response('Not found', { status: 404 });
  }

  const compiled = compileValidatedGraph(decoded);
  if (!compiled) {
    return new Response('Not found', { status: 404 });
  }

  const graph = decoded as GeoArtGraph;
  const png = renderGraphToPng(graph, getStaticImageNumTicks(graph));

  return new Response(png, {
    headers: { 'content-type': 'image/png' },
  });
}
