/**
 * Types for module definitions — the schema-layer construct for reusable node bundles.
 *
 * A module is a named, reusable collection of control/compute/render nodes that is
 * declared once in an algorithm and expanded at compile time into ordinary node
 * declarations. The evaluator never sees modules — only their expanded nodes.
 */

/** A single input port on a module. */
export type ModuleInputDef = {
  name: string;
  /** JSON Schema value type, e.g. 'numberValue'. */
  valueType: string;
  /**
   * When the input is supplied as a static value (or omitted entirely),
   * materialise this control node. Set to null for inputs that are always
   * expected to come from a ref (e.g. time).
   */
  controlNode: {
    type: string;
    defaultParams: Record<string, { v: unknown }>;
  } | null;
  /** Default value used when the input is omitted and no controlNode is defined. */
  defaultValue?: { v: unknown };
  /**
   * When true, this input is entirely omitted from resolvedInputs if not supplied
   * by the algorithm. The module's buildNodes must check `resolvedInputs.has(name)`
   * before using it. Use for inputs that have no sensible default.
   */
  optional?: boolean;
};

/** A single output port on a module. */
export type ModuleOutputDef = {
  name: string;
  /** Returns the internal ref string (e.g. 'venus__orbit.points') for a given module instance id. */
  getInternalRef: (moduleId: string) => string;
};

/** A single expanded node produced by a module. */
export type ModuleNodeExpansion = {
  id: string;
  layer: 'control' | 'compute' | 'render';
  type: string;
  params: Record<string, { v: unknown } | { ref: string }>;
  renderConfig?: { layer: 'paint' | 'live' };
};

/** A module definition — the schema-layer description of a reusable node bundle. */
export type ModuleDef = {
  name: string;
  inputs: ModuleInputDef[];
  outputs: ModuleOutputDef[];
  /**
   * Builds the expanded nodes for a module instance.
   *
   * @param moduleId - The id given to this module instance in the algorithm.
   * @param resolvedInputs - Map from input name to the ref string that resolves it.
   *   For static/default inputs this points to the generated control node output;
   *   for ref'd inputs this points to the user-supplied ref.
   */
  buildNodes: (moduleId: string, resolvedInputs: Map<string, string>) => ModuleNodeExpansion[];
};
