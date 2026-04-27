import type { ControlNodeDef } from './types';
import { sliderNodeDef } from './nodes/SliderNode';
import { colorPickerNodeDef } from './nodes/ColorPickerNode';
import { dropdownNodeDef } from './nodes/DropdownNode';

export const controlRegistry = new Map<string, ControlNodeDef>([
  [sliderNodeDef.type, sliderNodeDef],
  [colorPickerNodeDef.type, colorPickerNodeDef],
  [dropdownNodeDef.type, dropdownNodeDef],
]);
