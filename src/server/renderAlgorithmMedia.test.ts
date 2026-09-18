import { describe, expect, test } from 'bun:test';
import { GIF_SIZE, parseRenderPath, renderGraphToGif, renderGraphToPng, renderAlgorithmResponse } from './renderAlgorithmMedia';
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
