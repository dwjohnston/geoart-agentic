import type { Value } from '../../schema/types';
import type { ComputeNodeKinds, NodeInputsResolved, NodeOutputsResolved } from '../../schema/typeHelpers';

//@legacy - this does not belong here we should get this (or a type like this) into `src/graph`
// We are trying to get rid of this
export type LegacyComputeNodePortDef = {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'color' | 'point' | 'colorPoint' | 'colorPointArray';
  default?: Value | { v: string };
  options?: string[];
};

//@legacy - this does not belong here we should get this (or a type like this) into `src/graph`
export type ComputeNodeEvalContext = {
  tickCount: number;
  getState<T>(): T;
  setState<T>(s: T): void;
};


//@legacy - this does not belong here we should get this (or a type like this) into `src/graph`
export type LegacyComputeNodeDef = {
  type: string;
  isTimeDependant?: boolean;
  inputs: LegacyComputeNodePortDef[];
  outputs: LegacyComputeNodePortDef[];
  evaluate(inputs: Value[], ctx: ComputeNodeEvalContext): Value[];
};

export type ComputeNodeDef<T extends ComputeNodeKinds> = {
  nodeKind: T;

  //I'm not sure about this one though
  isTimeDependant?: boolean;
  defaultValues: NodeInputsResolved<T>;
  evaluate: (inputs: NodeInputsResolved<T>) => NodeOutputsResolved<T>
}
