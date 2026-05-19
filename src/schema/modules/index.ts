import type { ModuleDef } from './types';
import { orbitModule } from './orbitModule';

export type { ModuleDef } from './types';

/** Registry of all available modules, keyed by module name. */
export const moduleRegistry = new Map<string, ModuleDef>([
  [orbitModule.name, orbitModule],
]);
