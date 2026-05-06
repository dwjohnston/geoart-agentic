import type { Value } from '../../schema/types';
import type { RenderNodeKinds, NodeInputsResolved } from '../../schema/typeHelpers';

//@legacy - we are trying to get rid of this
export type LegacyRenderNodePortDef = {
  name: string;
  type: 'number' | 'color' | 'point' | 'colorPoint' | 'colorPointArray' | 'numberArray' | 'trigger';
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
  inputs: LegacyRenderNodePortDef[];
  outputs: LegacyRenderNodePortDef[];
  evaluate(inputs: Value[], ctx: RenderEvalContext): void;
};

export type RenderNodeDef<K extends RenderNodeKinds> = {
  nodeKind: K;
  defaultValues: NodeInputsResolved<K>;
  evaluate: (inputs: NodeInputsResolved<K>, ctx: RenderEvalContext) => void;
};
