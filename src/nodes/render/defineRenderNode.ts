import type { Value } from '../../graph/types';
import type { RenderNodeKinds, NodeInputsRecord } from '../../schema/typeHelpers';
import { nodeInputs } from '../../schema/_generated/node-inputs-2';
import { objectEntries } from '../../common-tooling/typedObject';
import type { PortDef, RenderEvalContext, RenderNodeDef } from './types';

type DefineableRenderNodeKind = RenderNodeKinds & keyof typeof nodeInputs;

export function defineRenderNode<K extends DefineableRenderNodeKind>(
  kind: K,
  def: {
    defaults: NodeInputsRecord<K>;
    evaluate: (inputs: NodeInputsRecord<K>, ctx: RenderEvalContext) => void;
  }
): RenderNodeDef {
  const inputEntries = objectEntries(nodeInputs[kind]);
  const inputPortNames = inputEntries.map(([name]) => name);

  return {
    type: kind,
    //@ts-expect-error - ignore this for now
    inputs: inputEntries.map((entries) => {
      const [paramName, paramValueInformation] = entries;
      return {
        name: paramName,
        //@ts-expect-error - ignore this for now
        type: valueTypeToPortType(paramValueInformation.valueType),
        //@ts-expect-error - ignore this for now
        default: buildDefault(paramValueInformation.valueType, def.defaults[paramName]),
      };
    }),
    outputs: [],
    evaluate(inputs: Value[], ctx: RenderEvalContext): void {
      const namedInputs = Object.fromEntries(
        inputPortNames.map((name, i) => [name, inputs[i]])
      ) as unknown as NodeInputsRecord<K>;

      def.evaluate(namedInputs, ctx);
    },
  };
}

function valueTypeToPortType(valueType: string): PortDef['type'] {
  const map: Record<string, PortDef['type']> = {
    numberValue: 'number',
    colorValue: 'color',
    pointValue: 'point',
    colorPointValue: 'colorPoint',
    colorPointArrayValue: 'colorPointArray',
    numberArrayValue: 'numberArray',
    triggerValue: 'trigger',
  };
  return map[valueType] ?? 'number';
}

function buildDefault(valueType: string, defaultVal: { v: unknown } | undefined): Value | undefined {
  if (defaultVal === undefined) return undefined;
  const kind = valueType.replace(/Value$/, '');
  return { kind, v: defaultVal.v } as Value;
}
