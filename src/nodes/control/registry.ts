import type { ControlNodeDef } from './types';
import { sliderNodeDef } from './SliderNode';
import { colorPickerNodeDef } from './ColorPickerNode';
import { dropdownNodeDef } from './DropdownNode';

export const controlRegistry = new Map<string, ControlNodeDef>([
  [sliderNodeDef.type, sliderNodeDef],
  [colorPickerNodeDef.type, colorPickerNodeDef],
  [dropdownNodeDef.type, dropdownNodeDef],
]);
