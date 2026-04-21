/**
 * Pure math for the time node.
 *
 * Returns elapsed time in seconds. This is the one exception to the -1..1
 * output range rule — time is unbounded raw seconds.
 */
export function evaluateTime(t: number): number {
  return t;
}
