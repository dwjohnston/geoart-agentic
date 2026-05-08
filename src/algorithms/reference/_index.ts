// This file is auto-generated. Run: bun run generate:algorithms-index
import type { GraphEntry } from '../index';

import { minimalThreeNodeGraph } from './minimal/minimalThreeNodeReferenceGraph';
import { linesThroughPointGraph } from './node_specific/linesThroughPointReferenceGraph';
import { polygonGraph } from './node_specific/polygonReferenceGraph';
import { arrayMixedValuesReferenceGraph } from './value_array/arrayMixedValuesReferenceGraph';
import { arrayReferenceReferenceGraph } from './value_array/arrayReferenceReferenceGraph';
import { arrayStaticValuesReferenceGraph } from './value_array/arrayStaticValuesReferenceGraph';

export const REFERENCE_GRAPHS: GraphEntry[] = [
  { id: 'minimal-three-node', name: 'Minimal Three Node', graph: minimalThreeNodeGraph },
  { id: 'lines-through-point', name: 'Lines Through Point', graph: linesThroughPointGraph },
  { id: 'polygon', name: 'Polygon', graph: polygonGraph },
  { id: 'array-mixed-values', name: 'Array Mixed Values', graph: arrayMixedValuesReferenceGraph },
  { id: 'array-reference', name: 'Array Reference', graph: arrayReferenceReferenceGraph },
  { id: 'array-static-values', name: 'Array Static Values', graph: arrayStaticValuesReferenceGraph },
];
