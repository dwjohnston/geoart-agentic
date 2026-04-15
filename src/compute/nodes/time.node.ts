import type { NodeDef } from '../types';
import { evaluateTime } from './time';

export const timeNodeDef: NodeDef = {
  type: 'time',
  isTimeDependant: true,
  inputs: [],
  outputs: [
    // Exception to the -1..1 rule: elapsed seconds are unbounded raw time.
    { name: 'time', type: 'number' },
  ],
  evaluate(_inputs, ctx) {
    // ctx.time is in ms; convert to seconds for consumers.
    const seconds = ctx.time / 1000;
    return [{ kind: 'number', v: evaluateTime(seconds) }];
  },
};
