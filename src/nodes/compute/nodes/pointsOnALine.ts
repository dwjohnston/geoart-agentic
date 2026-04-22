export type ColorPointData = { x: number; y: number; r: number; g: number; b: number; a: number };

export function pointsOnALine(
  pointA: ColorPointData,
  pointB: ColorPointData,
  numberOfPoints: number,
): ColorPointData[] {
  const count = Math.max(1, Math.round(numberOfPoints));
  if (count === 1) return [{ ...pointA }];
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return {
      x: pointA.x + t * (pointB.x - pointA.x),
      y: pointA.y + t * (pointB.y - pointA.y),
      r: pointA.r + t * (pointB.r - pointA.r),
      g: pointA.g + t * (pointB.g - pointA.g),
      b: pointA.b + t * (pointB.b - pointA.b),
      a: pointA.a + t * (pointB.a - pointA.a),
    };
  });
}
