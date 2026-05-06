import type { LegacyControlNodeDef, ControlNodeDef } from '../../graphEngine/externalInterfaces/ControlNodeDefinition';
import { convertControlNodeDefToLegacy } from './implementControlNode';
import { sliderNodeDef } from './nodes/SliderNode';
import { colorPickerNodeDef } from './nodes/ColorPickerNode';
import { dropdownNodeDef } from './nodes/DropdownNode';
import { lfoControlNodeDef } from './nodes/LfoControlNode';
import type { ControlNodeKinds } from '../../schema/typeHelpers';


export const controlRegistry = new Map<string, LegacyControlNodeDef>(
  ([sliderNodeDef, colorPickerNodeDef, dropdownNodeDef, lfoControlNodeDef] as Array<ControlNodeDef<ControlNodeKinds>>)
    .map(v => [v.nodeKind, convertControlNodeDefToLegacy(v)] as [string, LegacyControlNodeDef])
);
