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
  provideNodes: (params: NodeInputsDeclared<K>, moduleId: string, defaultValues: NodeInputsResolved<K>) => ModuleExpansionResult<K>,
  defaultValues: NodeInputsResolved<K>
}
): ModuleImplementationFn<K> {

  const fn = (params: NodeInputsDeclared<K>, moduleId: string) => options.provideNodes(params, moduleId, options.defaultValues);
  // _kind is exposed so it can be asserted to match the implementation's filename.
  fn._kind = options._kind;
  return fn;
}
