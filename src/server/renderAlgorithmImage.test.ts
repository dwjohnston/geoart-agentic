import { describe, expect, test } from 'bun:test';
import { getStaticImageNumTicks, renderGraphToPng, renderAlgorithmResponse } from './renderAlgorithmImage';
import { encodeGraphForUrl } from '../common-tooling/graphUrlEncoding';
import { testGraph } from '../graphEngine/graphEngine/_testGraphs/testGraph';
import type { GeoArtGraph } from '../schema/_generated/schema-types';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('getStaticImageNumTicks', () => {
  test('defaults to 10 when previewSettings is absent', () => {
    expect(getStaticImageNumTicks(testGraph)).toBe(10);
  });

  test('uses previewSettings.staticImageNumTicks when present', () => {
    const graph: GeoArtGraph = { ...testGraph, previewSettings: { staticImageNumTicks: 3 } };
    expect(getStaticImageNumTicks(graph)).toBe(3);
  });
});

describe('renderGraphToPng', () => {
  test('produces a PNG buffer', async () => {
    const png = await renderGraphToPng(testGraph, 5);
    expect(Buffer.from(png.subarray(0, PNG_MAGIC.length))).toEqual(PNG_MAGIC);
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
