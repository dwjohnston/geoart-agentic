import { UnreachableError } from '../../../common-tooling/errors/UnreachableError';
import type { V_waveTypeEnumValue } from '../../../schema/_generated/value-kinds-2';
import { implementComputeNode } from '../implementComputeNode';
import type { NodeInputsResolved, Sampler } from '../../../schema/typeHelpers';

export function sampleWave(
  t: number,
  fractionOfOneCycle: number,
  samplerTemporalImpact: number,
  frequency: number,
  amplitude: number,
  phase: number,
  waveType: NodeInputsResolved<"wave">['waveType'],
  frequencyModulator: Sampler | null,
  amplitudeModulator: Sampler | null,


): number {


  const phaseShift = t * samplerTemporalImpact + phase;

  const sampledModFreq = frequencyModulator?.sample(fractionOfOneCycle) ?? 0;
  const sampledModAmp = amplitudeModulator?.sample(fractionOfOneCycle) ?? 0;

  const effectiveAmplitude = amplitude + sampledModAmp;

  const phaseModulation = sampledModFreq;

  const effectiveAngle = frequency * fractionOfOneCycle * 2 * Math.PI + phaseModulation + phaseShift;

  return effectiveAmplitude * evaluateWaveAtAngle(waveType, effectiveAngle);
}

function evaluateWave(
  waveType: V_waveTypeEnumValue['v'],
  frequency: number,
  amplitude: number,
  phase: number,
  t: number,
): number {
  function frac(x: number): number {
    return x - Math.floor(x);
  }
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
      throw new UnreachableError(waveType);
  }
  return raw * amplitude;
}

const waveNodeImplementation = implementComputeNode("wave", {
  isTimeDependant: true,
  defaults: {
    "amplitude": 1,
    "frequency": 1,
    "phase": 0,
    "time": 0,
    "waveType": "sine",
    "samplerTemporalImpact": 1,
    "frequencyModulator": null,
    "amplitudeModulator": null,
  },
  evaluate: (inputs) => {
    const t = inputs.time;
    const waveType = inputs.waveType;
    const frequency = inputs.frequency;
    const amplitude = inputs.amplitude;
    const phase = inputs.phase;
    const samplerTemporalImpact = inputs.samplerTemporalImpact;
    const frequencyModulator = inputs.frequencyModulator as Sampler | null;
    const amplitudeModulator = inputs.amplitudeModulator as Sampler | null;

    // Create sampler object for lazy evaluation at arbitrary positions
    const sampler: Sampler = {

      // To be abundantly clear what this value is
      // 0.5 = half way through 'one second' or 30 ticks.
      sample: (fractionOfOneCycle: number): number => {
        return sampleWave(t, fractionOfOneCycle, samplerTemporalImpact, frequency, amplitude, phase, waveType, frequencyModulator, amplitudeModulator)
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

export default waveNodeImplementation;

function evaluateWaveAtAngle(
  waveType: NodeInputsResolved<'wave'>['waveType'],
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
