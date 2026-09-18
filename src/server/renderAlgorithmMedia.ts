import { Resvg, initWasm } from '@resvg/resvg-wasm';
import type { InitInput } from '@resvg/resvg-wasm';
import wasmAsset from '@resvg/resvg-wasm/index_bg.wasm';
import { createGraphEngine, compileValidatedGraph } from '../graphEngine/exports';
import { createHeadlessSvgCanvas } from './headlessSvgCanvas';
import type { HeadlessSvgCanvas } from './headlessSvgCanvas';
import { decodeGraphFromUrl } from '../common-tooling/graphUrlEncoding';
import { encodeGif } from '../common-tooling/gifEncoding';
import type { RgbaFrame } from '../common-tooling/gifEncoding';
import { resolvePreviewSettings } from '../schema/previewSettings';
import type { ResolvedPreviewSettings } from '../schema/previewSettings';
import type { GeoArtGraph } from '../schema/_generated/schema-types';
import {
  RENDER_LIMITS,
  RenderBudgetExceededError,
  assertNodeCountWithinBudget,
  clampPreviewSettings,
  createTotalElementBudget,
} from './renderBudget';
import type { RenderLimits } from './renderBudget';

const RENDER_PATH_PREFIX = '/render/';

// Matches App.tsx's CANVAS_SIZE — the two must stay in sync until there's a shared constant.
export const CANVAS_SIZE = 800;

/**
 * Animated renders are rasterised at half size: rasterisation and palette
 * quantisation cost scale with pixel count, and there are up to
 * `maxAnimationFrames` of them per request.
 */
export const GIF_SIZE = 400;

export type RenderFormat = 'png' | 'gif';

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

function buildSvg(elements: string[]): string {
  const background = `<rect x="0" y="0" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" fill="#000000" />`;
  const body = [background, ...elements].join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}">${body}</svg>`;
}

type HeadlessEngine = {
  live: HeadlessSvgCanvas;
  paint: HeadlessSvgCanvas;
  tick(): void;
  /** Paint layer first, then the live layer on top — the same stacking as the app's two canvases. */
  compositeElements(): string[];
};

/**
 * Loads the graph into a fresh engine on two element-capped headless
 * canvases. Throws RenderBudgetExceededError if the compiled graph is over
 * the node limit; any draw call that would push a layer over its element
 * cap throws the same error mid-tick.
 */
function createHeadlessEngine(graph: GeoArtGraph, limits: RenderLimits): HeadlessEngine {
  const compiled = compileValidatedGraph(graph);
  if (!compiled) {
    throw new Error('Graph failed validation or compilation');
  }
  assertNodeCountWithinBudget(compiled.nodes.size, limits);

  const live = createHeadlessSvgCanvas({ maxElements: limits.maxElementsPerLayer });
  const paint = createHeadlessSvgCanvas({ maxElements: limits.maxElementsPerLayer });
  const engine = createGraphEngine(
    live as unknown as CanvasRenderingContext2D,
    paint as unknown as CanvasRenderingContext2D,
    CANVAS_SIZE,
  );
  engine.load(graph);

  return {
    live,
    paint,
    tick: () => engine.tick(),
    compositeElements: () => [...paint.getSvgElements(), ...live.getSvgElements()],
  };
}

/**
 * Runs the graph headlessly for `numTicks` ticks and rasterises the
 * composited paint + live layers over a black background to a PNG.
 */
export async function renderGraphToPng(
  graph: GeoArtGraph,
  numTicks: number,
  limits: RenderLimits = RENDER_LIMITS,
): Promise<Uint8Array> {
  const engine = createHeadlessEngine(graph, limits);
  const ticks = Math.min(numTicks, limits.maxStaticTicks);
  for (let i = 0; i < ticks; i++) {
    engine.tick();
  }

  const elements = engine.compositeElements();
  createTotalElementBudget(limits).consume(elements.length);

  await ensureWasmInitialized();
  const resvg = new Resvg(buildSvg(elements), { fitTo: { mode: 'width', value: CANVAS_SIZE } });
  const image = resvg.render();
  try {
    return image.asPng();
  } finally {
    image.free();
  }
}

