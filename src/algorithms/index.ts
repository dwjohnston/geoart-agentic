
import type { GeoArtGraph } from '../schema/_generated/schema-types';
import { REFERENCE_GRAPHS } from './reference/_index';


export type GraphEntry = {
  id: string;
  name: string;
  graph: GeoArtGraph;
};


export const GRAPHS: GraphEntry[] = [
  ...REFERENCE_GRAPHS
];

export const DEFAULT_GRAPH_ID = GRAPHS[0].id;

export function getGraph(id: string): GraphEntry {
  const entry = GRAPHS.find(g => g.id === id);
  if (!entry) throw new Error(`Unknown graph id: ${id}`);
  return entry;
}
