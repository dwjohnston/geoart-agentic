export type WaveType = 'sine' | 'square' | 'saw' | 'inverse-saw' | 'triangle';

function frac(x: number): number {
  return x - Math.floor(x);
}

/**
 * Evaluates a wave oscillator at time t.
 * @param waveType - Shape of the wave
 * @param frequency - Cycles per second (Hz)
 * @param amplitude - Output range multiplier (default 1 → output is -1..1)
 * @param phase - Phase offset in 0..1 units (0.5 = 180°)
 * @param t - Elapsed time in seconds
 */
export function evaluateWave(
  waveType: WaveType,
  frequency: number,
  amplitude: number,
  phase: number,
  t: number,
): number {
  const pos = frequency * t + phase;
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
    case 'inverse-saw':
      raw = 1 - 2 * frac(pos);
      break;
    case 'triangle':
      raw = 4 * Math.abs(frac(pos - 0.25) - 0.5) - 1;
      break;
    default:
      raw = Math.sin(2 * Math.PI * pos);
  }

  return raw * amplitude;
}
