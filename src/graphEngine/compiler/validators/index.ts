import type { GeoArtGraph } from '../../../schema/_generated/schema-types';
import type { SemanticValidationResult } from './types';
import type { LegacyNodeRegistry } from '../../externalInterfaces/AllNodeImplementations';

export type { ValidationError, ValidationSeverity, SemanticValidationResult } from './types';

import { validateNoDuplicateIds } from './duplicateIds';
import { validateNoCycles } from './noCycles';
import { validateRefs } from './refs';
import { validateEnumValues } from './enumValues';
import { validateOrphanedNodes } from './orphanedNodes';


/**
 * It doesn't actually make sense that the validators need the node implementations
 * The logic of knowing what nodes exists can be determined from the schema itself, surely. 
 * 
 * This lint ignore is not permission to ignore others. 
 */
// eslint-disable-next-line import/no-restricted-paths
import { realNodeRegistry } from '../../exports';

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
export function validateGraphSemantics(graph: GeoArtGraph, registry: LegacyNodeRegistry = realNodeRegistry): SemanticValidationResult {
  const errors = [
    ...validateNoDuplicateIds(graph),
    ...validateNoCycles(graph),
    ...validateRefs(graph, registry),
    ...validateEnumValues(graph, registry),
    ...validateOrphanedNodes(graph),
  ];
  return {
    valid: errors.every(e => e.severity !== 'error'),
    errors,
  };
}
