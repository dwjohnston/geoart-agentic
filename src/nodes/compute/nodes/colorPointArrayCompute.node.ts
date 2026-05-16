import { implementComputeNode } from '../implementComputeNode';

/**
 * Pure assembler/passthrough. The evaluator resolves the declared array of
 * static/ref colour points into a single resolved `points` array; this node
 * simply emits that array unchanged.
 *
 * Channels (r/g/b/a) may be `number | null` — `null` meaning "ignore this
 * channel" in a colour shift. We must preserve them as-is and never coerce
 * nulls.
 */
export const colorPointArrayNodeDef = implementComputeNode('colorPointArrayCompute', {
  isTimeDependant: false,
  defaults: {
    points: [],
  },
  evaluate: (inputs) => {
    return {
      points: inputs.points,
    };
  },
});
