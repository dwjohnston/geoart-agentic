import type { GeoArtGraph } from './_generated/schema-types';

/**
 * Fully-resolved `previewSettings` — every field present. Shared by the
 * client export UI and the server render routes so both produce the same
 * frames for the same graph.
 */
export type ResolvedPreviewSettings = {
  staticImageNumTicks: number;
  animationNumFrames: number;
  animationTicksPerFrame: number;
  animationFrameDelayMs: number;
};

export const DEFAULT_PREVIEW_SETTINGS: ResolvedPreviewSettings = {
  staticImageNumTicks: 10,
  animationNumFrames: 40,
  animationTicksPerFrame: 1,
  animationFrameDelayMs: 40,
};

export function resolvePreviewSettings(graph: Pick<GeoArtGraph, 'previewSettings'>): ResolvedPreviewSettings {
  return { ...DEFAULT_PREVIEW_SETTINGS, ...stripUndefined(graph.previewSettings ?? {}) };
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) (out as Record<string, unknown>)[key] = value;
  }
  return out;
}
