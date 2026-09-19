import { describe, expect, spyOn, test } from 'bun:test';
import { GIF_SIZE, parseRenderPath, renderGraphToGif, renderGraphToPng, renderAlgorithmResponse } from './renderAlgorithmMedia';
import type { RenderRouteDeps } from './renderAlgorithmMedia';
import { RENDER_LIMITS, RenderBudgetExceededError } from './renderBudget';
import { encodeGraphForUrl } from '../common-tooling/graphUrlEncoding';
import { DEFAULT_PREVIEW_SETTINGS } from '../schema/previewSettings';
import { testGraph } from '../graphEngine/graphEngine/_testGraphs/testGraph';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const GIF_MAGIC = Buffer.from('GIF89a');

describe('parseRenderPath', () => {
  test('bare path is PNG (original URL shape)', () => {
    expect(parseRenderPath('/render/abc')).toEqual({ encoded: 'abc', format: 'png' });
  });

  test('.png and .gif extensions select the format', () => {
    expect(parseRenderPath('/render/abc.png')).toEqual({ encoded: 'abc', format: 'png' });
    expect(parseRenderPath('/render/abc.gif')).toEqual({ encoded: 'abc', format: 'gif' });
  });

  test('returns null outside /render/', () => {
    expect(parseRenderPath('/other')).toBeNull();
  });
});

describe('renderGraphToPng', () => {
  test('produces a PNG buffer', async () => {
    const png = await renderGraphToPng(testGraph, 5);
    expect(Buffer.from(png.subarray(0, PNG_MAGIC.length))).toEqual(PNG_MAGIC);
  });

  test('throws RenderBudgetExceededError when the graph is over the node limit', async () => {
    await expect(renderGraphToPng(testGraph, 5, { ...RENDER_LIMITS, maxNodes: 1 })).rejects.toBeInstanceOf(
      RenderBudgetExceededError,
    );
  });

  test('throws RenderBudgetExceededError when a layer exceeds its element cap', async () => {
    await expect(
      renderGraphToPng(testGraph, 5, { ...RENDER_LIMITS, maxElementsPerLayer: 0 }),
    ).rejects.toBeInstanceOf(RenderBudgetExceededError);
  });
});

describe('renderGraphToGif', () => {
  test('produces a GIF at GIF_SIZE with the requested frame count', async () => {
    const gif = await renderGraphToGif(testGraph, { ...DEFAULT_PREVIEW_SETTINGS, animationNumFrames: 3 });
    expect(Buffer.from(gif.subarray(0, GIF_MAGIC.length))).toEqual(GIF_MAGIC);
    // Logical screen width/height, little-endian, immediately after the header.
    expect(gif[6] | (gif[7] << 8)).toBe(GIF_SIZE);
    expect(gif[8] | (gif[9] << 8)).toBe(GIF_SIZE);
  });

  test('clamps the frame count to the limit', async () => {
    const limits = { ...RENDER_LIMITS, maxAnimationFrames: 2 };
    const clamped = await renderGraphToGif(testGraph, { ...DEFAULT_PREVIEW_SETTINGS, animationNumFrames: 50 }, limits);
    const two = await renderGraphToGif(testGraph, { ...DEFAULT_PREVIEW_SETTINGS, animationNumFrames: 2 }, limits);
    expect(clamped).toEqual(two);
  });

  test('throws RenderBudgetExceededError when total elements across frames exceed the limit', async () => {
    await expect(
      renderGraphToGif(testGraph, { ...DEFAULT_PREVIEW_SETTINGS, animationNumFrames: 5 }, { ...RENDER_LIMITS, maxTotalElements: 1 }),
    ).rejects.toBeInstanceOf(RenderBudgetExceededError);
  });
});

