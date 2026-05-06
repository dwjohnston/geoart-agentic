/**
 * Pure math for the orbit node.
 *
 * Computes a point on an ellipse given radius, speed, elapsed time, eccentricity, and tilt.
 *
 * Formula (before tilt rotation):
 *   px = radius * cos(angle)
 *   py = radius * (1 - eccentricity) * sin(angle)
 *
 * Tilt rotates the ellipse by tilt * 2π radians:
 *   x = cx + px * cos(tilt_rad) - py * sin(tilt_rad)
 *   y = cy + px * sin(tilt_rad) + py * cos(tilt_rad)
 *
 * speed=1 → one complete orbit per 600 ticks (~10 s at 60 fps).
 * eccentricity=0 → circle; eccentricity=1 → flat line along the tilt axis.
 * Output is in -1..1 when radius is in 0..1 (normalised).
 */
export function evaluateOrbit(
  radius: number,
  speed: number,
  t: number,
  cx = 0,
  cy = 0,
  phase = 0,
  eccentricity = 0,
  tilt = 0,
): { x: number; y: number } {
  const phaseRadians = phase * 2 * Math.PI;
  const angle = speed * (t / 600) * 2 * Math.PI + phaseRadians;
  const tiltRadians = tilt * 2 * Math.PI;
  const px = radius * Math.cos(angle);
  const py = radius * (1 - eccentricity) * Math.sin(angle);
  return {
    x: cx + px * Math.cos(tiltRadians) - py * Math.sin(tiltRadians),
    y: cy + px * Math.sin(tiltRadians) + py * Math.cos(tiltRadians),
  };
}

/**
 * Computes multiple evenly-spaced points on an elliptical orbit.
 *
 * Points are distributed evenly around the ellipse. When numPoints > 1,
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
  eccentricity = 0,
  tilt = 0,
): Array<{ x: number; y: number }> {
  const phaseRadians = phase * 2 * Math.PI;
  const baseAngle = speed * (t / 600) * 2 * Math.PI + phaseRadians;
  const tiltRadians = tilt * 2 * Math.PI;
  const spacing = (2 * Math.PI) / Math.max(1, numPoints);

  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = baseAngle + i * spacing;
    const px = radius * Math.cos(angle);
    const py = radius * (1 - eccentricity) * Math.sin(angle);
    points.push({
      x: cx + px * Math.cos(tiltRadians) - py * Math.sin(tiltRadians),
      y: cy + px * Math.sin(tiltRadians) + py * Math.cos(tiltRadians),
    });
  }
  return points;
}
