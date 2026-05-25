import { compile } from '../compiler/compiler';
import { computeRegistry } from '../../nodes/compute/registry';
import { renderRegistry } from '../../nodes/render/registry';
import { controlRegistry } from '../../nodes/control/registry';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';

export type CompileResult = { success: true } | { success: false; error: string };

export function tryCompileGraph(graph: GeoArtGraph): CompileResult {
  try {
    compile(graph, { computeRegistry, renderRegistry, controlRegistry });
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}
