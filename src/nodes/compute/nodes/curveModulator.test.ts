import { describe, it, expect } from 'vitest';
import curveModulatorNodeDef from './curveModulator.node';
import type { Sampler } from './pointsOnALine';

describe('CurveModulator', () => {
  it('displaces points perpendicular to tangent', () => {
    const curve = [
      { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 1, dy: 0 },
      { x: 1, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 1, dy: 0 },
    ];

    const sampler: Sampler = {
      sample: () => 0.1,
      sampleMany: (ts: number[]) => ts.map(() => 0.1),
    };

    const { points } = curveModulatorNodeDef.evaluate({
      curve,
      modulator: sampler,
      "cycleLengthMode": "arrayLength",

    });

    // Perpendicular to (1, 0) rotated 90° clockwise is (0, -1)
    expect(points[0].y).toBeCloseTo(-0.1, 2);
    expect(points[0].x).toBeCloseTo(0, 2); // x should not change
  });

  it('does not displace points with zero tangent', () => {
    const curve = [
      { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 },
      { x: 1, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 0, dy: 0 },
    ];

    const sampler: Sampler = {
      sample: () => 0.5,
      sampleMany: (ts: number[]) => ts.map(() => 0.5),
    };

    const { points } = curveModulatorNodeDef.evaluate({
      curve,
      modulator: sampler,
      "cycleLengthMode": "arrayLength",

    });

    // No tangent means no displacement
    expect(points[0].x).toBeCloseTo(0, 2);
    expect(points[0].y).toBeCloseTo(0, 2);
    expect(points[1].x).toBeCloseTo(1, 2);
    expect(points[1].y).toBeCloseTo(0, 2);
  });

  it('handles empty curves gracefully', () => {
    const sampler: Sampler = {
      sample: () => 0.1,
      sampleMany: (ts: number[]) => ts.map(() => 0.1),
    };

    const { points } = curveModulatorNodeDef.evaluate({
      curve: [],
      modulator: sampler,
      "cycleLengthMode": "arrayLength",
    });

    expect(points).toEqual([]);
  });

  it('passes through curve when modulator is null', () => {
    const curve = [
      { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 1, dy: 0 },
      { x: 1, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 1, dy: 0 },
    ];

    const { points } = curveModulatorNodeDef.evaluate({
      curve,
      modulator: null,
      "cycleLengthMode": "arrayLength",

    });

    // Should pass through unchanged
    expect(points).toEqual(curve);
  });

  it('preserves colour information', () => {
    const curve = [
      { x: 0, y: 0, r: 1, g: 0.5, b: 0.2, a: 0.8, dx: 1, dy: 0 },
    ];

    const sampler: Sampler = {
      sample: () => 0.1,
      sampleMany: (ts: number[]) => ts.map(() => 0.1),
    };

    const { points } = curveModulatorNodeDef.evaluate({
      curve,
      modulator: sampler,
      "cycleLengthMode": "arrayLength",

    });

    expect(points[0].r).toBe(1);
    expect(points[0].g).toBe(0.5);
    expect(points[0].b).toBe(0.2);
    expect(points[0].a).toBe(0.8);
  });

  it('preserves tangent information', () => {
    const curve = [
      { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0.707, dy: 0.707 },
    ];

    const sampler: Sampler = {
      sample: () => 0.1,
      sampleMany: (ts: number[]) => ts.map(() => 0.1),
    };

    const { points } = curveModulatorNodeDef.evaluate({
      curve,
      modulator: sampler,
      "cycleLengthMode": "arrayLength",

    });

    expect(points[0].dx).toBe(0.707);
    expect(points[0].dy).toBe(0.707);
  });

  it('samples at correct normalized position along curve', () => {
    let lastSampledT: number = -1;
    const curve = [
      { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 1, dy: 0 },
      { x: 1, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 1, dy: 0 },
    ];

    const sampler: Sampler = {
      sample: (t: number) => {
        lastSampledT = t;
        return 0.1;
      },
      sampleMany: (ts: number[]) => ts.map(() => 0.1),
    };

    curveModulatorNodeDef.evaluate({
      curve,
      modulator: sampler,
      "cycleLengthMode": "arrayLength",

    });

    // Last point should be at t=1
    expect(lastSampledT).toBeCloseTo(1, 2);
  });
});
