import type { ResolvedValue } from '../../../schema/typeHelpers';
import { implementComputeNode } from '../implementComputeNode';

type ColorPoint = ResolvedValue<'colorPointValue'>;

const NUM_SEGMENT_SAMPLES = 50;

function lerpChannel(a: number | null, b: number | null, t: number): number | null {
  if (a === null && b === null) return null;
  const aVal = a ?? 0;
  const bVal = b ?? 0;
  return aVal + t * (bVal - aVal);
}

function lerpPoint(p0: ColorPoint, p1: ColorPoint, t: number, dx: number, dy: number): ColorPoint {
  return {
    x: p0.x + t * (p1.x - p0.x),
    y: p0.y + t * (p1.y - p0.y),
    r: lerpChannel(p0.r, p1.r, t),
    g: lerpChannel(p0.g, p1.g, t),
    b: lerpChannel(p0.b, p1.b, t),
    a: lerpChannel(p0.a, p1.a, t),
    dx,
    dy,
  };
}

// --- Straight mode ---

function buildPolylineArcLengths(pts: ColorPoint[]): number[] {
  const lengths: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    const ddx = pts[i].x - pts[i - 1].x;
    const ddy = pts[i].y - pts[i - 1].y;
    lengths.push(lengths[i - 1] + Math.sqrt(ddx * ddx + ddy * ddy));
  }
  return lengths;
}

function sampleStraight(pts: ColorPoint[], arcLengths: number[], s: number): ColorPoint {
  const total = arcLengths[arcLengths.length - 1];
  if (total === 0) {
    return { ...pts[0], dx: 0, dy: 0 };
  }

  const target = Math.min(Math.max(s, 0), total);

  // Find segment containing target
  let seg = arcLengths.length - 2;
  for (let i = 0; i < arcLengths.length - 1; i++) {
    if (target <= arcLengths[i + 1]) {
      seg = i;
      break;
    }
  }

  const segLen = arcLengths[seg + 1] - arcLengths[seg];
  const t = segLen === 0 ? 0 : (target - arcLengths[seg]) / segLen;

  const ddx = pts[seg + 1].x - pts[seg].x;
  const ddy = pts[seg + 1].y - pts[seg].y;

  return lerpPoint(pts[seg], pts[seg + 1], t, ddx, ddy);
}

function distributeOnPolyline(pts: ColorPoint[], numPoints: number): ColorPoint[] {
  const arcLengths = buildPolylineArcLengths(pts);
  const total = arcLengths[arcLengths.length - 1];

  return Array.from({ length: numPoints }, (_, i) => {
    const s = numPoints === 1 ? 0 : (i / (numPoints - 1)) * total;
    return sampleStraight(pts, arcLengths, s);
  });
}

// --- Catmull-Rom mode ---

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  return 0.5 * (
    2 * p1 +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
  );
}

function catmullRomTangent(p0: number, p1: number, p2: number, p3: number, t: number): number {
  return 0.5 * (
    (-p0 + p2) +
    2 * (2 * p0 - 5 * p1 + 4 * p2 - p3) * t +
    3 * (-p0 + 3 * p1 - 3 * p2 + p3) * t * t
  );
}

/**
 * Build arc-length table for Catmull-Rom spline.
 * Returns cumulative arc lengths at each sample point.
 * Also returns the segment index and local t for each sample.
 */
