import type { ControlNodeDef } from './types';
import { sliderNodeDef } from './nodes/SliderNode';
import { colorPickerNodeDef } from './nodes/ColorPickerNode';
import { dropdownNodeDef } from './nodes/DropdownNode';



// TODO: This needs to have a better signature so that the control type always gives you the right control defintion
export const controlRegistry = new Map<string, ControlNodeDef>([
  [sliderNodeDef.type, sliderNodeDef as ControlNodeDef],
  [colorPickerNodeDef.type, colorPickerNodeDef as ControlNodeDef],
  [dropdownNodeDef.type, dropdownNodeDef as ControlNodeDef],
]);
