import type { Value } from '../../schema/types';

import type { RenderNodeKinds, NodeInputsResolved } from '../../schema/typeHelpers';
import { nodeInputs } from '../../schema/_generated/node-inputs-2';
import { objectEntries } from '../../common-tooling/typedObject';
import type { LegacyRenderNodePortDef, RenderEvalContext, LegacyRenderNodeDef, RenderNodeDef } from '../../graphEngine/externalInterfaces/RenderNodeDefinition';

export function implementRenderNode<K extends RenderNodeKinds>(
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

export function convertRenderNodeDefToLegacy<K extends RenderNodeKinds>(
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



//@legacy we are trying to get rid of this
function valueTypeToPortType(valueType: string): LegacyRenderNodePortDef['type'] {
  const map: Record<string, LegacyRenderNodePortDef['type']> = {
    numberValue: 'number',
    colorValue: 'color',
    pointValue: 'point',
    colorPointValue: 'colorPoint',
    colorPointArrayValue: 'colorPointArray',
    triggerValue: 'trigger',
    waveTypeEnumValue: 'string',
    curveModeEnumValue: 'string',
    cycleLengthModeEnumValue: 'string',
    timedLineArrayModeEnumValue: 'string',
    timedLineArrayIntervalModeEnumValue: 'string',
  };
  return map[valueType] ?? 'number';
}

function buildDefault(valueType: string, defaultVal: { v: unknown } | undefined): Value | undefined {
  if (defaultVal === undefined) return undefined;
  const kind = valueType.replace(/Value$/, '');
  return { kind, v: defaultVal.v } as Value;
}
