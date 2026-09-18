import type { ResolvedPreviewSettings } from '../schema/previewSettings';

/**
 * Structural limits on what the server will render for one request.
 *
 * Cloudflare Workers freeze `Date.now()` / `performance.now()` while a
 * request is doing synchronous CPU work (timing side-channel mitigation), so
 * a wall-clock budget cannot be enforced from inside the render. Instead the
 * work is bounded up front: how many nodes the compiled graph may have, how
 * many ticks/frames it may run, and how many draw calls each frame (and the
 * whole render) may produce. Draw calls are the real cost driver — the
 * bundled reference graphs all have < 100 nodes, but one of them emits ~63k
 * SVG elements per frame and takes over a second to rasterise.
 */
export type RenderLimits = {
  /** Max nodes in the compiled (module-expanded) graph. */
  maxNodes: number;
  /** Max ticks evaluated for a static image. */
  maxStaticTicks: number;
  /** Max frames in an animated render. */
  maxAnimationFrames: number;
  /** Max engine ticks between two captured frames. */
  maxTicksPerFrame: number;
  /** Max SVG elements held by one canvas layer (checked as they are emitted). */
  maxElementsPerLayer: number;
  /** Max SVG elements rasterised across all frames of one request. */
  maxTotalElements: number;
};

export const RENDER_LIMITS: RenderLimits = {
  maxNodes: 500,
  maxStaticTicks: 600,
  maxAnimationFrames: 100,
  maxTicksPerFrame: 10,
  maxElementsPerLayer: 20_000,
  maxTotalElements: 250_000,
};

export class RenderBudgetExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RenderBudgetExceededError';
  }
}

export function assertNodeCountWithinBudget(nodeCount: number, limits: RenderLimits): void {
  if (nodeCount > limits.maxNodes) {
    throw new RenderBudgetExceededError(`Graph has ${nodeCount} nodes; limit is ${limits.maxNodes}`);
  }
}

/**
 * Tick and frame counts are clamped rather than rejected: a graph that asks
 * for more frames than the server will produce still gets a (shorter)
 * preview rather than no preview at all.
 */
export function clampPreviewSettings(settings: ResolvedPreviewSettings, limits: RenderLimits): ResolvedPreviewSettings {
  return {
    ...settings,
    staticImageNumTicks: Math.min(settings.staticImageNumTicks, limits.maxStaticTicks),
    animationNumFrames: Math.min(settings.animationNumFrames, limits.maxAnimationFrames),
    animationTicksPerFrame: Math.min(settings.animationTicksPerFrame, limits.maxTicksPerFrame),
  };
}

/** Tracks the running total of rasterised elements across frames. */
export function createTotalElementBudget(limits: RenderLimits): { consume(count: number): void } {
  let total = 0;
  return {
    consume(count) {
      total += count;
      if (total > limits.maxTotalElements) {
        throw new RenderBudgetExceededError(
          `Render exceeded ${limits.maxTotalElements} total elements across frames`,
        );
      }
    },
  };
}
