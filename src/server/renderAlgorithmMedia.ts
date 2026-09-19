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
import { cacheApiRequestFor, computeRenderCacheKey, r2KeyFor } from './renderCache';

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
  /** The accumulated artwork only — no live-layer guides. */
  paintElements(): string[];
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
    paintElements: () => [...paint.getSvgElements()],
    compositeElements: () => [...paint.getSvgElements(), ...live.getSvgElements()],
  };
}

/**
 * Runs the graph headlessly for `numTicks` ticks and rasterises the paint
 * layer over a black background to a PNG. The live layer (per-frame
 * guides) is left out so the shared image is the artwork alone.
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

  const elements = engine.paintElements();
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
 * Renders are a pure function of their cache key, so once produced they never
 * change — the key itself changes (via RENDER_VERSION) when the output would.
 */
const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable';

export type RenderRouteDeps = {
  /** `env.RENDERS` — durable, global source of truth for finished renders. */
  renders?: R2Bucket;
  /**
   * `caches.default` — fast, per-data-centre, best-effort. Note that the
   * Cache API is a no-op on `*.workers.dev`: `put` succeeds silently and
   * `match` always misses. It only functions on a custom domain, so every
   * path here must work with it missing — R2 still serves hits there.
   */
  cache?: Cache;
  /** `ctx.waitUntil` — lets the cache writes outlive the response. */
  waitUntil?: (promise: Promise<unknown>) => void;
  /** Overridable so tests can assert that a cache hit skips rendering. */
  renderers?: {
    png: typeof renderGraphToPng;
    gif: typeof renderGraphToGif;
  };
};

function defaultCache(): Cache | undefined {
  // `caches` is a Workers global; absent under Bun (tests). Typed structurally
  // because the DOM lib's `CacheStorage` (pulled in by tsconfig.worker.json)
  // has no `default` member.
  const storage = (globalThis as { caches?: { default?: Cache } }).caches;
  return storage?.default;
}

function mediaResponse(body: BodyInit, format: RenderFormat): Response {
  return new Response(body, {
    headers: {
      'content-type': CONTENT_TYPES[format],
      'cache-control': IMMUTABLE_CACHE_CONTROL,
    },
  });
}

/**
 * Swallows a failing background cache write: the response has already been
 * sent, and a broken cache must never turn into a failed request or an
 * unhandled rejection in `waitUntil`.
 */
function logCacheFailure(stage: string): (e: unknown) => void {
  return e => console.warn(`render cache: ${stage} failed`, e);
}

/**
 * Handles `/render/<encoded-algorithm>[.png|.gif]` requests: decode, validate,
 * construct, and render the algorithm. 404s on any decode/validation/
 * construction failure rather than surfacing an error; 413s when the graph
 * is over the render budget (see renderBudget.ts).
 *
 * Successful renders are cached in two layers, checked in order:
 *   1. Cache API (`deps.cache`) — fast, per-data-centre, best-effort.
 *   2. R2 (`deps.renders`) — durable, global. A hit here also repopulates
 *      the Cache API in the background.
 * A miss in both renders within the budget, responds, then writes to both
 * layers via `waitUntil` so the caller never waits on storage.
 *
 * The cache key is computed only after decoding, validation, default
 * resolution and clamping, so equivalent requests share one entry and
 * invalid or oversized graphs never reach the caches. Errors (404 / 413 /
 * 5xx) are never stored.
 */
export async function renderAlgorithmResponse(request: Request, deps: RenderRouteDeps = {}): Promise<Response> {
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
  const settings = clampPreviewSettings(resolvePreviewSettings(graph), RENDER_LIMITS);
  const { format } = parsed;

  const cache = deps.cache ?? defaultCache();
  const renders = deps.renders;
  const waitUntil = deps.waitUntil ?? (promise => void promise.catch(() => {}));
  const cacheKey = await computeRenderCacheKey({ graph, settings, format });
  const cacheRequest = cacheApiRequestFor(request.url, cacheKey, format);
  const r2Key = r2KeyFor(cacheKey, format);

  if (cache) {
    try {
      const hit = await cache.match(cacheRequest);
      if (hit) return hit;
    } catch (e) {
      logCacheFailure('Cache API match')(e);
    }
  }

  if (renders) {
    try {
      const object = await renders.get(r2Key);
      if (object) {
        const response = mediaResponse(object.body, format);
        if (cache) {
          waitUntil(cache.put(cacheRequest, response.clone()).catch(logCacheFailure('Cache API put')));
        }
        return response;
      }
    } catch (e) {
      logCacheFailure('R2 get')(e);
    }
  }

  const renderers = deps.renderers ?? { png: renderGraphToPng, gif: renderGraphToGif };
  let bytes: Uint8Array;
  try {
    bytes = format === 'gif'
      ? await renderers.gif(graph, settings)
      : await renderers.png(graph, settings.staticImageNumTicks);
  } catch (e) {
    if (e instanceof RenderBudgetExceededError) {
      return new Response(`Algorithm is too expensive to render: ${e.message}`, { status: 413 });
    }
    throw e;
  }

  // Copy out of any WASM-backed buffer before handing the bytes to three consumers.
  const blob = new Blob([new Uint8Array(bytes)]);
  if (renders) {
    waitUntil(
      renders
        .put(r2Key, blob, { httpMetadata: { contentType: CONTENT_TYPES[format] } })
        .catch(logCacheFailure('R2 put')),
    );
  }
  if (cache) {
    waitUntil(cache.put(cacheRequest, mediaResponse(blob, format)).catch(logCacheFailure('Cache API put')));
  }
  return mediaResponse(blob, format);
}
