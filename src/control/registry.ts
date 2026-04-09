import type { ControlNodeDef } from './types';
import { sliderNodeDef } from './SliderNode';

export const controlRegistry = new Map<string, ControlNodeDef>([
  [sliderNodeDef.type, sliderNodeDef],
]);
