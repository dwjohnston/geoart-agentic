/**
 * Pure math for the orbit node.
 *
 * Computes a point on a circle given radius, speed, and elapsed time.
 *
 * Formula:
 *   x = radius * cos(speed * t * 2π)
 *   y = radius * sin(speed * t * 2π)
 *
 * Output is in -1..1 when radius is in 0..1 (normalised).
 */
export function evaluateOrbit(
  radius: number,
  speed: number,
  t: number,
  cx = 0,
  cy = 0,
): { x: number; y: number } {
  const angle = speed * t * 2 * Math.PI;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}