/**
 * Runs the graph headlessly, capturing `animationNumFrames` frames
 * (`animationTicksPerFrame` ticks apart) and encodes them as a looping GIF
 * at GIF_SIZE. Settings are clamped to `limits` first.
 */
export async function renderGraphToGif(
  graph: GeoArtGraph,
  settings: ResolvedPreviewSettings,
  limits: RenderLimits = RENDER_LIMITS,
): Promise<Uint8Array> {
  const clamped = clampPreviewSettings(settings, limits);
  const engine = createHeadlessEngine(graph, limits);
  const totalBudget = createTotalElementBudget(limits);
  await ensureWasmInitialized();

  const frames: RgbaFrame[] = [];
  for (let frame = 0; frame < clamped.animationNumFrames; frame++) {
    for (let t = 0; t < clamped.animationTicksPerFrame; t++) {
      engine.tick();
    }
    const elements = engine.compositeElements();
    totalBudget.consume(elements.length);

    const resvg = new Resvg(buildSvg(elements), { fitTo: { mode: 'width', value: GIF_SIZE } });
    const image = resvg.render();
    try {
      // `pixels` is a copy out of WASM memory, so freeing the image afterwards is safe.
      frames.push({ pixels: image.pixels, width: image.width, height: image.height });
    } finally {
      image.free();
    }
  }

  // rgb444: palette quantisation is otherwise the single most expensive
  // stage per frame (see gifEncoding.ts); CPU time is the scarce resource here.
  return encodeGif(frames, { frameDelayMs: clamped.animationFrameDelayMs, colorFormat: 'rgb444' });
}

/**
 * Splits `/render/<encoded>[.png|.gif]` into the encoded graph and the
 * requested format. A bare path (no extension) is a PNG, which keeps the
 * original `/render/<encoded>` URLs working.
 */
export function parseRenderPath(pathname: string): { encoded: string; format: RenderFormat } | null {
  if (!pathname.startsWith(RENDER_PATH_PREFIX)) return null;
  const rest = pathname.slice(RENDER_PATH_PREFIX.length);
  if (rest.endsWith('.gif')) return { encoded: rest.slice(0, -4), format: 'gif' };
  if (rest.endsWith('.png')) return { encoded: rest.slice(0, -4), format: 'png' };
  return { encoded: rest, format: 'png' };
}

const CONTENT_TYPES: Record<RenderFormat, string> = {
  png: 'image/png',
  gif: 'image/gif',
};

/**
 * Handles `/render/<encoded-algorithm>[.png|.gif]` requests: decode, validate,
 * construct, and render the algorithm. 404s on any decode/validation/
 * construction failure rather than surfacing an error; 413s when the graph
 * is over the render budget (see renderBudget.ts).
 */
export async function renderAlgorithmResponse(request: Request): Promise<Response> {
  const parsed = parseRenderPath(new URL(request.url).pathname);
  if (!parsed) {
    return new Response('Not found', { status: 404 });
  }

  let decoded: unknown;
  try {
    decoded = decodeGraphFromUrl(parsed.encoded);
  } catch {
    return new Response('Not found', { status: 404 });
  }

  if (!compileValidatedGraph(decoded)) {
    return new Response('Not found', { status: 404 });
  }

  const graph = decoded as GeoArtGraph;
  const settings = resolvePreviewSettings(graph);

  let bytes: Uint8Array;
  try {
    bytes = parsed.format === 'gif'
      ? await renderGraphToGif(graph, settings)
      : await renderGraphToPng(graph, settings.staticImageNumTicks);
  } catch (e) {
    if (e instanceof RenderBudgetExceededError) {
      return new Response(`Algorithm is too expensive to render: ${e.message}`, { status: 413 });
    }
    throw e;
  }

  return new Response(new Blob([new Uint8Array(bytes)]), {
    headers: { 'content-type': CONTENT_TYPES[parsed.format] },
  });
}