describe('renderAlgorithmResponse', () => {
  test('returns a PNG image for a valid encoded graph', async () => {
    const request = new Request(`https://example.com/render/${encodeGraphForUrl(testGraph)}`);
    const response = await renderAlgorithmResponse(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
    const bytes = Buffer.from(await response.arrayBuffer());
    expect(bytes.subarray(0, PNG_MAGIC.length)).toEqual(PNG_MAGIC);
  });

  test('returns a GIF for a .gif path', async () => {
    const graph = { ...testGraph, previewSettings: { animationNumFrames: 2 } };
    const request = new Request(`https://example.com/render/${encodeGraphForUrl(graph)}.gif`);
    const response = await renderAlgorithmResponse(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/gif');
    const bytes = Buffer.from(await response.arrayBuffer());
    expect(bytes.subarray(0, GIF_MAGIC.length)).toEqual(GIF_MAGIC);
  });

  test('413s on a graph over the node limit', async () => {
    const manyTimes = Array.from({ length: RENDER_LIMITS.maxNodes + 1 }, (_, i) => ({
      id: `time${i}`,
      type: 'time',
      params: {},
    }));
    const graph = { ...testGraph, compute: { nodes: [...testGraph.compute.nodes, ...manyTimes] } };
    const request = new Request(`https://example.com/render/${encodeGraphForUrl(graph)}`);
    const response = await renderAlgorithmResponse(request);
    expect(response.status).toBe(413);
  });

  test('404s on malformed encoded graph', async () => {
    const request = new Request('https://example.com/render/not-a-valid-encoded-graph!!');
    const response = await renderAlgorithmResponse(request);
    expect(response.status).toBe(404);
  });

  test('404s on a graph that fails schema validation', async () => {
    const request = new Request(`https://example.com/render/${encodeGraphForUrl({ not: 'a graph' })}`);
    const response = await renderAlgorithmResponse(request);
    expect(response.status).toBe(404);
  });

  test('404s for paths outside /render/', async () => {
    const request = new Request('https://example.com/other');
    const response = await renderAlgorithmResponse(request);
    expect(response.status).toBe(404);
  });
});

/** In-memory stand-ins for `env.RENDERS`, `caches.default` and `ctx.waitUntil`. */
function fakeCacheDeps() {
  const r2 = new Map<string, { bytes: ArrayBuffer; contentType?: string }>();
  const cacheApi = new Map<string, Response>();
  const pending: Promise<unknown>[] = [];
  const calls = { png: 0, gif: 0, r2Get: 0, cacheMatch: 0, waitUntil: 0 };

  const renders = {
    async get(key: string) {
      calls.r2Get++;
      const stored = r2.get(key);
      if (!stored) return null;
      return { body: new Blob([stored.bytes]).stream() };
    },
    async put(key: string, value: Blob, options?: { httpMetadata?: { contentType?: string } }) {
      r2.set(key, { bytes: await value.arrayBuffer(), contentType: options?.httpMetadata?.contentType });
      return {};
    },
  } as unknown as R2Bucket;

  const cache = {
    async match(request: Request) {
      calls.cacheMatch++;
      return cacheApi.get(request.url)?.clone();
    },
    async put(request: Request, response: Response) {
      cacheApi.set(request.url, response);
    },
  } as unknown as Cache;

  const renderers = {
    png: (...args: Parameters<typeof renderGraphToPng>) => {
      calls.png++;
      return renderGraphToPng(...args);
    },
    gif: (...args: Parameters<typeof renderGraphToGif>) => {
      calls.gif++;
      return renderGraphToGif(...args);
    },
  };

  const deps: RenderRouteDeps = {
    renders,
    cache,
    renderers,
    waitUntil: promise => {
      calls.waitUntil++;
      pending.push(promise);
    },
  };

  return {
    deps,
    r2,
    cacheApi,
    calls,
    /** Awaits everything handed to `waitUntil` so far. */
    flush: () => Promise.all(pending.splice(0)),
  };
}

describe('renderAlgorithmResponse caching', () => {
  const pngUrl = `https://example.com/render/${encodeGraphForUrl(testGraph)}`;
  const gifGraph = { ...testGraph, previewSettings: { animationNumFrames: 2 } };
  const gifUrl = `https://example.com/render/${encodeGraphForUrl(gifGraph)}.gif`;

  test('miss renders, responds immutable, and stores in R2 and the Cache API', async () => {
    const f = fakeCacheDeps();
    const response = await renderAlgorithmResponse(new Request(pngUrl), f.deps);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    expect(f.calls.png).toBe(1);

    // Both stores go through waitUntil rather than blocking the response.
    expect(f.calls.waitUntil).toBe(2);
    await f.flush();
    expect(f.r2.size).toBe(1);
    expect(f.cacheApi.size).toBe(1);

    const [key, stored] = [...f.r2.entries()][0];
    expect(key).toMatch(/^renders\/[0-9a-f]{64}\.png$/);
    expect(stored.contentType).toBe('image/png');
    expect(Buffer.from(stored.bytes)).toEqual(Buffer.from(await response.arrayBuffer()));
  });

  test('Cache API hit returns without rendering or touching R2', async () => {
    const f = fakeCacheDeps();
    await renderAlgorithmResponse(new Request(pngUrl), f.deps);
    await f.flush();

    const second = await renderAlgorithmResponse(new Request(pngUrl), f.deps);
    expect(second.status).toBe(200);
    expect(f.calls.png).toBe(1);
    expect(f.calls.r2Get).toBe(1);
    expect(Buffer.from(await second.arrayBuffer()).subarray(0, PNG_MAGIC.length)).toEqual(PNG_MAGIC);
  });

  test('R2 hit skips rendering and repopulates the Cache API', async () => {
    const f = fakeCacheDeps();
    await renderAlgorithmResponse(new Request(gifUrl), f.deps);
    await f.flush();
    f.cacheApi.clear();

    const second = await renderAlgorithmResponse(new Request(gifUrl), f.deps);
    expect(second.status).toBe(200);
    expect(second.headers.get('content-type')).toBe('image/gif');
    expect(second.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    expect(f.calls.gif).toBe(1);
    expect(Buffer.from(await second.arrayBuffer()).subarray(0, GIF_MAGIC.length)).toEqual(GIF_MAGIC);

    await f.flush();
    expect(f.cacheApi.size).toBe(1);
  });

  test('clamped-equivalent requests share one cache entry', async () => {
    const f = fakeCacheDeps();
    const over = { ...testGraph, previewSettings: { animationNumFrames: RENDER_LIMITS.maxAnimationFrames + 1 } };
    const atCap = { ...testGraph, previewSettings: { animationNumFrames: RENDER_LIMITS.maxAnimationFrames } };
    // Keep the test quick: the key is computed before the renderer runs, so
    // rendering 2 frames instead of 100 does not affect what is being proved.
    f.deps.renderers!.gif = (graph, settings) => {
      f.calls.gif++;
      return renderGraphToGif(graph, { ...settings, animationNumFrames: 2 });
    };

    await renderAlgorithmResponse(new Request(`https://example.com/render/${encodeGraphForUrl(over)}.gif`), f.deps);
    await f.flush();
    await renderAlgorithmResponse(new Request(`https://example.com/render/${encodeGraphForUrl(atCap)}.gif`), f.deps);
    expect(f.calls.gif).toBe(1);
    expect(f.r2.size).toBe(1);
  });

  test('works with no cache layers at all', async () => {
    const f = fakeCacheDeps();
    const response = await renderAlgorithmResponse(new Request(pngUrl), { renderers: f.deps.renderers });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
  });

  test('falls through to rendering when a cache layer throws', async () => {
    const f = fakeCacheDeps();
    const down = async () => {
      throw new Error('down');
    };
    f.deps.cache = { match: down, put: down } as unknown as Cache;
    f.deps.renders = { get: down, put: down } as unknown as R2Bucket;
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const response = await renderAlgorithmResponse(new Request(pngUrl), f.deps);
      expect(response.status).toBe(200);
      expect(f.calls.png).toBe(1);
      // Background writes fail too, but must settle rather than reject.
      await expect(f.flush()).resolves.toBeDefined();
      expect(warn).toHaveBeenCalledTimes(4);
    } finally {
      warn.mockRestore();
    }
  });

  test('413 (budget overrun) is not stored', async () => {
    const f = fakeCacheDeps();
    const manyTimes = Array.from({ length: RENDER_LIMITS.maxNodes + 1 }, (_, i) => ({
      id: `time${i}`,
      type: 'time',
      params: {},
    }));
    const graph = { ...testGraph, compute: { nodes: [...testGraph.compute.nodes, ...manyTimes] } };
    const response = await renderAlgorithmResponse(new Request(`https://example.com/render/${encodeGraphForUrl(graph)}`), f.deps);
    expect(response.status).toBe(413);
    await f.flush();
    expect(f.r2.size).toBe(0);
    expect(f.cacheApi.size).toBe(0);
  });

  test('404 (invalid graph) never touches the caches', async () => {
    const f = fakeCacheDeps();
    const response = await renderAlgorithmResponse(
      new Request(`https://example.com/render/${encodeGraphForUrl({ not: 'a graph' })}`),
      f.deps,
    );
    expect(response.status).toBe(404);
    expect(f.calls.cacheMatch).toBe(0);
    expect(f.calls.r2Get).toBe(0);
    await f.flush();
    expect(f.r2.size).toBe(0);
    expect(f.cacheApi.size).toBe(0);
  });

  test('5xx (render throws) is not stored', async () => {
    const f = fakeCacheDeps();
    f.deps.renderers!.png = async () => {
      throw new Error('boom');
    };
    await expect(renderAlgorithmResponse(new Request(pngUrl), f.deps)).rejects.toThrow('boom');
    await f.flush();
    expect(f.r2.size).toBe(0);
    expect(f.cacheApi.size).toBe(0);
  });
});
