import type { ControlNode, RenderNode, ComputeNode, ModuleNode } from "./_generated/schema-types";
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
export type ModuleNodeKinds = ModuleNode['type']


export type ValueTypeNames = ValueTypes['kind'];
export type ValueTypeNamesSuffixed = `${ValueTypeNames}Value`
export type ValueTypeNameToValueType<T extends ValueTypeNames> = Extract<ValueTypes, { kind: T }>


// Maps the schema's valueType string name (e.g. "numberValue") to the corresponding
// TypeScript value type (e.g. V_numberValue). The convention is that the kind
// discriminator is the valueType name with the trailing "Value" stripped.
export type ValueTypeByName<T extends ValueTypeNamesSuffixed> = Omit<
  Extract<ValueTypes, { kind: T extends `${infer K}Value` ? K : never }>,
  'kind'
>

export type ResolvedValue<T extends ValueTypeNamesSuffixed> = ValueTypeByName<T> extends { v: infer V } ? V : never

export type InputDefsAsObject<T extends keyof typeof nodeInputs> = typeof nodeInputs[T]

export type NodeOutputKeys<K extends ModuleNodeKinds> = typeof nodeOutputMeta[K][number]['name'];

export type NodeOutputAsRefs<K extends ModuleNodeKinds> = {
  [Key in NodeOutputKeys<K>]: ReferencedValueDeclared;
}

// Given a compute node kind (e.g. "add"), produces a record of output port names
// to the raw .v type of each port: { sum: number }
// The evaluate function returns this shape — defineComputeNode reconstructs the full Value.
export type NodeOutputsResolved<K extends keyof typeof nodeOutputMeta> = {
  [Item in typeof nodeOutputMeta[K][number]as Item['name']]:
  ValueTypeByName<Item['valueType']> extends { v: infer V } ? V : never
}



/**
 * Given a nodeType, get its resolved values
 */
export type NodeInputsResolved<K extends keyof typeof nodeInputs> = {
  [Port in keyof typeof nodeInputs[K]]: typeof nodeInputs[K][Port] extends { valueType: infer VT extends ValueTypeNamesSuffixed }
  ? ResolvedValue<VT>
  : never
}



export type Sampler = {
  sample(t: number): number;
  sampleMany(ts: number[]): number[];
}

export type ReferencedValueDeclared = { ref: string };

// Detect if a value type name is an array type (e.g., "colorPointArray", "stringArray")
type IsArrayValueType<T extends ValueTypeNames> = T extends `${string}Array` ? true : false;

// Extract the item type from an array value kind (e.g., "colorPointArray" -> "colorPoint")
type ArrayItemType<T extends ValueTypeNames> = T extends `${infer Item}Array` ? Item : never;

// For array types, StaticValueDeclared is an array of StaticValueDeclared items
// For non-array types, it's the raw resolved value
export type StaticValueDeclared<T extends ValueTypeNames> =
  IsArrayValueType<T> extends true
  ? { v: Array<StaticValueDeclared<ArrayItemType<T>>> }
  : { v: ResolvedValue<`${T}Value`> };

// For array types, ValueDeclared can be a reference to an array or an array of mixed declared values
// For non-array types, it's either a reference or a static value
export type ValueDeclared<T extends ValueTypeNames> =
  IsArrayValueType<T> extends true
  ? ReferencedValueDeclared | { v: Array<ValueDeclared<ArrayItemType<T>>> }
  : ReferencedValueDeclared | StaticValueDeclared<T>;



/**
 * Produces the valid ref strings for a given node type and instance id.
 * e.g. PortReferenceForNodeType<'orbit', 'myOrbit'> = 'myOrbit.point' | 'myOrbit.points'
 * Render nodes (no outputs) resolve to never.
 */
export type PortReferenceForNodeType<
  NodeType extends keyof typeof nodeOutputMeta,
  NodeId extends string
> = `${NodeId}.${typeof nodeOutputMeta[NodeType][number]['name']}`

type InputPortValueType<
  K extends keyof typeof nodeInputs,
  Port extends keyof typeof nodeInputs[K]
