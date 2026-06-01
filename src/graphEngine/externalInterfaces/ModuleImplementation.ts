/**
 * Module Implementation Interface
 *
 * Defines how module implementations generate internal nodes and expose
 * a public interface via marker nodes.
 */

import type { nodeInputs } from '../../schema/_generated/node-inputs-2';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import type { ModuleNodeKinds, NodeInputsDeclared, NodeInputsResolved, NodeOutputAsRefs, ResolvedValue, ValueTypeNamesSuffixed } from '../../schema/typeHelpers';



/**
 * Result of expanding a module node — the complete set of internal nodes
 * plus the marker node that serves as the public interface.
 */
export interface ModuleExpansionResult<K extends ModuleNodeKinds> {
  /** Internal control nodes (prefixed with {moduleId}:) */
  controlNodes: GeoArtGraph['control']['nodes'];
  /** Internal compute nodes (prefixed with {moduleId}:) */
  computeNodes: GeoArtGraph['compute']['nodes'];
  /** Internal render nodes (prefixed with {moduleId}:) */
  renderNodes: GeoArtGraph['render']['nodes'];
  /** Marker node exposing the module's public outputs */
  outputMarkerNode: {
    id: string;
    type: 'module-output-marker';
    params: Record<string, never>; // Marker nodes have no params
    outputRefs: NodeOutputAsRefs<K>;


    nodeSource: {
      sourceType: 'module';
      sourceId: string;
    };
  };

  inputMarkerNode: {
    id: string;
    type: "module-input-marker",
    params: NodeInputsDeclared<K>,
    renderControl: (params: StaticModuleNodeParams<K>, set: ModuleControlSetter<K>) => React.ReactNode;
  },

  defaultValues: NodeInputsResolved<K>
}

/**
 * The compiler will drop referenced values off this object, this this contains just static values, whether those have been explicitly declared or are using the default fallback
 * 
 * @example
 */
export type StaticModuleNodeParams<K extends ModuleNodeKinds> = Partial<NodeInputsResolved<K>>

/**
 * Registry mapping module type names to their implementation functions.
 */
export type ModuleImplementationFn<K extends ModuleNodeKinds> = (params: NodeInputsDeclared<K>, moduleId: string) => ModuleExpansionResult<K>;

export type ModuleRegistry = Map<string, ModuleImplementationFn<ModuleNodeKinds>>;


// Function type for setting module control parameters with type-safe port names and values
export type ModuleControlSetter<K extends ModuleNodeKinds> = <
  Port extends keyof typeof nodeInputs[K]
>(
  param: Port,
  value: typeof nodeInputs[K][Port] extends { valueType: infer VT extends ValueTypeNamesSuffixed }
    ? ResolvedValue<VT>
    : never
) => void;