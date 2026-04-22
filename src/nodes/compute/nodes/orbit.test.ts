import { describe, it, expect } from 'vitest';
import { evaluateOrbit, evaluateOrbitPoints } from './orbit';

describe('evaluateOrbit', () => {
  it('at t=0, x equals radius and y equals 0', () => {
    const result = evaluateOrbit(0.5, 1, 0);
    expect(result.x).toBeCloseTo(0.5);
    expect(result.y).toBeCloseTo(0);
  });

  it('at t=0.25 (quarter turn), x is ~0 and y equals radius', () => {
    // speed=1, t=0.25 → angle = 0.25 * 2π = π/2
    const result = evaluateOrbit(0.5, 1, 0.25);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0.5);
  });

  it('at t=0.5 (half turn), x equals -radius and y is ~0', () => {
    const result = evaluateOrbit(0.5, 1, 0.5);
    expect(result.x).toBeCloseTo(-0.5);
    expect(result.y).toBeCloseTo(0);
  });

  it('at t=1 (full turn), returns to starting position', () => {
    const result = evaluateOrbit(0.5, 1, 1);
    expect(result.x).toBeCloseTo(0.5);
    expect(result.y).toBeCloseTo(0);
  });

  it('speed doubles the angular velocity', () => {
    // speed=2, t=0.25 → angle = 2 * 0.25 * 2π = π → half turn
    const result = evaluateOrbit(0.5, 2, 0.25);
    expect(result.x).toBeCloseTo(-0.5);
    expect(result.y).toBeCloseTo(0);
  });

  it('radius=0 always returns the origin', () => {
    const result = evaluateOrbit(0, 1, 0.3);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
  });

  it('radius=1 produces points on the unit circle', () => {
    const result = evaluateOrbit(1, 1, 0);
    const dist = Math.sqrt(result.x ** 2 + result.y ** 2);
    expect(dist).toBeCloseTo(1);
  });

  it('center offset shifts the output position', () => {
    const result = evaluateOrbit(0.5, 1, 0, 0.3, 0.2);
    expect(result.x).toBeCloseTo(0.8);  // 0.3 + 0.5
    expect(result.y).toBeCloseTo(0.2);  // 0.2 + 0
  });

  it('center defaults to origin when omitted', () => {
    const withCenter = evaluateOrbit(0.5, 1, 0.25, 0, 0);
    const withoutCenter = evaluateOrbit(0.5, 1, 0.25);
    expect(withCenter.x).toBeCloseTo(withoutCenter.x);
    expect(withCenter.y).toBeCloseTo(withoutCenter.y);
  });

  it('phase parameter shifts the starting angle', () => {
    // phase=0.25 → 90 degree offset
    const noPhase = evaluateOrbit(0.5, 1, 0, 0, 0, 0);
    const withPhase = evaluateOrbit(0.5, 1, 0, 0, 0, 0.25);
    expect(noPhase.x).toBeCloseTo(0.5);   // starts at right
    expect(withPhase.x).toBeCloseTo(0);   // starts at top
    expect(withPhase.y).toBeCloseTo(0.5);
  });
});

describe('evaluateOrbitPoints', () => {
  it('numPoints=1 returns a single point', () => {
    const result = evaluateOrbitPoints(0.5, 1, 0, 1, 0);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(0.5);
    expect(result[0].y).toBeCloseTo(0);
  });

  it('numPoints=2 returns two points 180 degrees apart', () => {
    const result = evaluateOrbitPoints(0.5, 1, 0, 2, 0);
    expect(result).toHaveLength(2);
    expect(result[0].x).toBeCloseTo(0.5);   // right
    expect(result[0].y).toBeCloseTo(0);
    expect(result[1].x).toBeCloseTo(-0.5);  // left
    expect(result[1].y).toBeCloseTo(0);
  });

  it('numPoints=4 returns four evenly-spaced points', () => {
    const result = evaluateOrbitPoints(0.5, 1, 0, 4, 0);
    expect(result).toHaveLength(4);
    // 0° — right
    expect(result[0].x).toBeCloseTo(0.5);
    expect(result[0].y).toBeCloseTo(0);
    // 90° — top
    expect(result[1].x).toBeCloseTo(0, 5);
    expect(result[1].y).toBeCloseTo(0.5);
    // 180° — left
    expect(result[2].x).toBeCloseTo(-0.5);
    expect(result[2].y).toBeCloseTo(0, 5);
    // 270° — bottom
    expect(result[3].x).toBeCloseTo(0, 5);
    expect(result[3].y).toBeCloseTo(-0.5);
  });

  it('phase shifts all points by the same angle', () => {
    const noPhase = evaluateOrbitPoints(0.5, 1, 0, 2, 0);
    const withPhase = evaluateOrbitPoints(0.5, 1, 0, 2, 0.25);
    expect(noPhase[0].x).toBeCloseTo(0.5);
    expect(withPhase[0].x).toBeCloseTo(0);
    expect(withPhase[0].y).toBeCloseTo(0.5);
  });

  it('respects time parameter', () => {
    const t0 = evaluateOrbitPoints(0.5, 1, 0, 1, 0);
    const t025 = evaluateOrbitPoints(0.5, 1, 0.25, 1, 0);
    expect(t0[0].x).toBeCloseTo(0.5);
    expect(t025[0].x).toBeCloseTo(0, 5);
    expect(t025[0].y).toBeCloseTo(0.5);
  });

  it('centre offset applies to all points', () => {
    const result = evaluateOrbitPoints(0.5, 1, 0, 2, 0, 0.3, 0.2);
    expect(result[0].x).toBeCloseTo(0.8);  // 0.3 + 0.5
    expect(result[0].y).toBeCloseTo(0.2);  // 0.2 + 0
    expect(result[1].x).toBeCloseTo(-0.2); // 0.3 - 0.5
    expect(result[1].y).toBeCloseTo(0.2);  // 0.2 + 0
  });
});
