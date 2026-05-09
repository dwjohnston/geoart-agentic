import { describe, it, expect } from 'vitest';
import { curveModulatorNodeDef } from './curveModulator.node';
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

    const { modulated } = curveModulatorNodeDef.evaluate({
      curve,
      modulator: sampler,
    });

    // Perpendicular to (1, 0) rotated 90° clockwise is (0, -1)
    expect(modulated[0].y).toBeCloseTo(-0.1, 2);
    expect(modulated[0].x).toBeCloseTo(0, 2); // x should not change
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

    const { modulated } = curveModulatorNodeDef.evaluate({
      curve,
      modulator: sampler,
    });

    // No tangent means no displacement
    expect(modulated[0].x).toBeCloseTo(0, 2);
    expect(modulated[0].y).toBeCloseTo(0, 2);
    expect(modulated[1].x).toBeCloseTo(1, 2);
    expect(modulated[1].y).toBeCloseTo(0, 2);
  });

  it('handles empty curves gracefully', () => {
    const sampler: Sampler = {
      sample: () => 0.1,
      sampleMany: (ts: number[]) => ts.map(() => 0.1),
    };

    const { modulated } = curveModulatorNodeDef.evaluate({
      curve: [],
      modulator: sampler,
    });

    expect(modulated).toEqual([]);
  });

  it('passes through curve when modulator is null', () => {
    const curve = [
      { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 1, dy: 0 },
      { x: 1, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 1, dy: 0 },
    ];

    const { modulated } = curveModulatorNodeDef.evaluate({
      curve,
      modulator: null,
    });

    // Should pass through unchanged
    expect(modulated).toEqual(curve);
  });

  it('preserves colour information', () => {
    const curve = [
      { x: 0, y: 0, r: 1, g: 0.5, b: 0.2, a: 0.8, dx: 1, dy: 0 },
    ];

    const sampler: Sampler = {
      sample: () => 0.1,
      sampleMany: (ts: number[]) => ts.map(() => 0.1),
    };

    const { modulated } = curveModulatorNodeDef.evaluate({
      curve,
      modulator: sampler,
    });

    expect(modulated[0].r).toBe(1);
    expect(modulated[0].g).toBe(0.5);
    expect(modulated[0].b).toBe(0.2);
    expect(modulated[0].a).toBe(0.8);
  });

  it('preserves tangent information', () => {
    const curve = [
      { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0.707, dy: 0.707 },
    ];

    const sampler: Sampler = {
      sample: () => 0.1,
      sampleMany: (ts: number[]) => ts.map(() => 0.1),
    };

    const { modulated } = curveModulatorNodeDef.evaluate({
      curve,
      modulator: sampler,
    });

    expect(modulated[0].dx).toBe(0.707);
    expect(modulated[0].dy).toBe(0.707);
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
    });

    // Last point should be at t=1
    expect(lastSampledT).toBeCloseTo(1, 2);
  });
});