> = typeof nodeInputs[K][Port] extends { valueType: infer VT extends string } ? VT : never;

export type ValidPortReferenceForNodeInputPort<
  TargetNodeType extends keyof typeof nodeInputs,
  Port extends keyof typeof nodeInputs[TargetNodeType],
  AvailableNodes extends { nodeType: keyof typeof nodeOutputMeta; nodeId: string }
> = AvailableNodes extends { nodeType: infer NT extends keyof typeof nodeOutputMeta; nodeId: infer NId extends string }
  ? `${NId}.${Extract<typeof nodeOutputMeta[NT][number], { valueType: InputPortValueType<TargetNodeType, Port> }>['name']}`
  : never;
export type NodeAccumulator = { nodeType: keyof typeof nodeOutputMeta; nodeId: string };

// Any valid nodeId.portName across all accumulated nodes, regardless of value type.
// Used to constrain refs within array items.
export type ValidPortReferenceForAnyOutput<Acc extends NodeAccumulator> =
  Acc extends { nodeType: infer NT extends keyof typeof nodeOutputMeta; nodeId: infer NId extends string }
  ? `${NId}.${typeof nodeOutputMeta[NT][number]['name']}`
  : never;

// Top-level ref: type-matched via ValidPortReferenceForNodeInputPort.
// Array item refs: any valid nodeId.portName in Acc (existence check, no type matching).
type ConstrainedValueDeclared<
  Kind extends ValueTypeNames,
  K extends keyof typeof nodeInputs,
  Port extends keyof typeof nodeInputs[K],
  Acc extends NodeAccumulator
> = IsArrayValueType<Kind> extends true
  ? { ref: ValidPortReferenceForNodeInputPort<K, Port, Acc> }
  | { v: Array<{ ref: ValidPortReferenceForAnyOutput<Acc> } | StaticValueDeclared<ArrayItemType<Kind>>> }
  : StaticValueDeclared<Kind>
  | { ref: ValidPortReferenceForNodeInputPort<K, Port, Acc> };

export type ConstrainedNodeInputsDeclared<
  K extends keyof typeof nodeInputs,
  Acc extends NodeAccumulator
> = {
    [Port in keyof typeof nodeInputs[K]]?:
    typeof nodeInputs[K][Port] extends { valueType: infer VT extends ValueTypeNamesSuffixed }
    ? K extends ControlNodeKinds
    ? StaticValueDeclared<VT extends `${infer Kind}Value` ? Kind : never>
    : ConstrainedValueDeclared<
      VT extends `${infer Kind}Value` ? Kind extends ValueTypeNames ? Kind : never : never,
      K,
      Port,
      Acc
    >
    : never
  }

// Remember, Control nodes inputs can not be refererenced values.
export type NodeInputsDeclared<K extends keyof typeof nodeInputs> = {
  [Port in keyof typeof nodeInputs[K]]?: typeof nodeInputs[K][Port] extends { valueType: infer VT extends ValueTypeNamesSuffixed }
  ? K extends ControlNodeKinds
  ? StaticValueDeclared<VT extends `${infer Kind}Value` ? Kind : never>
  : ValueDeclared<VT extends `${infer Kind}Value` ? Kind : never>
  : never
}

/**
 * Function type for setting module node input values during rendering.
 * Constrains parameter names to valid input port names and values to their resolved types.
 *
 * @example
 * ```ts
 * const fn: ModuleControlSetter<"orbit-module"> = (paramKey, value) => {
 *   // paramKey can be "speed", "radius", "numPoints"
 *   // value must match the resolved type for that parameter
 * }
 *
 * fn("radius", 0.3);     // ✓ number
 * fn("speed", 1);        // ✓ number
 * fn("radius", "0.3");   // ✗ type error: expects number
 * fn("invalid", 1);      // ✗ type error: invalid parameter name
 * ```
 */
export type ModuleControlSetter<K extends ModuleNodeKinds> = <
  Port extends keyof typeof nodeInputs[K]
>(
  param: Port,
  value: typeof nodeInputs[K][Port] extends { valueType: infer VT extends ValueTypeNamesSuffixed }
    ? ResolvedValue<VT>
    : never
) => void;


