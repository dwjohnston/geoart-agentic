import type { Value } from '../../schema/types';
import type { ComputeNodeKinds, NodeInputsResolved, NodeOutputsResolved } from '../../schema/typeHelpers';
import type { LegacyComputeNodePortDef, LegacyComputeNodeDef, ComputeNodeDef } from '../../graphEngine/externalInterfaces/ComputeNodeDefinition';
import { nodeInputs } from '../../schema/_generated/node-inputs-2';
import { nodeOutputMeta } from '../../schema/_generated/node-outputs-2';
import { objectEntries } from '../../common-tooling/typedObject';

type DefineableComputeNodeKind = ComputeNodeKinds;


export function defineComputeNodeLegacy<K extends DefineableComputeNodeKind>(
  kind: K,
  def: {
    isTimeDependant?: boolean;
    defaults: NodeInputsResolved<K>,
    evaluate: (inputs: NodeInputsResolved<K>) => NodeOutputsResolved<K>;
  }
): LegacyComputeNodeDef {
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


export function convertComputeNodeDefinitionToLegacyDefinition<T extends ComputeNodeKinds>(value: ComputeNodeDef<T>): LegacyComputeNodeDef {



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
    samplerValue: 'number',
  };
  return map[valueType] ?? 'number';
}