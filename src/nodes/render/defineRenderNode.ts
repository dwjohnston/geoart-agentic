import type { Value } from '../../schema/types';

import type { RenderNodeKinds, NodeInputsResolved } from '../../schema/typeHelpers';
import { nodeInputs } from '../../schema/_generated/node-inputs-2';
import { objectEntries } from '../../common-tooling/typedObject';
import type { PortDef, RenderEvalContext, LegacyRenderNodeDef } from './types';


// 🤖 Move to typeHelpers
export type DefineableRenderNodeKind = RenderNodeKinds & keyof typeof nodeInputs;

export type RenderNodeDef<K extends DefineableRenderNodeKind> = {
  nodeKind: K;
  defaultValues: NodeInputsResolved<K>;
  evaluate: (inputs: NodeInputsResolved<K>, ctx: RenderEvalContext) => void;
};

export function defineRenderNode<K extends DefineableRenderNodeKind>(
  kind: K,
  def: {
    defaults: NodeInputsResolved<K>;
    evaluate: (inputs: NodeInputsResolved<K>, ctx: RenderEvalContext) => void;
  }
): RenderNodeDef<K> {
  return {
    nodeKind: kind,
    defaultValues: def.defaults,
    evaluate: def.evaluate,
  };
}

export function convertRenderNodeDefToLegacy<K extends DefineableRenderNodeKind>(
  def: RenderNodeDef<K>
): LegacyRenderNodeDef {
  const inputEntries = objectEntries(nodeInputs[def.nodeKind]);
  const inputPortNames = inputEntries.map(([name]) => name);

  return {
    type: def.nodeKind,
    //@ts-expect-error - ignore this for now
    inputs: inputEntries.map((entries) => {
      const [paramName, paramValueInformation] = entries;

      return {
        name: paramName,
        //@ts-expect-error - ignore this for now
        type: valueTypeToPortType(paramValueInformation.valueType),
        //@ts-expect-error - ignore this for now
        default: buildDefault(paramValueInformation.valueType, { v: def.defaultValues[paramName] }),
      };
    }),
    outputs: [],
    evaluate(inputs: Value[], ctx: RenderEvalContext): void {
      const namedInputs = Object.fromEntries(
        inputPortNames.map((name, i) => [name, inputs[i]['v']])
      ) as NodeInputsResolved<K>;

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
    triggerValue: 'trigger',
  };
  return map[valueType] ?? 'number';
}

function buildDefault(valueType: string, defaultVal: { v: unknown } | undefined): Value | undefined {
  if (defaultVal === undefined) return undefined;
  const kind = valueType.replace(/Value$/, '');
  return { kind, v: defaultVal.v } as Value;
}
