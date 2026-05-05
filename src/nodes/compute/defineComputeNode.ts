import type { Value } from '../../schema/types';
import type { ComputeNodeKinds, NodeInputsResolved, NodeOutputsResolved } from '../../schema/typeHelpers';
import { nodeInputs } from '../../schema/_generated/node-inputs-2';
import { nodeOutputMeta } from '../../schema/_generated/node-outputs-2';
import { objectEntries } from '../../common-tooling/typedObject';

//@legacy - this does not belong here we should get this (or a type like this) into `src/graph`
// We are trying to get rid of this
export type LegacyComputeNodePortDef = {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'color' | 'point' | 'colorPoint' | 'colorPointArray';
  default?: Value | { v: string };
  options?: string[];
};

//@legacy - this does not belong here we should get this (or a type like this) into `src/graph`
export type EvalContext = {
  tickCount: number;
  getState<T>(): T;
  setState<T>(s: T): void;
};


//@legacy - this does not belong here we should get this (or a type like this) into `src/graph`
export type NodeDef = {
  type: string;
  isTimeDependant?: boolean;
  inputs: LegacyComputeNodePortDef[];
  outputs: LegacyComputeNodePortDef[];
  evaluate(inputs: Value[], ctx: EvalContext): Value[];
};
type DefineableComputeNodeKind = ComputeNodeKinds;


export type ComputeNodeDef<T extends DefineableComputeNodeKind> = {
  nodeKind: T;

  //I'm not sure about this one though
  isTimeDependant?: boolean;
  defaultValues: NodeInputsResolved<T>;
  evaluate: (inputs: NodeInputsResolved<T>) => NodeOutputsResolved<T>
}


export function defineComputeNodeLegacy<K extends DefineableComputeNodeKind>(
  kind: K,
  def: {
    isTimeDependant?: boolean;
    defaults: NodeInputsResolved<K>,
    evaluate: (inputs: NodeInputsResolved<K>) => NodeOutputsResolved<K>;
  }
): NodeDef {
  const inputEntries = objectEntries(nodeInputs[kind]);
  const outputItems = nodeOutputMeta[kind];
  const inputPortNames = inputEntries.map(([name]) => name);



  return {
    type: kind,
    isTimeDependant: def.isTimeDependant,

    //@ts-expect-error - ignore this for now
    inputs: inputEntries.map((entries) => {

      const [paramName, paramValueInformation] = entries;
      return {
        name: paramName,
        //@ts-expect-error - ignore this for now

        type: valueTypeToPortType(paramValueInformation.valueType),
        default: { v: def.defaults[paramName] }
      }
    }),
    outputs: outputItems.map(({ name, valueType }) => ({
      name,
      type: valueTypeToPortType(valueType),
    })),
    evaluate(inputs: Value[]) {
      const namedInputs = Object.fromEntries(
        inputPortNames.map((name, i) => [name, inputs[i]['v']])
      ) as unknown as NodeInputsResolved<K>;

      const result = def.evaluate(namedInputs);

      return outputItems.map(({ name, valueType }) => {
        const v = (result as Record<string, unknown>)[name];
        const resultKind = valueType.replace(/Value$/, '');
        return { kind: resultKind, v } as Value;
      });
    },
  };
}


export function convertComputeNodeDefinitionToLegacyDefinition<T extends ComputeNodeKinds>(value: ComputeNodeDef<T>): NodeDef {



  return defineComputeNodeLegacy(value.nodeKind, {
    defaults: value.defaultValues,
    evaluate: value.evaluate,
    isTimeDependant: value.isTimeDependant
  })
}

export function defineComputeNode<K extends ComputeNodeKinds>(
  kind: K,
  def: {
    isTimeDependant?: boolean;
    defaults: NodeInputsResolved<K>,
    evaluate: (inputs: NodeInputsResolved<K>) => NodeOutputsResolved<K>;
  }
): ComputeNodeDef<K> {
  return {
    nodeKind: kind,
    isTimeDependant: def.isTimeDependant,
    evaluate: def.evaluate,
    defaultValues: def.defaults
  }
}


//@legacy - we are trying to get rid of this
function valueTypeToPortType(valueType: string): LegacyComputeNodePortDef['type'] {
  const map: Record<string, LegacyComputeNodePortDef['type']> = {
    numberValue: 'number',
    stringValue: 'string',
    stringArrayValue: 'string',
    colorValue: 'color',
    pointValue: 'point',
    colorPointValue: 'colorPoint',
    colorPointArrayValue: 'colorPointArray',
    waveTypeValue: 'string',
  };
  return map[valueType] ?? 'number';
}