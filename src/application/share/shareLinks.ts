import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import type { ResolvedPreviewSettings } from '../../schema/previewSettings';
import { encodeGraphForUrl } from '../../common-tooling/graphUrlEncoding';

export type ShareOrigin = { origin: string; pathname: string };

/**
 * Link to the app itself with the graph in `?a=`. The server's `og:image`
 * for this page is `/render/<a>`, rendered after `staticImageNumTicks`, so
 * only the static-image setting is baked into the link — the animation
 * controls leave it unchanged.
 */
export function staticImageShareUrl(
  graph: GeoArtGraph,
  settings: ResolvedPreviewSettings,
  { origin, pathname }: ShareOrigin,
): string {
  const encoded = encodeGraphForUrl(withPreviewSettings(graph, { staticImageNumTicks: settings.staticImageNumTicks }));
  return `${origin}${pathname}?a=${encoded}`;
}

/**
 * Direct link to the server-rendered looping GIF, for sites (Reddit etc.)
 * that preview GIF URLs inline. Only the animation settings are baked in.
 */
export function gifShareUrl(
  graph: GeoArtGraph,
  settings: ResolvedPreviewSettings,
  { origin }: Pick<ShareOrigin, 'origin'>,
): string {
  const encoded = encodeGraphForUrl(
    withPreviewSettings(graph, {
      animationNumFrames: settings.animationNumFrames,
      animationTicksPerFrame: settings.animationTicksPerFrame,
      animationFrameDelayMs: settings.animationFrameDelayMs,
    }),
  );
  return `${origin}/render/${encoded}.gif`;
}

function withPreviewSettings(graph: GeoArtGraph, overrides: Partial<ResolvedPreviewSettings>): GeoArtGraph {
  return { ...graph, previewSettings: { ...graph.previewSettings, ...overrides } };
}
