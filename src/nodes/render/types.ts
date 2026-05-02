import type { Value } from '../../graph/types';
import type { NodeInputsResolved } from '../../schema/typeHelpers';
import type { DefineableRenderNodeKind } from './defineRenderNode';

export type PortDef = {
  name: string;
  type: 'number' | 'color' | 'point' | 'colorPoint' | 'colorPointArray' | 'trigger';
  default?: Value;
};

export type RenderEvalContext = {
  /** Pre-selected canvas for this node — chosen by the evaluator from renderConfig.layer. */
  canvas: CanvasRenderingContext2D;
  width: number;
  height: number;
};


//@legacy
export type RenderNodeDef = {
  type: string;
  inputs: PortDef[];
  outputs: PortDef[];
  evaluate(inputs: Value[], ctx: RenderEvalContext): void;
};


export type RenderNodeDef2<T extends DefineableRenderNodeKind> = {
  type: T;


  inputs: unknown;
  outputs: unknown;// do we need these? 
  evalute: (inputs: NodeInputsResolved<T>, ctx: RenderEvalContext) => void;
}