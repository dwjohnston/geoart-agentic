import type React from 'react';
import type { Value } from '../../schema/types';
import type { ValueTypes } from '../../schema/_generated/value-kinds-2';
import type { ControlNode } from '../../schema/_generated/schema-types';
import type { ControlNodeKinds, NodeInputsResolved } from '../../schema/typeHelpers';
import { nodeOutputMeta } from '../../schema/_generated/node-outputs-2';


// @legacy - this should have the possible value types derived from the schema
export type LegacyControlNodePortDef = {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'color' | 'point';
};

export type ResolvedParams = Record<string, { v: unknown }>;

type OutputPortNames<K extends keyof typeof nodeOutputMeta> =
  typeof nodeOutputMeta[K][number]['name'];

type OutputValueForPort<K extends keyof typeof nodeOutputMeta, PortName extends string> =
  Extract<typeof nodeOutputMeta[K][number], { name: PortName }> extends { valueType: `${infer Kind}Value` }
  ? Omit<Extract<ValueTypes, { kind: Kind }>, 'kind'>
  : never;

export type ControlSetter<K extends keyof typeof nodeOutputMeta> =
  <PortName extends OutputPortNames<K>>(paramKey: PortName, value: OutputValueForPort<K, PortName>) => void;

// Legacy format — used internally by the registry and graph layer
// We want to get rid of this
export type LegacyControlNodeDef<T extends ControlNode['type'] & keyof typeof nodeOutputMeta = ControlNode['type'] & keyof typeof nodeOutputMeta> = {
  type: T;
  outputs: LegacyControlNodePortDef[];
  evaluate(params: ResolvedParams): Value[];
  renderControl(node: Extract<ControlNode, { type: T }>, set: ControlSetter<T>): React.ReactNode;
};


export type NodeWithDefaults<K extends ControlNodeKinds> =
  Omit<Extract<ControlNode, { type: K }>, 'params'> & {
    params: Required<Extract<ControlNode, { type: K }>['params']>;
  };

// Clean typed spec — mirrors ComputeNodeDef<K>
export type ControlNodeDef<K extends ControlNodeKinds> = {
  nodeKind: K;
  defaultValues: NodeInputsResolved<K>;
  renderControl: (node: NodeWithDefaults<K>, set: ControlSetter<K>) => React.ReactNode;
};

export function defineControlNode<K extends ControlNodeKinds>(
  kind: K,
  def: {
    defaults: NodeInputsResolved<K>;
    renderControl: (node: NodeWithDefaults<K>, set: ControlSetter<K>) => React.ReactNode;
  }
): ControlNodeDef<K> {
  return {
    nodeKind: kind,
    defaultValues: def.defaults,
    renderControl: def.renderControl,
  } as unknown as ControlNodeDef<K>;
}

export function convertControlNodeDefToLegacy<K extends ControlNodeKinds>(
  def: ControlNodeDef<K>
): LegacyControlNodeDef<K> {
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
  } as unknown as LegacyControlNodeDef<K>;
}


// @legacy - we are trying to get rid of this 
function valueTypeToPortType(valueType: string): LegacyControlNodePortDef['type'] {
  const map: Record<string, LegacyControlNodePortDef['type']> = {
    numberValue: 'number',
    stringValue: 'string',
    stringArrayValue: 'string',
    colorValue: 'color',
    pointValue: 'point',
  };
  return map[valueType] ?? 'number';
}
