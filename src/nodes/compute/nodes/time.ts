/**
 * Pure math for the time node.
 *
 * Returns the tick count unchanged. Unbounded — does not follow the -1..1 rule.
 */
export function evaluateTime(t: number): number {
  return t;
}
