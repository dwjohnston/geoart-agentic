type RGBA = { r: number | null; g: number | null; b: number | null; a: number | null };
type ColorShiftOp = 'none' | 'blend' | 'hue-shift' | 'lighten' | 'saturate';

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
}

function applyBlend(input: RGBA, rr: RGBA, driver: number): RGBA {
  if (input.r === null || input.g === null || input.b === null || input.a === null) return input;
  const ch = (ic: number, rrc: number | null): number => {
    if (rrc === null) return ic;
    return driver >= 0 ? lerp(ic, rrc, driver) : lerp(ic, 1 - rrc, -driver);
  };
  return { r: ch(input.r, rr.r), g: ch(input.g, rr.g), b: ch(input.b, rr.b), a: ch(input.a, rr.a) };
}

function applyHueShift(input: RGBA, rr: RGBA, driver: number): RGBA {
  if (input.r === null || input.g === null || input.b === null) return input;
  const [inputH, inputS, inputL] = rgbToHsl(input.r, input.g, input.b);
  let rrH = inputH;
  if (rr.r !== null && rr.g !== null && rr.b !== null) [rrH] = rgbToHsl(rr.r, rr.g, rr.b);
  const rrA = rr.a ?? 1;
  let delta = rrH - inputH;
  if (delta > 0.5) delta -= 1;
  if (delta < -0.5) delta += 1;
  const newH = ((inputH + driver * rrA * delta) % 1 + 1) % 1;
  const [r, g, b] = hslToRgb(newH, inputS, inputL);
  return { r, g, b, a: input.a };
}

function applyLighten(input: RGBA, rr: RGBA, driver: number): RGBA {
  if (input.r === null || input.g === null || input.b === null || input.a === null) return input;
  const ch = (ic: number, rrc: number | null): number => {
    if (rrc === null) return ic;
    if (driver >= 0) return lerp(ic, ic + rrc - ic * rrc, driver);
    return lerp(ic, ic * rrc, -driver);
  };
  return { r: ch(input.r, rr.r), g: ch(input.g, rr.g), b: ch(input.b, rr.b), a: ch(input.a, rr.a) };
}

function applySaturate(input: RGBA, rr: RGBA, driver: number): RGBA {
  if (input.r === null || input.g === null || input.b === null || input.a === null) return input;
  const [h, s, l] = rgbToHsl(input.r, input.g, input.b);
  let rrS = s;
  if (rr.r !== null && rr.g !== null && rr.b !== null) [, rrS] = rgbToHsl(rr.r, rr.g, rr.b);
  const newS = Math.max(0, Math.min(1, s + driver * (rrS - s)));
  const [r, g, b] = hslToRgb(h, newS, l);
  const newA = rr.a !== null
    ? (driver >= 0 ? lerp(input.a, rr.a, driver) : lerp(input.a, 1 - rr.a, -driver))
    : input.a;
  return { r, g, b, a: newA };
}

export function applyColorShiftOperation(input: RGBA, rr: RGBA, driver: number, op: ColorShiftOp): RGBA {
  switch (op) {
    case 'none': return input;
    case 'blend': return applyBlend(input, rr, driver);
    case 'hue-shift': return applyHueShift(input, rr, driver);
    case 'lighten': return applyLighten(input, rr, driver);
    case 'saturate': return applySaturate(input, rr, driver);
  }
}

/**
 * Signed driver in -1..+1 based on the perpendicular component of the
 * r/r→input vector relative to the mirror axis (reflect) or reference
 * axis (rotate). Points on the axis give driver=0; points off it give ±1.
 */
export function computeDriver(
  px: number, py: number,
  rrX: number, rrY: number,
  axisX: number, axisY: number,
): number {
  const vx = px - rrX;
  const vy = py - rrY;
  const dist = Math.sqrt(vx * vx + vy * vy);
  if (dist < 1e-10) return 0;
  const len = Math.sqrt(axisX * axisX + axisY * axisY);
  if (len < 1e-10) return 0;
  const dnx = axisX / len;
  const dny = axisY / len;
  // Perpendicular component: sin of angle between r/r→p and axis
  return (vy * dnx - vx * dny) / dist;
}
