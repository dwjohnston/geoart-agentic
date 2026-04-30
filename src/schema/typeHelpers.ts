import type { ControlNode, RenderNode, ComputeNode } from "./_generated/schema-types";
import { nodeInputs } from "./_generated/node-inputs-2"
import { nodeOutputMeta } from "./_generated/node-outputs-2"

import type { ValueTypes } from "./_generated/value-kinds-2";


/**
 * The term 'type' is too ambiguous and should be avoided.
 *
 * If referring to the discriminator - use the term 'kind'
 */

export type ControlNodeKinds = ControlNode['type'];
export type ComputeNodeKinds = ComputeNode['type']
export type RenderNodeKinds = RenderNode['type']


export type ValueTypeNames = ValueTypes['kind']
export type ValueTypeNameToValueType<T extends ValueTypeNames> = Extract<ValueTypes, { kind: T }>


// Maps the schema's valueType string name (e.g. "numberValue") to the corresponding
// TypeScript value type (e.g. V_numberValue). The convention is that the kind
// discriminator is the valueType name with the trailing "Value" stripped.
export type ValueTypeByName<T extends string> = Omit<
  Extract<ValueTypes, { kind: T extends `${infer K}Value` ? K : never }>,
  'kind'
>


export type InputDefsAsObject<T extends keyof typeof nodeInputs> = typeof nodeInputs[T]

// Given a compute node kind (e.g. "add"), produces a record of output port names
// to the raw .v type of each port: { sum: number }
// The evaluate function returns this shape — defineComputeNode reconstructs the full Value.
export type NodeOutputsRecord<K extends keyof typeof nodeOutputMeta> = {
  [Item in typeof nodeOutputMeta[K][number] as Item['name']]:
    ValueTypeByName<Item['valueType']> extends { v: infer V } ? V : never
}

// Given a compute node kind (e.g. "add"), produces a record of input port names
// to their full value types: { a: V_numberValue; b: V_numberValue }
export type NodeInputsRecord<K extends keyof typeof nodeInputs> = {
  [Port in keyof typeof nodeInputs[K]]: typeof nodeInputs[K][Port] extends { valueType: infer VT extends string }
    ? ValueTypeByName<VT>
    : never
}
