import { describe, it, expect } from 'vitest';
import curveModulatorNodeImplementation from './curveModulator';
import type { Sampler } from '../../../schema/typeHelpers';

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

    const { points } = curveModulatorNodeImplementation.evaluate({
      curve,
      modulator: sampler,
      "cycleLengthMode": "arrayLength",
      "modulationAngle": 0.25,
      "fixedOffset": 0,
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

    const { points } = curveModulatorNodeImplementation.evaluate({
      curve,
      modulator: sampler,
      "cycleLengthMode": "arrayLength",
      "modulationAngle": 0.25,
      "fixedOffset": 0,
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

    const { points } = curveModulatorNodeImplementation.evaluate({
      curve: [],
      modulator: sampler,
      "cycleLengthMode": "arrayLength",
      "modulationAngle": 0.25,
      "fixedOffset": 0,
    });

    expect(points).toEqual([]);
  });

  it('passes through curve when modulator is null', () => {
    const curve = [
      { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 1, dy: 0 },
      { x: 1, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 1, dy: 0 },
    ];

    const { points } = curveModulatorNodeImplementation.evaluate({
      curve,
      modulator: null,
      "cycleLengthMode": "arrayLength",
      "modulationAngle": 0.25,
      "fixedOffset": 0,
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

    const { points } = curveModulatorNodeImplementation.evaluate({
      curve,
      modulator: sampler,
      "cycleLengthMode": "arrayLength",
      "modulationAngle": 0.25,
      "fixedOffset": 0,
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

    const { points } = curveModulatorNodeImplementation.evaluate({
      curve,
      modulator: sampler,
      "cycleLengthMode": "arrayLength",
      "modulationAngle": 0.25,
      "fixedOffset": 0,
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

    curveModulatorNodeImplementation.evaluate({
      curve,
      modulator: sampler,
      "cycleLengthMode": "arrayLength",
      "modulationAngle": 0.25,
      "fixedOffset": 0,
    });

    // Last point should be at t=1
    expect(lastSampledT).toBeCloseTo(1, 2);
  });

  it('applies fixed offset in direction of tangent', () => {
    const curve = [
      { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 1, dy: 0 },
    ];

    const { points } = curveModulatorNodeImplementation.evaluate({
      curve,
      modulator: null,
      "cycleLengthMode": "arrayLength",
      "modulationAngle": 0,
      "fixedOffset": 0.1,
    });

    // Fixed offset of 0.1 in direction of (1, 0) should move point by (0.1, 0)
    expect(points[0].x).toBeCloseTo(0.1, 2);
    expect(points[0].y).toBeCloseTo(0, 2);
  });

  it('applies both modulator and fixed offset in modulation direction', () => {
    const curve = [
      { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 1, dy: 0 },
    ];

    const sampler: Sampler = {
      sample: () => 0.1,
      sampleMany: (ts: number[]) => ts.map(() => 0.1),
    };

    const { points } = curveModulatorNodeImplementation.evaluate({
      curve,
      modulator: sampler,
      "cycleLengthMode": "arrayLength",
      "modulationAngle": 0.25,
      "fixedOffset": 0.1,
    });

    // Modulation angle 0.25 (90°) rotates (1, 0) to (0, -1)
    // Modulation 0.1 in direction (0, -1): (0, -0.1)
    // Fixed offset 0.1 in direction (0, -1): (0, -0.1)
    // Total: (0, -0.2)
    expect(points[0].x).toBeCloseTo(0, 2);
    expect(points[0].y).toBeCloseTo(-0.2, 2);
  });
});

describe('cycle length modes', () => {
  const makeRecordingSampler = () => {
    const tValues: number[] = [];
    const sampler: Sampler = {
      sample: (t: number) => { tValues.push(t); return 0; },
      sampleMany: (ts: number[]) => ts.map(() => 0),
    };
    return { sampler, tValues };
  };

  const collinearCurve = (xs: number[]) =>
    xs.map(x => ({ x, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 1, dy: 0 }));

  it('linearOne: t values are raw cumulative distances', () => {
    const { sampler, tValues } = makeRecordingSampler();
    curveModulatorNodeImplementation.evaluate({
      curve: collinearCurve([0, 1, 2]),
      modulator: sampler,
      cycleLengthMode: 'linearOne',
      modulationAngle: 0,
      fixedOffset: 0,
    });
    expect(tValues[0]).toBeCloseTo(0, 3);
    expect(tValues[1]).toBeCloseTo(1, 3);
    expect(tValues[2]).toBeCloseTo(2, 3);
  });

  it('linearTotal: t values are normalised to [0, 1]', () => {
    const { sampler, tValues } = makeRecordingSampler();
    curveModulatorNodeImplementation.evaluate({
      curve: collinearCurve([0, 1, 2]),
      modulator: sampler,
      cycleLengthMode: 'linearTotal',
      modulationAngle: 0,
      fixedOffset: 0,
    });
    expect(tValues[0]).toBeCloseTo(0, 3);
    expect(tValues[1]).toBeCloseTo(0.5, 3);
    expect(tValues[2]).toBeCloseTo(1, 3);
  });

  it('linearOne: last t equals total curve length', () => {
    const { sampler, tValues } = makeRecordingSampler();
    curveModulatorNodeImplementation.evaluate({
      curve: collinearCurve([0, 1, 2, 3, 4]),
      modulator: sampler,
      cycleLengthMode: 'linearOne',
      modulationAngle: 0,
      fixedOffset: 0,
    });
    expect(tValues[tValues.length - 1]).toBeCloseTo(4, 3);
  });

  it('linearTotal: last t is always 1', () => {
    const { sampler, tValues } = makeRecordingSampler();
    curveModulatorNodeImplementation.evaluate({
      curve: collinearCurve([0, 1, 2, 3, 4]),
      modulator: sampler,
      cycleLengthMode: 'linearTotal',
      modulationAngle: 0,
      fixedOffset: 0,
    });
    expect(tValues[tValues.length - 1]).toBeCloseTo(1, 3);
  });

  it('linearOne: non-uniform spacing', () => {
    const { sampler, tValues } = makeRecordingSampler();
    curveModulatorNodeImplementation.evaluate({
      curve: collinearCurve([0, 2, 3]),
      modulator: sampler,
      cycleLengthMode: 'linearOne',
      modulationAngle: 0,
      fixedOffset: 0,
    });
    expect(tValues[0]).toBeCloseTo(0, 3);
    expect(tValues[1]).toBeCloseTo(2, 3);
    expect(tValues[2]).toBeCloseTo(3, 3);
  });

  it('linearTotal: non-uniform spacing', () => {
    const { sampler, tValues } = makeRecordingSampler();
    curveModulatorNodeImplementation.evaluate({
      curve: collinearCurve([0, 2, 3]),
      modulator: sampler,
      cycleLengthMode: 'linearTotal',
      modulationAngle: 0,
      fixedOffset: 0,
    });
    expect(tValues[0]).toBeCloseTo(0, 3);
    expect(tValues[1]).toBeCloseTo(2 / 3, 3);
    expect(tValues[2]).toBeCloseTo(1, 3);
  });

  it('linearOne: single point samples at t=0', () => {
    const { sampler, tValues } = makeRecordingSampler();
    curveModulatorNodeImplementation.evaluate({
      curve: [{ x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 1, dy: 0 }],
      modulator: sampler,
      cycleLengthMode: 'linearOne',
      modulationAngle: 0,
      fixedOffset: 0,
    });
    expect(tValues[0]).toBeCloseTo(0, 3);
  });

  it('linearTotal: single point samples at t=0', () => {
    const { sampler, tValues } = makeRecordingSampler();
    curveModulatorNodeImplementation.evaluate({
      curve: [{ x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 1, dy: 0 }],
      modulator: sampler,
      cycleLengthMode: 'linearTotal',
      modulationAngle: 0,
      fixedOffset: 0,
    });
    expect(tValues[0]).toBeCloseTo(0, 3);
  });
});
