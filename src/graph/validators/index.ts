import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import type { SemanticValidationResult } from './types';

export type { ValidationError, ValidationSeverity, SemanticValidationResult } from './types';

import { validateNoDuplicateIds } from './duplicateIds';
import { validateNoCycles } from './noCycles';
import { validateRefs } from './refs';
import { validateEnumValues } from './enumValues';
import { validateOrphanedNodes } from './orphanedNodes';

/**
 * Run all semantic validators against a graph.
 *
 * Assumes the graph has already passed JSON Schema validation
 * (`validateGeoArtGraph`). Semantic validation catches topology and
 * cross-node reference errors that JSON Schema cannot express.
 *
 * Returns `valid: false` if any error-severity item is present.
 * Warnings (e.g. orphaned nodes) do not affect `valid`.
 */
export function validateGraphSemantics(graph: GeoArtGraph): SemanticValidationResult {
  const errors = [
    ...validateNoDuplicateIds(graph),
    ...validateNoCycles(graph),
    ...validateRefs(graph),
    ...validateEnumValues(graph),
    ...validateOrphanedNodes(graph),
  ];
  return {
    valid: errors.every(e => e.severity !== 'error'),
    errors,
  };
}
