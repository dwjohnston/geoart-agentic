import { describe, expect, test } from 'bun:test';
import { gifShareUrl, staticImageShareUrl } from './shareLinks';
import { decodeGraphFromUrl } from '../../common-tooling/graphUrlEncoding';
import minimalGraph from '../../algorithms/reference/minimal/minimalThreeNodeReferenceGraph';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';

const origin = { origin: 'https://example.test', pathname: '/' };
const graph: GeoArtGraph = { ...minimalGraph, previewSettings: { staticImageNumTicks: 5, animationFrameDelayMs: 30 } };
const settings = { staticImageNumTicks: 12, animationNumFrames: 20, animationTicksPerFrame: 2, animationFrameDelayMs: 50 };

function decodeParam(url: string, extract: (u: URL) => string): GeoArtGraph {
  return decodeGraphFromUrl(extract(new URL(url))) as GeoArtGraph;
}

describe('staticImageShareUrl', () => {
  test('links to the app with only the static-image setting overridden', () => {
    const url = staticImageShareUrl(graph, settings, origin);
    expect(url.startsWith('https://example.test/?a=')).toBe(true);
    const decoded = decodeParam(url, u => u.searchParams.get('a')!);
    expect(decoded.previewSettings).toEqual({ staticImageNumTicks: 12, animationFrameDelayMs: 30 });
    expect(decoded.compute).toEqual(graph.compute);
  });

  test('is unaffected by the animation settings', () => {
    const a = staticImageShareUrl(graph, settings, origin);
    const b = staticImageShareUrl(graph, { ...settings, animationNumFrames: 99 }, origin);
    expect(a).toBe(b);
  });
});

describe('gifShareUrl', () => {
  test('links to the .gif render route with only the animation settings overridden', () => {
    const url = gifShareUrl(graph, settings, origin);
    expect(url.startsWith('https://example.test/render/')).toBe(true);
    expect(url.endsWith('.gif')).toBe(true);
    const decoded = decodeParam(url, u => u.pathname.slice('/render/'.length, -'.gif'.length));
    expect(decoded.previewSettings).toEqual({
      staticImageNumTicks: 5,
      animationNumFrames: 20,
      animationTicksPerFrame: 2,
      animationFrameDelayMs: 50,
    });
  });

  test('is unaffected by the static-image setting', () => {
    const a = gifShareUrl(graph, settings, origin);
    const b = gifShareUrl(graph, { ...settings, staticImageNumTicks: 99 }, origin);
    expect(a).toBe(b);
  });
});
