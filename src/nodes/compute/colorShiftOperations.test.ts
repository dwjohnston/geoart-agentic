import { describe, expect, it } from 'bun:test';
import { applyColorShiftOperation, computeDriver } from './colorShiftOperations';

const red = { r: 1, g: 0, b: 0, a: 1 };
const blue = { r: 0, g: 0, b: 1, a: 1 };
const green = { r: 0, g: 1, b: 0, a: 1 };
const grey = { r: 0.5, g: 0.5, b: 0.5, a: 1 };

describe('applyColorShiftOperation — none', () => {
  it('passes color through unchanged', () => {
    const out = applyColorShiftOperation(red, blue, 1.0, 'none');
    expect(out).toEqual(red);
  });
});

describe('applyColorShiftOperation — blend', () => {
  it('driver=0: no change', () => {
    const out = applyColorShiftOperation(red, blue, 0, 'blend');
    expect(out.r).toBeCloseTo(1); expect(out.g).toBeCloseTo(0);
    expect(out.b).toBeCloseTo(0); expect(out.a).toBeCloseTo(1);
  });

  it('driver=1: fully becomes rr color', () => {
    const out = applyColorShiftOperation(red, blue, 1.0, 'blend');
    expect(out.r).toBeCloseTo(0); expect(out.g).toBeCloseTo(0);
    expect(out.b).toBeCloseTo(1); expect(out.a).toBeCloseTo(1);
  });

  it('driver=0.5: halfway', () => {
    const out = applyColorShiftOperation(red, blue, 0.5, 'blend');
    expect(out.r).toBeCloseTo(0.5); expect(out.g).toBeCloseTo(0);
    expect(out.b).toBeCloseTo(0.5); expect(out.a).toBeCloseTo(1);
  });

  it('driver=-1: fully becomes complement of rr color', () => {
    const out = applyColorShiftOperation(red, blue, -1.0, 'blend');
    // complement of blue = (1,1,0,0)
    expect(out.r).toBeCloseTo(1); expect(out.g).toBeCloseTo(1);
    expect(out.b).toBeCloseTo(0); expect(out.a).toBeCloseTo(0);
  });
});

describe('applyColorShiftOperation — hue-shift', () => {
  // red = hue 0°, green = hue 120°
  it('driver=0: no change', () => {
    const out = applyColorShiftOperation(red, green, 0, 'hue-shift');
    expect(out.r).toBeCloseTo(1); expect(out.g).toBeCloseTo(0); expect(out.b).toBeCloseTo(0);
  });

  it('driver=1: fully shifts to rr hue (green)', () => {
    const out = applyColorShiftOperation(red, green, 1.0, 'hue-shift');
    expect(out.r).toBeCloseTo(0); expect(out.g).toBeCloseTo(1); expect(out.b).toBeCloseTo(0);
  });

  it('driver=0.5: halfway — yellow (hue 60°)', () => {
    const out = applyColorShiftOperation(red, green, 0.5, 'hue-shift');
    expect(out.r).toBeCloseTo(1); expect(out.g).toBeCloseTo(1); expect(out.b).toBeCloseTo(0);
  });

  it('driver=-1: opposite arc — blue (hue 240°)', () => {
    const out = applyColorShiftOperation(red, green, -1.0, 'hue-shift');
    expect(out.r).toBeCloseTo(0); expect(out.g).toBeCloseTo(0); expect(out.b).toBeCloseTo(1);
  });

  it('rr alpha=0.5 halves shift — driver=1 gives yellow', () => {
    const halfAlphaGreen = { ...green, a: 0.5 };
    const out = applyColorShiftOperation(red, halfAlphaGreen, 1.0, 'hue-shift');
    // shift = 1.0 * 0.5 * 120° = 60° → yellow
    expect(out.r).toBeCloseTo(1); expect(out.g).toBeCloseTo(1); expect(out.b).toBeCloseTo(0);
  });

  it('alpha is unchanged from input', () => {
    const dimRed = { ...red, a: 0.4 };
    const out = applyColorShiftOperation(dimRed, green, 1.0, 'hue-shift');
    expect(out.a).toBeCloseTo(0.4);
  });
});

