import { defineComputeNode } from '../types';
import { evaluateWave } from './wave';

export const waveNodeDef = defineComputeNode("wave", {
  isTimeDependant: true,
  evaluate: (inputs) => {
    const t = inputs.time.v;
    const waveType = inputs.waveType.v;
    const frequency = inputs.frequency.v;
    const amplitude = inputs.amplitude.v;
    const phase = inputs.phase.v;
    return { value: evaluateWave(waveType, frequency, amplitude, phase, t) };
  },
});
