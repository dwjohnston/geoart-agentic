import type { Value } from '../../graph/types';

export type PortDef = {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'color' | 'point' | 'colorPoint' | 'colorPointArray' | 'enum';
  default?: Value | { v: string };
  options?: string[];
};

export type EvalContext = {
  tickCount: number;
  getState<T>(): T;
  setState<T>(s: T): void;
};

export type NodeDef = {
  type: string;
  isTimeDependant?: boolean;
  inputs: PortDef[];
  outputs: PortDef[];
  evaluate(inputs: Value[], ctx: EvalContext): Value[];
};
