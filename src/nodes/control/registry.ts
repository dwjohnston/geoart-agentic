import type { LegacyControlNodeDef, ControlNodeDef, DefineableControlNodeKind } from './defineControlNode';
import { convertControlNodeDefToLegacy } from './defineControlNode';
import { sliderNodeDef } from './nodes/SliderNode';
import { colorPickerNodeDef } from './nodes/ColorPickerNode';
import { dropdownNodeDef } from './nodes/DropdownNode';
import { lfoControlNodeDef } from './nodes/LfoControlNode';

type ControlNodeKinds = DefineableControlNodeKind;

export const controlRegistry = new Map<string, LegacyControlNodeDef>(
  ([sliderNodeDef, colorPickerNodeDef, dropdownNodeDef, lfoControlNodeDef] as Array<ControlNodeDef<ControlNodeKinds>>)
    .map(v => [v.nodeKind, convertControlNodeDefToLegacy(v)] as [string, LegacyControlNodeDef])
);
