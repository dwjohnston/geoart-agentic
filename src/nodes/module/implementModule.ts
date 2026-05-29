/**
 * Helper to implement a module.
 *
 * Usage:
 * ```ts
 * export const orbitModuleImplementation = implementModule("orbit-module", (params, moduleId, config) => {
 *   const internalNodes = { control: [...], compute: [...], render: [...] };
 *   const markerNode = { id: moduleId, type: "module-marker", ... };
 *   return { ...internalNodes, markerNode };
 * });
 * ```
 */

import type { ModuleNodeKinds, NodeInputsDeclared, NodeInputsResolved, } from '../../schema/typeHelpers';
import type { ModuleExpansionResult, ModuleImplementationFn } from '../../graphEngine/externalInterfaces/ModuleImplementation';

export function implementModule<K extends ModuleNodeKinds>(options: {
  _kind: K,
  fn: (params: NodeInputsDeclared<K>, moduleId: string, defaultValues: NodeInputsResolved<K>) => ModuleExpansionResult,
  defaultValues: NodeInputsResolved<K>
}
): ModuleImplementationFn<K> {

  return (params: NodeInputsDeclared<K>, moduleId: string) => options.fn(params, moduleId, options.defaultValues);
}
