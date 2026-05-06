import type { ResolvedValue } from "../../../schema/typeHelpers";


export interface Sampler {
  sample(t: number): number;
  sampleMany(ts: number[]): number[];
}

export function pointsOnALine(
  pointA: ResolvedValue<"colorPointValue">,
  pointB: ResolvedValue<"colorPointValue">,
  numberOfPoints: number,
  modulateBy?: Sampler | null,
): ResolvedValue<"colorPointValue">[] {
  const count = Math.max(1, Math.round(numberOfPoints));
  if (count === 1) return [{ ...pointA }];

  const points = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return {
      x: pointA.x + t * (pointB.x - pointA.x),
      y: pointA.y + t * (pointB.y - pointA.y),
      r: pointA.r + t * (pointB.r - pointA.r),
      g: pointA.g + t * (pointB.g - pointA.g),
      b: pointA.b + t * (pointB.b - pointA.b),
      a: pointA.a + t * (pointB.a - pointA.a),

      // Default gradient, just the gradient of the line
      dx: pointB.x - pointA.x,
      dy: pointB.y - pointA.y
    };
  });

  // Apply modulation if sampler is provided
  if (!modulateBy) {
    return points;
  }

  const lineVector = {
    x: pointB.x - pointA.x,
    y: pointB.y - pointA.y,
  };
  const lineLength = Math.sqrt(lineVector.x ** 2 + lineVector.y ** 2);

  // Handle degenerate case where start and end points are the same
  if (lineLength === 0) {
    return points;
  }

  // Perpendicular vector (90° rotation of line vector, normalised)
  const perpVector = {
    x: -lineVector.y / lineLength,
    y: lineVector.x / lineLength,
  };

  return points.map((point, i) => {
    const t = i / count
    const displacement = modulateBy.sample(t);

    return {
      //nb. for now, the gradient stays the same 
      ...point,
      x: point.x + perpVector.x * displacement,
      y: point.y + perpVector.y * displacement,


    };
  });
}
