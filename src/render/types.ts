import type { Value } from '../graph/types';

export type PortDef = {
  name: string;
  type: 'number' | 'color' | 'point' | 'trigger';
  default?: Value;
};

export type RenderEvalContext = {
  canvas: {
    orbit: CanvasRenderingContext2D;
    trail: CanvasRenderingContext2D;
    width: number;
    height: number;
  };
};

export type RenderNodeDef = {
  type: string;
  canvas: 'orbit' | 'trail';
  inputs: PortDef[];
  outputs: PortDef[];
  evaluate(inputs: Value[], ctx: RenderEvalContext): void;
};
