import type { ModuleRegistry } from '../../graphEngine/externalInterfaces/ModuleImplementation';
import orbitModuleImplementation from './nodes/orbit';

/**
 * Registry of module implementations.
 * Maps module type names to their implementation functions.
 */
export const moduleRegistry: ModuleRegistry = new Map([
  ['orbit-module', orbitModuleImplementation],
]);