function buildCatmullRomArcLengths(pts: ColorPoint[]): {
  totalLength: number;
  segmentLengths: number[];
  cumulativeLengths: number[];
} {
  const numSegments = pts.length - 1;
  const segmentLengths: number[] = [];
  const cumulativeLengths: number[] = [0];

  for (let seg = 0; seg < numSegments; seg++) {
    // Boundary: duplicate first/last points
    const p0 = pts[Math.max(seg - 1, 0)];
    const p1 = pts[seg];
    const p2 = pts[Math.min(seg + 1, pts.length - 1)];
    const p3 = pts[Math.min(seg + 2, pts.length - 1)];

    let prevX = p1.x;
    let prevY = p1.y;
    let segLen = 0;

    for (let k = 1; k <= NUM_SEGMENT_SAMPLES; k++) {
      const t = k / NUM_SEGMENT_SAMPLES;
      const cx = catmullRom(p0.x, p1.x, p2.x, p3.x, t);
      const cy = catmullRom(p0.y, p1.y, p2.y, p3.y, t);
      const stepDx = cx - prevX;
      const stepDy = cy - prevY;
      segLen += Math.sqrt(stepDx * stepDx + stepDy * stepDy);
      prevX = cx;
      prevY = cy;
    }

    segmentLengths.push(segLen);
    cumulativeLengths.push(cumulativeLengths[cumulativeLengths.length - 1] + segLen);
  }

  return {
    totalLength: cumulativeLengths[cumulativeLengths.length - 1],
    segmentLengths,
    cumulativeLengths,
  };
}

function sampleCatmullRom(pts: ColorPoint[], arcData: ReturnType<typeof buildCatmullRomArcLengths>, s: number): ColorPoint {
  const { totalLength, segmentLengths, cumulativeLengths } = arcData;

  if (totalLength === 0) {
    return { ...pts[0], dx: 0, dy: 0 };
  }

  const target = Math.min(Math.max(s, 0), totalLength);

  // Find segment
  const numSegments = pts.length - 1;
  let seg = numSegments - 1;
  for (let i = 0; i < numSegments; i++) {
    if (target <= cumulativeLengths[i + 1]) {
      seg = i;
      break;
    }
  }

  const segStart = cumulativeLengths[seg];
  const segLen = segmentLengths[seg];
  const localT = segLen === 0 ? 0 : (target - segStart) / segLen;

  const p0 = pts[Math.max(seg - 1, 0)];
  const p1 = pts[seg];
  const p2 = pts[Math.min(seg + 1, pts.length - 1)];
  const p3 = pts[Math.min(seg + 2, pts.length - 1)];

  const x = catmullRom(p0.x, p1.x, p2.x, p3.x, localT);
  const y = catmullRom(p0.y, p1.y, p2.y, p3.y, localT);
  const tanX = catmullRomTangent(p0.x, p1.x, p2.x, p3.x, localT);
  const tanY = catmullRomTangent(p0.y, p1.y, p2.y, p3.y, localT);

  // Colour: lerp linearly between p1 and p2 (the two nearest control points)
  const colorT = localT;
  const r = lerpChannel(p1.r, p2.r, colorT);
  const g = lerpChannel(p1.g, p2.g, colorT);
  const b = lerpChannel(p1.b, p2.b, colorT);
  const a = lerpChannel(p1.a, p2.a, colorT);

  return { x, y, r, g, b, a, dx: tanX, dy: tanY };
}

function distributeOnCatmullRom(pts: ColorPoint[], numPoints: number): ColorPoint[] {
  const arcData = buildCatmullRomArcLengths(pts);
  const { totalLength } = arcData;

  return Array.from({ length: numPoints }, (_, i) => {
    const s = numPoints === 1 ? 0 : (i / (numPoints - 1)) * totalLength;
    return sampleCatmullRom(pts, arcData, s);
  });
}

// --- Node implementation ---

const pointsOnALineV2NodeDef = implementComputeNode('pointsOnALineV2', {
  isTimeDependant: false,
  defaults: {
    colorPoints: [],
    numPoints: 10,
    curveMode: 'straight',
  },
  evaluate: (inputs) => {
    const colorPoints = inputs.colorPoints;
    const numPoints = Math.max(1, Math.round(inputs.numPoints));
    const curveMode = inputs.curveMode;

    if (colorPoints.length === 0) {
      return { points: [] };
    }

    if (colorPoints.length === 1) {
      const pt = colorPoints[0];
      return {
        points: Array.from({ length: numPoints }, () => ({ ...pt, dx: 0, dy: 0 })),
      };
    }

    if (curveMode === 'catmull-rom') {
      return { points: distributeOnCatmullRom(colorPoints, numPoints) };
    }

    // Default: straight
    return { points: distributeOnPolyline(colorPoints, numPoints) };
  },
});

export default pointsOnALineV2NodeDef;
