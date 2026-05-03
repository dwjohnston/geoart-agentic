import type React from 'react';
import type { Value } from '../../graphEngine/types';
import type { ValueTypes } from '../../schema/_generated/value-kinds-2';
import type { ControlNode } from '../../schema/_generated/schema-types';
import type { ControlNodeKinds, NodeInputsResolved } from '../../schema/typeHelpers';
import { nodeInputs } from '../../schema/_generated/node-inputs-2';
import { nodeOutputMeta } from '../../schema/_generated/node-outputs-2';

export type PortDef = {
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
export type LegacyControlNodeDef<T extends ControlNode['type'] & keyof typeof nodeOutputMeta = ControlNode['type'] & keyof typeof nodeOutputMeta> = {
  type: T;
  outputs: PortDef[];
  evaluate(params: ResolvedParams): Value[];
  renderControl(node: Extract<ControlNode, { type: T }>, set: ControlSetter<T>): React.ReactNode;
};

export type DefineableControlNodeKind = ControlNodeKinds & keyof typeof nodeInputs & keyof typeof nodeOutputMeta;

export type NodeWithDefaults<K extends DefineableControlNodeKind> =
  Omit<Extract<ControlNode, { type: K }>, 'params'> & {
    params: Required<Extract<ControlNode, { type: K }>['params']>;
  };

// Clean typed spec — mirrors ComputeNodeDef<K>
export type ControlNodeDef<K extends DefineableControlNodeKind> = {
  nodeKind: K;
  defaultValues: NodeInputsResolved<K>;
  renderControl: (node: NodeWithDefaults<K>, set: ControlSetter<K>) => React.ReactNode;
};

export function defineControlNode<K extends DefineableControlNodeKind>(
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

export function convertControlNodeDefToLegacy<K extends DefineableControlNodeKind>(
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

function valueTypeToPortType(valueType: string): PortDef['type'] {
  const map: Record<string, PortDef['type']> = {
    numberValue: 'number',
    stringValue: 'string',
    stringArrayValue: 'string',
    colorValue: 'color',
    pointValue: 'point',
  };
  return map[valueType] ?? 'number';
}
