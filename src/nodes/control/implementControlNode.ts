import type React from 'react';
import type { Value } from '../../schema/types';
import type { ControlNode } from '../../schema/_generated/schema-types';
import type { ControlNodeKinds, NodeInputsResolved } from '../../schema/typeHelpers';
import { nodeOutputMeta } from '../../schema/_generated/node-outputs-2';
import type { LegacyControlNodePortImplementation, ResolvedParams, ControlSetter, LegacyControlNodeImplementation, NodeWithDefaults, ControlNodeImplementation } from '../../graphEngine/externalInterfaces/ControlNodeImplementation';

export function implementControlNode<K extends ControlNodeKinds>(
  kind: K,
  def: {
    defaults: NodeInputsResolved<K>;
    renderControl: (node: NodeWithDefaults<K>, set: ControlSetter<K>) => React.ReactNode;
  }
): ControlNodeImplementation<K> {
  return {
    nodeKind: kind,
    defaultValues: def.defaults,
    renderControl: def.renderControl,
  };
}

export function convertControlNodeImplementationToLegacy<K extends ControlNodeKinds>(
  def: ControlNodeImplementation<K>
): LegacyControlNodeImplementation {
  const outputItems = nodeOutputMeta[def.nodeKind];
  const defaults = def.defaultValues as unknown as Record<string, { v: unknown }>;

  return {
    type: def.nodeKind,
    outputs: outputItems.map(({ name, valueType }) => ({
      name,
      type: valueTypeToPortType(valueType),
    })),
    evaluate(params: ResolvedParams) {
      return outputItems.map(({ name, valueType }) => {
        const v = params[name]?.v ?? defaults[name];
        const resultKind = valueType.replace(/Value$/, '');
        return { kind: resultKind, v } as Value;
      });
    },
    renderControl(rawNode: Extract<ControlNode, { type: K }>, set: ControlSetter<K>) {
      const mungedDefaults = Object.entries(defaults).reduce((acc, cur) => {
        return { ...acc, [cur[0]]: cur[1] };
      });
      const node = {
        ...rawNode,
        params: { ...mungedDefaults, ...rawNode.params },
      } as unknown as NodeWithDefaults<K>;
      return def.renderControl(node, set);
    },
  };
}


// @legacy - we are trying to get rid of this 
function valueTypeToPortType(valueType: string): LegacyControlNodePortImplementation['type'] {
  const map: Record<string, LegacyControlNodePortImplementation['type']> = {
    numberValue: 'number',
    stringValue: 'string',
    stringArrayValue: 'string',
    colorValue: 'color',
    pointValue: 'point',
    waveTypeEnumValue: 'string',
    curveModeEnumValue: 'string',
    cycleLengthModeEnumValue: 'string',
    timedLineArrayModeEnumValue: 'string',
    timedLineArrayIntervalModeEnumValue: 'string',
  };
  return map[valueType] ?? 'number';
}
