export type NumberValue     = { kind: 'number';     v: number };
export type PointValue      = { kind: 'point';      v: { x: number; y: number } };
export type ColorValue      = { kind: 'color';      v: { r: number; g: number; b: number; a: number } };
export type ColorPointValue = { kind: 'colorPoint'; v: { x: number; y: number; r: number; g: number; b: number; a: number } };

export type Value = NumberValue | PointValue | ColorValue | ColorPointValue;
