import { Resvg, initWasm } from '@resvg/resvg-wasm';
import type { InitInput } from '@resvg/resvg-wasm';
import wasmAsset from '@resvg/resvg-wasm/index_bg.wasm';
import { createGraphEngine, compileValidatedGraph } from '../graphEngine/exports';
import { createHeadlessSvgCanvas } from './headlessSvgCanvas';
import { decodeGraphFromUrl } from '../common-tooling/graphUrlEncoding';
import type { GeoArtGraph } from '../schema/_generated/schema-types';

const RENDER_PATH_PREFIX = '/render/';
const DEFAULT_STATIC_IMAGE_NUM_TICKS = 10;

// Matches App.tsx's CANVAS_SIZE — the two must stay in sync until there's a shared constant.
export const CANVAS_SIZE = 800;

export function getStaticImageNumTicks(graph: GeoArtGraph): number {
  return graph.previewSettings?.staticImageNumTicks ?? DEFAULT_STATIC_IMAGE_NUM_TICKS;
}

let wasmReady: Promise<void> | null = null;

/** Initializes the resvg WASM module exactly once (cached across requests). */
function ensureWasmInitialized(): Promise<void> {
  if (!wasmReady) {
    wasmReady = loadWasmInput()
      .then(input => initWasm(input))
      .catch((e: unknown) => {
        wasmReady = null;
        throw e;
      });
  }
  return wasmReady;
}

async function loadWasmInput(): Promise<InitInput> {
  if (typeof wasmAsset === 'string') {
    // Bun (used to run this project's tests) resolves `.wasm` imports to a
    // filesystem path rather than a WebAssembly.Module — read it directly.
    const { readFileSync } = await import('node:fs');
    return readFileSync(wasmAsset);
  }
  return wasmAsset;
}

function buildSvg(paintElements: string[]): string {
  const background = `<rect x="0" y="0" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" fill="#000000" />`;
  const body = [background, ...paintElements].join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}">${body}</svg>`;
}

/**
 * Runs the graph headlessly for `numTicks` ticks and rasterises the paint
 * layer (the live layer is transient per-frame overlay, not meaningful in a
 * static preview image) over a black background to a PNG.
 */
export async function renderGraphToPng(graph: GeoArtGraph, numTicks: number): Promise<Uint8Array> {
  const liveCanvas = createHeadlessSvgCanvas();
  const paintCanvas = createHeadlessSvgCanvas();

  const engine = createGraphEngine(
    liveCanvas as unknown as CanvasRenderingContext2D,
    paintCanvas as unknown as CanvasRenderingContext2D,
    CANVAS_SIZE,
  );
  engine.load(graph);
  for (let i = 0; i < numTicks; i++) {
    engine.tick();
  }

  const svg = buildSvg(paintCanvas.getSvgElements());

  await ensureWasmInitialized();
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: CANVAS_SIZE } });
  return resvg.render().asPng();
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
    decoded = decodeGraphFromUrl(encoded);
  } catch {
    return new Response('Not found', { status: 404 });
  }

  const compiled = compileValidatedGraph(decoded);
  if (!compiled) {
    return new Response('Not found', { status: 404 });
  }

  const graph = decoded as GeoArtGraph;
  const png = await renderGraphToPng(graph, getStaticImageNumTicks(graph));

  return new Response(new Blob([new Uint8Array(png)]), {
    headers: { 'content-type': 'image/png' },
  });
}
