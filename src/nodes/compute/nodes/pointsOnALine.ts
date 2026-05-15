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

  // A null channel means 'ignore this channel'; if either endpoint is null
  // there is nothing to interpolate, so the result stays null.
  const lerpChannel = (a: number | null, b: number | null, t: number) =>
    a === null || b === null ? null : a + t * (b - a);

  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return {
      x: pointA.x + t * (pointB.x - pointA.x),
      y: pointA.y + t * (pointB.y - pointA.y),
      r: lerpChannel(pointA.r, pointB.r, t),
      g: lerpChannel(pointA.g, pointB.g, t),
      b: lerpChannel(pointA.b, pointB.b, t),
      a: lerpChannel(pointA.a, pointB.a, t),
      dx: pointB.x - pointA.x,
      dy: pointB.y - pointA.y
    };
  });
}
