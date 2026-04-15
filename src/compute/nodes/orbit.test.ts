import { describe, it, expect } from 'vitest';
import { evaluateOrbit } from './orbit';

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
});
