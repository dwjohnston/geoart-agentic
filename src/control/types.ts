import type { Value } from '../graph/types';

export type PortDef = {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'color' | 'point';
};

/** Resolved params passed to evaluate — each entry carries the param's value envelope. */
export type ResolvedParams = Record<string, { v: unknown }>;

export type ControlNodeDef = {
  type: string;
  outputs: PortDef[];
  params: Record<string, { type: string }>;
  evaluate(params: ResolvedParams): Value[];
};
