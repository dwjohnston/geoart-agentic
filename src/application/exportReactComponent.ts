import type { GeoArtGraph } from '../schema/_generated/schema-types';

/**
 * Generates standalone `.tsx` source that embeds a single algorithm using
 * `AlgorithmCanvas` (see `src/graphEngine/exports/AlgorithmCanvas.tsx`), for a user to
 * copy/download and drop into another React project (issue #136).
 *
 * The app itself is a private, unpublished package, so this can't be a byte-for-byte
 * zero-dependency file — the graph engine's node registries are pulled in via
 * `AlgorithmCanvas`. The generated file says so up front, and states which source
 * directories the consumer needs available.
 */

export type ExportableAlgorithm = {
  id: string;
  name: string;
  graph: GeoArtGraph;
};

function toComponentName(name: string): string {
  const pascal = name
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join('');
  const safe = pascal || 'Algorithm';
  return /^[0-9]/.test(safe) ? `Algorithm${safe}` : safe;
}

export function exportReactComponentFileName(algorithm: ExportableAlgorithm): string {
  return `${toComponentName(algorithm.name)}.tsx`;
}

export function generateReactComponentSource(algorithm: ExportableAlgorithm): string {
  const componentName = toComponentName(algorithm.name);
  const graphJson = JSON.stringify(algorithm.graph, null, 2);

  return `// Exported from geoart-agentic — algorithm: ${algorithm.name}
//
// This component depends on the geoart-agentic graph engine's public exports
// ('src/graphEngine/exports'). It is not published as an npm package, so to use this
// file in another project, make the following source directories available as a
// dependency (e.g. by installing this repo as a git dependency, or copying them in):
//   src/graphEngine, src/nodes, src/schema, src/common-tooling, src/domain-helpers
//
// Once available, this file is otherwise self-contained: it carries the full graph
// definition for "${algorithm.name}" inline below.

import { AlgorithmCanvas } from './graphEngine/exports';
import type { GeoArtGraph } from './schema/_generated/schema-types';

const graph: GeoArtGraph = ${graphJson};

export type ${componentName}Props = {
  size?: number;
  speed?: number;
};

export function ${componentName}({ size, speed }: ${componentName}Props) {
  return <AlgorithmCanvas graph={graph} size={size} speed={speed} />;
}
`;
}
