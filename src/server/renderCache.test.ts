import { describe, expect, test } from 'bun:test';
import { RENDER_VERSION, cacheApiRequestFor, canonicalJson, computeRenderCacheKey, r2KeyFor } from './renderCache';
import { RENDER_LIMITS, clampPreviewSettings } from './renderBudget';
import { DEFAULT_PREVIEW_SETTINGS, resolvePreviewSettings } from '../schema/previewSettings';
import { testGraph } from '../graphEngine/graphEngine/_testGraphs/testGraph';
import type { GeoArtGraph } from '../schema/_generated/schema-types';

const base = { graph: testGraph, settings: DEFAULT_PREVIEW_SETTINGS, format: 'png' as const };

describe('canonicalJson', () => {
  test('sorts object keys at every level and keeps array order', () => {
    expect(canonicalJson({ b: 1, a: { d: [2, 1], c: 0 } })).toBe('{"a":{"c":0,"d":[2,1]},"b":1}');
  });

  test('drops undefined values', () => {
    expect(canonicalJson({ a: undefined, b: 1 })).toBe('{"b":1}');
  });
});

describe('computeRenderCacheKey', () => {
  test('is a 64-char hex SHA-256', async () => {
    expect(await computeRenderCacheKey(base)).toMatch(/^[0-9a-f]{64}$/);
  });

  test('same inputs give the same key', async () => {
    expect(await computeRenderCacheKey(base)).toBe(await computeRenderCacheKey({ ...base }));
  });

  test('graph property order does not affect the key', async () => {
    const reordered = Object.fromEntries(Object.entries(testGraph).reverse()) as GeoArtGraph;
    expect(Object.keys(reordered)).not.toEqual(Object.keys(testGraph));
    expect(await computeRenderCacheKey({ ...base, graph: reordered })).toBe(await computeRenderCacheKey(base));
  });

  test('different graph gives a different key', async () => {
    const graph: GeoArtGraph = { ...testGraph, title: `${testGraph.title ?? ''} (changed)` };
    expect(await computeRenderCacheKey({ ...base, graph })).not.toBe(await computeRenderCacheKey(base));
  });

  test('different settings give a different key', async () => {
    const settings = { ...DEFAULT_PREVIEW_SETTINGS, staticImageNumTicks: DEFAULT_PREVIEW_SETTINGS.staticImageNumTicks + 1 };
    expect(await computeRenderCacheKey({ ...base, settings })).not.toBe(await computeRenderCacheKey(base));
  });

  test('different format gives a different key', async () => {
    expect(await computeRenderCacheKey({ ...base, format: 'gif' })).not.toBe(await computeRenderCacheKey(base));
  });

  test('different RENDER_VERSION gives a different key', async () => {
    expect(await computeRenderCacheKey({ ...base, renderVersion: RENDER_VERSION + 1 })).not.toBe(
      await computeRenderCacheKey(base),
    );
  });

  test('clamped-equivalent settings collapse to one key', async () => {
    const over = { ...testGraph, previewSettings: { animationNumFrames: RENDER_LIMITS.maxAnimationFrames + 50 } };
    const atCap = { ...testGraph, previewSettings: { animationNumFrames: RENDER_LIMITS.maxAnimationFrames } };
    const keyFor = (graph: typeof over) =>
      computeRenderCacheKey({
        graph,
        settings: clampPreviewSettings(resolvePreviewSettings(graph), RENDER_LIMITS),
        format: 'gif',
      });
    expect(await keyFor(over)).toBe(await keyFor(atCap));
  });

  test('explicit default settings key the same as omitted settings', async () => {
    const explicit: GeoArtGraph = { ...testGraph, previewSettings: { ...DEFAULT_PREVIEW_SETTINGS } };
    const omitted: GeoArtGraph = { ...testGraph, previewSettings: undefined };
    const keyFor = (graph: GeoArtGraph) =>
      computeRenderCacheKey({ graph, settings: resolvePreviewSettings(graph), format: 'png' });
    expect(await keyFor(explicit)).toBe(await keyFor(omitted));
  });
});

describe('key helpers', () => {
  test('r2KeyFor namespaces by format', () => {
    expect(r2KeyFor('abc', 'gif')).toBe('renders/abc.gif');
  });

  test('cacheApiRequestFor keeps the origin and drops the encoded graph', () => {
    const req = cacheApiRequestFor('https://example.com/render/LONGENCODEDGRAPH.gif', 'abc', 'gif');
    expect(req.url).toBe('https://example.com/__render-cache/abc.gif');
    expect(req.method).toBe('GET');
  });
});
