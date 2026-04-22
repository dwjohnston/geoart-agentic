/**
 * Pure math for the orbit node.
 *
 * Computes a point on a circle given radius, speed, and elapsed time.
 *
 * Formula:
 *   x = radius * cos(speed * t * 2π + phase)
 *   y = radius * sin(speed * t * 2π + phase)
 *
 * Output is in -1..1 when radius is in 0..1 (normalised).
 */
export function evaluateOrbit(
  radius: number,
  speed: number,
  t: number,
  cx = 0,
  cy = 0,
  phase = 0,
): { x: number; y: number } {
  const phaseRadians = phase * 2 * Math.PI;
  const angle = speed * t * 2 * Math.PI + phaseRadians;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

/**
 * Computes multiple evenly-spaced points on a circular orbit.
 *
 * Points are distributed evenly around the circle. When numPoints > 1,
 * the angular spacing between points is 2π / numPoints.
 */
export function evaluateOrbitPoints(
  radius: number,
  speed: number,
  t: number,
  numPoints: number,
  phase: number,
  cx = 0,
  cy = 0,
): Array<{ x: number; y: number }> {
  const phaseRadians = phase * 2 * Math.PI;
  const baseAngle = speed * t * 2 * Math.PI + phaseRadians;
  const spacing = (2 * Math.PI) / Math.max(1, numPoints);

  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = baseAngle + i * spacing;
    points.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }
  return points;
}
