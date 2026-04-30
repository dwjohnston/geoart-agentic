import type { ControlNode, RenderNode, ComputeNode } from "./_generated/schema-types";
import { nodeInputs } from "./_generated/node-inputs-2"
import type { ValueTypes } from "./_generated/value-kinds-2";


/**
 * The term 'type' is too ambigious and should be avoided. 
 * 
 * If are are referring to the descriminator - use the term 'kind'
 * 
 * 
 */

export type ControlNodeKinds = ControlNode['type'];
export type ComputeNodeKinds = RenderNode['type']
export type RenderNodeKinds = ComputeNode['type']


export type ValueTypeNames = ValueTypes['kind']
export type ValueTypeNameToValueType<T extends ValueTypeNames> = Extract<ValueTypes, { kind: T }>





export type InputDefsAsObject<T extends keyof typeof nodeInputs> = typeof nodeInputs[T]
