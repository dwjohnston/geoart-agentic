import type { Value } from '../../graph/types';

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
export type LegacyRenderNodeDef = {
  type: string;
  inputs: PortDef[];
  outputs: PortDef[];
  evaluate(inputs: Value[], ctx: RenderEvalContext): void;
};
