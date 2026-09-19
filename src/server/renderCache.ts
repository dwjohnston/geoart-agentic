import type { ResolvedPreviewSettings } from '../schema/previewSettings';
import type { GeoArtGraph } from '../schema/_generated/schema-types';

/**
 * Bump this whenever the rasteriser, compositor, encoder or canvas shim
 * changes what a given graph renders to. It is part of every cache key, so
 * bumping it orphans every stored render rather than serving stale pixels.
 */
export const RENDER_VERSION = 1;

export type RenderCacheFormat = 'png' | 'gif';

export type RenderCacheKeyInput = {
  graph: GeoArtGraph;
  /** Already resolved against defaults and clamped to the render limits. */
  settings: ResolvedPreviewSettings;
  format: RenderCacheFormat;
  renderVersion?: number;
};

/**
 * Serialises a value with object keys sorted at every level, so two graphs
 * that differ only in property order produce the same string. Arrays keep
 * their order — node order is meaningful.
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value));
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      const v = (value as Record<string, unknown>)[key];
      if (v !== undefined) out[key] = sortKeysDeep(v);
    }
    return out;
  }
  return value;
}

/**
 * SHA-256 hex of the canonical graph, the resolved + clamped preview
 * settings, the output format and RENDER_VERSION. Two requests whose URLs
 * differ but that would render identical bytes share one key. The graph's
 * own `previewSettings` are left out: `settings` carries the resolved and
 * clamped values, so a graph asking for 500 frames keys the same as one
 * asking for the 100-frame cap it actually gets.
 */
export async function computeRenderCacheKey(input: RenderCacheKeyInput): Promise<string> {
  const { previewSettings: _ignored, ...graphWithoutPreview } = input.graph;
  const material = canonicalJson({
    v: input.renderVersion ?? RENDER_VERSION,
    format: input.format,
    graph: graphWithoutPreview,
    settings: input.settings,
  });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(material));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

/** R2 object key for a render. */
export function r2KeyFor(cacheKey: string, format: RenderCacheFormat): string {
  return `renders/${cacheKey}.${format}`;
}

/**
 * Synthetic request used as the Cache API key. The real request URL carries
 * the long, unnormalised encoded graph; keying on the hash instead means
 * equivalent URLs hit the same entry. The origin is kept so the entry is
 * scoped to this deployment's host.
 */
export function cacheApiRequestFor(requestUrl: string, cacheKey: string, format: RenderCacheFormat): Request {
  const url = new URL(requestUrl);
  return new Request(`${url.origin}/__render-cache/${cacheKey}.${format}`, { method: 'GET' });
}