describe('applyColorShiftOperation — lighten', () => {
  it('driver=1: screen blend', () => {
    const out = applyColorShiftOperation(grey, grey, 1.0, 'lighten');
    // screen(0.5, 0.5) = 0.5 + 0.5 - 0.25 = 0.75
    expect(out.r).toBeCloseTo(0.75); expect(out.g).toBeCloseTo(0.75); expect(out.b).toBeCloseTo(0.75);
  });

  it('driver=-1: multiply blend', () => {
    const out = applyColorShiftOperation(grey, grey, -1.0, 'lighten');
    // multiply(0.5, 0.5) = 0.25
    expect(out.r).toBeCloseTo(0.25); expect(out.g).toBeCloseTo(0.25); expect(out.b).toBeCloseTo(0.25);
  });

  it('driver=1, screen with black = no change', () => {
    const black = { r: 0, g: 0, b: 0, a: 1 };
    const out = applyColorShiftOperation(grey, black, 1.0, 'lighten');
    expect(out.r).toBeCloseTo(0.5); expect(out.g).toBeCloseTo(0.5); expect(out.b).toBeCloseTo(0.5);
  });

  it('driver=-1, multiply with white = no change', () => {
    const white = { r: 1, g: 1, b: 1, a: 1 };
    const out = applyColorShiftOperation(grey, white, -1.0, 'lighten');
    expect(out.r).toBeCloseTo(0.5); expect(out.g).toBeCloseTo(0.5); expect(out.b).toBeCloseTo(0.5);
  });
});

describe('applyColorShiftOperation — saturate', () => {
  // pale red: rgb(0.75, 0.25, 0.25) = HSL(0°, 0.5, 0.5)
  const paleRed = { r: 0.75, g: 0.25, b: 0.25, a: 1 };
  const greyNoSat = { r: 0.5, g: 0.5, b: 0.5, a: 1 };

  it('driver=1: saturate toward grey (desaturate to grey)', () => {
    const out = applyColorShiftOperation(paleRed, greyNoSat, 1.0, 'saturate');
    expect(out.r).toBeCloseTo(0.5); expect(out.g).toBeCloseTo(0.5); expect(out.b).toBeCloseTo(0.5);
  });

  it('driver=-1: saturate away from grey (full saturation = pure red)', () => {
    const out = applyColorShiftOperation(paleRed, greyNoSat, -1.0, 'saturate');
    expect(out.r).toBeCloseTo(1); expect(out.g).toBeCloseTo(0); expect(out.b).toBeCloseTo(0);
  });

  it('driver=0: no change', () => {
    const out = applyColorShiftOperation(paleRed, greyNoSat, 0, 'saturate');
    expect(out.r).toBeCloseTo(0.75); expect(out.g).toBeCloseTo(0.25); expect(out.b).toBeCloseTo(0.25);
  });
});

describe('applyColorShiftOperation — null handling', () => {
  it('input with null channel: pass through entirely (blend)', () => {
    const nullG = { r: 1, g: null, b: 0, a: 1 };
    const out = applyColorShiftOperation(nullG, blue, 1.0, 'blend');
    expect(out).toEqual(nullG);
  });

  it('rr with null channel: that channel is no-op (blend)', () => {
    const rrNullG = { r: 0, g: null, b: 1, a: 1 };
    const out = applyColorShiftOperation(red, rrNullG, 1.0, 'blend');
    // r: lerp(1, 0, 1) = 0; g: rr null → stays 0; b: lerp(0, 1, 1) = 1; a: lerp(1, 1, 1) = 1
    expect(out.r).toBeCloseTo(0); expect(out.g).toBeCloseTo(0);
    expect(out.b).toBeCloseTo(1); expect(out.a).toBeCloseTo(1);
  });

  it('hue-shift: null rgb on input → pass through', () => {
    const nullR = { r: null, g: 0, b: 0, a: 1 };
    const out = applyColorShiftOperation(nullR, green, 1.0, 'hue-shift');
    expect(out).toEqual(nullR);
  });
});

describe('computeDriver', () => {
  it('point on mirror line: driver = 0', () => {
    // horizontal mirror at origin (axis 1,0), point at (1,0) — on mirror line
    expect(computeDriver(1, 0, 0, 0, 1, 0)).toBeCloseTo(0);
  });

  it('point above mirror: driver = +1', () => {
    // horizontal mirror at origin, point at (0,1) — perpendicular above
    expect(computeDriver(0, 1, 0, 0, 1, 0)).toBeCloseTo(1);
  });

  it('point below mirror: driver = -1', () => {
    expect(computeDriver(0, -1, 0, 0, 1, 0)).toBeCloseTo(-1);
  });

  it('point at r/r center: driver = 0', () => {
    expect(computeDriver(0, 0, 0, 0, 1, 0)).toBeCloseTo(0);
  });
});
