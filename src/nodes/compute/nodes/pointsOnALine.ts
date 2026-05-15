import type { ResolvedValue } from "../../../schema/typeHelpers";


export interface Sampler {
  sample(t: number): number;
  sampleMany(ts: number[]): number[];
}

export function pointsOnALine(
  pointA: ResolvedValue<"colorPointValue">,
  pointB: ResolvedValue<"colorPointValue">,
  numberOfPoints: number,
): ResolvedValue<"colorPointValue">[] {
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
      dx: pointB.x - pointA.x,
      dy: pointB.y - pointA.y
    };
  });
}
