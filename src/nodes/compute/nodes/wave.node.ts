import { defineComputeNode } from '../types';
import { evaluateWave } from './wave';

export const waveNodeDef = defineComputeNode("wave", {
  isTimeDependant: true,
  defaults: {
    "amplitude": {
      "v": 1
    },
    "frequency": {
      "v": 1
    },
    "phase": {
      "v": 0
    },
    "time": {
      "v": 0
    },
    "waveType": {
      "v": "sine"
    },
  },
  evaluate: (inputs) => {
    const t = inputs.time.v;
    const waveType = inputs.waveType.v;
    const frequency = inputs.frequency.v;
    const amplitude = inputs.amplitude.v;
    const phase = inputs.phase.v;
    return { value: evaluateWave(waveType, frequency, amplitude, phase, t) };
  },
});
