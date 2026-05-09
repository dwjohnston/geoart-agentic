import { implementComputeNode } from '../implementComputeNode';
import { evaluateWave } from './wave';
import type { Sampler } from './pointsOnALine';

export const waveNodeDef = implementComputeNode("wave", {
  isTimeDependant: true,
  defaults: {
    "amplitude": 1,
    "frequency": 1,
    "phase": 0,
    "time": 0,
    "waveType": "sine",
    "samplerTemporalImpact": 1,
  },
  evaluate: (inputs) => {
    const t = inputs.time;
    const waveType = inputs.waveType;
    const frequency = inputs.frequency;
    const amplitude = inputs.amplitude;
    const phase = inputs.phase;
    const samplerTemporalImpact = inputs.samplerTemporalImpact;

    // Create sampler object for lazy evaluation at arbitrary positions
    const sampler: Sampler = {
      sample: (fauxT: number): number => {
        // spatialPosition is a normalised spatial position (0–1)
        // Incorporate time as a phase offset for animation
        const phaseShift = (t * samplerTemporalImpact * frequency * 2 * Math.PI) / 60; // time is tick count, convert to phase
        const arg = frequency * fauxT * 2 * Math.PI + phaseShift + phase * 2 * Math.PI;
        return amplitude * evaluateWaveAtAngle(waveType, arg);
      },
      sampleMany: (spatialPositions: number[]): number[] => {
        return spatialPositions.map(sp => sampler.sample(sp));
      },
    };

    return {
      value: evaluateWave(waveType, frequency, amplitude, phase, t),
      sampler: sampler
    };
  },
});

function evaluateWaveAtAngle(
  waveType: string,
  angleInRadians: number,
): number {
  function frac(x: number): number {
    return x - Math.floor(x);
  }

  const pos = angleInRadians / (2 * Math.PI);
  let raw: number;

  switch (waveType) {
    case 'sine':
      raw = Math.sin(angleInRadians);
      break;
    case 'square':
      raw = Math.sin(angleInRadians) >= 0 ? 1 : -1;
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
      raw = 0;
  }

  return raw;
}
