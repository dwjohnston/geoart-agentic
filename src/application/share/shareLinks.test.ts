import { describe, expect, test } from 'bun:test';
import { staticImageShareUrl } from './shareLinks';
import { decodeGraphFromUrl } from '../../common-tooling/graphUrlEncoding';
import minimalGraph from '../../algorithms/reference/minimal/minimalThreeNodeReferenceGraph';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';

const origin = { origin: 'https://example.test', pathname: '/' };
const graph: GeoArtGraph = { ...minimalGraph, previewSettings: { staticImageNumTicks: 5, animationFrameDelayMs: 30 } };

describe('staticImageShareUrl', () => {
  test('links to the app with the static-image setting overridden and other settings kept', () => {
    const url = staticImageShareUrl(graph, { staticImageNumTicks: 12 }, origin);
    expect(url.startsWith('https://example.test/?a=')).toBe(true);
    const decoded = decodeGraphFromUrl(new URL(url).searchParams.get('a')!) as GeoArtGraph;
    expect(decoded.previewSettings).toEqual({ staticImageNumTicks: 12, animationFrameDelayMs: 30 });
    expect(decoded.compute).toEqual(graph.compute);
  });
});
