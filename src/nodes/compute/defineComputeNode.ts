import type { Value } from '../../graph/types';
import type { ComputeNodeKinds, NodeInputsRecord, NodeOutputsRecord } from '../../schema/typeHelpers';
import { nodeInputs } from '../../schema/_generated/node-inputs-2';
import { nodeOutputMeta } from '../../schema/_generated/node-outputs-2';
import { objectEntries } from '../../common-tooling/typedObject';

//@legacy - this does not belong here we should get this (or a type like this) into `src/graph`
export type PortDef = {
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
  inputs: PortDef[];
  outputs: PortDef[];
  evaluate(inputs: Value[], ctx: EvalContext): Value[];
};

type DefineableComputeNodeKind = ComputeNodeKinds & keyof typeof nodeInputs & keyof typeof nodeOutputMeta;

export function defineComputeNode<K extends DefineableComputeNodeKind>(
  kind: K,
  def: {
    isTimeDependant?: boolean;
    defaults: NodeInputsRecord<K>,
    evaluate: (inputs: NodeInputsRecord<K>) => NodeOutputsRecord<K>;
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
      console.log(paramName, def.defaults)
      return {
        name: paramName,
        //@ts-expect-error - ignore this for now

        type: valueTypeToPortType(paramValueInformation.valueType),
        default: def.defaults[paramName]
      }
    }),
    outputs: outputItems.map(({ name, valueType }) => ({
      name,
      type: valueTypeToPortType(valueType),
    })),
    evaluate(inputs: Value[]) {
      const namedInputs = Object.fromEntries(
        inputPortNames.map((name, i) => [name, inputs[i]])
      ) as unknown as NodeInputsRecord<K>;

      const result = def.evaluate(namedInputs);

      return outputItems.map(({ name, valueType }) => {
        const v = (result as Record<string, unknown>)[name];
        const resultKind = valueType.replace(/Value$/, '');
        return { kind: resultKind, v } as Value;
      });
    },
  };
}

function valueTypeToPortType(valueType: string): PortDef['type'] {
  const map: Record<string, PortDef['type']> = {
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