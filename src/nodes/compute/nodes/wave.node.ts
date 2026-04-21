import type { NodeDef } from '../types';
import type { NumberValue, StringValue } from '../../../graph/types';
import { evaluateWave } from './wave';
import type { WaveType } from './wave';

export const waveNodeDef: NodeDef = {
  type: 'wave',
  isTimeDependant: true,
  inputs: [
    { name: 'time',      type: 'number' },
    { name: 'frequency', type: 'number', default: { kind: 'number', v: 1.0 } },
    { name: 'amplitude', type: 'number', default: { kind: 'number', v: 1.0 } },
    { name: 'phase',     type: 'number', default: { kind: 'number', v: 0.0 } },
    { name: 'waveType',  type: 'string', default: { kind: 'string', v: 'sine' } },
  ],
  outputs: [
    { name: 'value', type: 'number' },
  ],
  evaluate(inputs) {
    const t         = (inputs[0] as NumberValue).v;
    const frequency = (inputs[1] as NumberValue).v;
    const amplitude = (inputs[2] as NumberValue).v;
    const phase     = (inputs[3] as NumberValue).v;
    const waveType  = (inputs[4] as StringValue).v as WaveType;
    return [{ kind: 'number', v: evaluateWave(waveType, frequency, amplitude, phase, t) }];
  },
};
