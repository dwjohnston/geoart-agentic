import type React from 'react';
import type { Value } from '../../graph/types';
import type { ControlNode } from '../../schema/_generated/schema-types';

export type PortDef = {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'color' | 'point';
};

export type ResolvedParams = Record<string, { v: unknown }>;

export type ControlSetter = (paramKey: string, value: Value) => void;

export type ControlNodeDef<T extends ControlNode['type'] = ControlNode['type']> = {
  type: T;
  outputs: PortDef[];
  evaluate(params: ResolvedParams): Value[];
  renderControl(node: Extract<ControlNode, { type: T }>, set: ControlSetter): React.ReactNode;
};
