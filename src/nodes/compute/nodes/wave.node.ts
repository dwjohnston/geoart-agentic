import { defineComputeNode } from '../defineComputeNode';
import { evaluateWave } from './wave';

export const waveNodeDef = defineComputeNode("wave", {
  isTimeDependant: true,
  defaults: {
    "amplitude": 1,
    "frequency": 1,
    "phase": 0,
    "time": 0,
    "waveType": "sine",
  },
  evaluate: (inputs) => {
    const t = inputs.time;
    const waveType = inputs.waveType;
    const frequency = inputs.frequency;
    const amplitude = inputs.amplitude;
    const phase = inputs.phase;
    return { value: evaluateWave(waveType, frequency, amplitude, phase, t) };
  },
});
