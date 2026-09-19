import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import type { ResolvedPreviewSettings } from '../../schema/previewSettings';
import { encodeGraphForUrl } from '../../common-tooling/graphUrlEncoding';

export type ShareOrigin = { origin: string; pathname: string };

/**
 * Link to the app itself with the graph in `?a=`. The server's `og:image`
 * for this page is `/render/<a>`, rendered after `staticImageNumTicks`, so
 * that setting is baked into the link; the graph's other preview settings
 * are left as they were.
 */
export function staticImageShareUrl(
  graph: GeoArtGraph,
  settings: Pick<ResolvedPreviewSettings, 'staticImageNumTicks'>,
  { origin, pathname }: ShareOrigin,
): string {
  const withSettings: GeoArtGraph = {
    ...graph,
    previewSettings: { ...graph.previewSettings, staticImageNumTicks: settings.staticImageNumTicks },
  };
  return `${origin}${pathname}?a=${encodeGraphForUrl(withSettings)}`;
}
