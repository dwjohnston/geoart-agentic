import { UnreachableError } from "../../../common-tooling/errors/UnreachableError";
import type { V_waveTypeEnumValue } from "../../../schema/_generated/value-kinds-2";

function frac(x: number): number {
  return x - Math.floor(x);
}

/**
 * Evaluates a wave oscillator at time t.
 * @param waveType - Shape of the wave
 * @param frequency - Cycles per 60 ticks (i.e. 1.0 = one cycle per second at 60fps)
 * @param amplitude - Output range multiplier (default 1 → output is -1..1)
 * @param phase - Phase offset in 0..1 units (0.5 = 180°)
 * @param t - Tick count since algorithm started
 */
export function evaluateWave(
  waveType: V_waveTypeEnumValue['v'],
  frequency: number,
  amplitude: number,
  phase: number,
  t: number,
): number {
  const pos = (frequency / 60) * t + phase;
  let raw: number;

  switch (waveType) {
    case 'sine':
      raw = Math.sin(2 * Math.PI * pos);
      break;
    case 'square':
      raw = Math.sin(2 * Math.PI * pos) >= 0 ? 1 : -1;
      break;
    case 'saw':
      raw = 2 * frac(pos) - 1;
      break;
    case 'reverse-saw':
      raw = 1 - 2 * frac(pos);
      break;
    case 'triangle':
      raw = 4 * Math.abs(frac(pos - 0.25) - 0.5) - 1;
      break;
    default:
      throw new UnreachableError(waveType)
  }

  return raw * amplitude;
}
