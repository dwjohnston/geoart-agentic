import { earthVenusGraph } from './earthVenus';
import { threeOrbitsGraph } from './threeOrbits';
import type { GeoArtGraph } from '../schema/_generated/schema-types';

export type GraphEntry = {
  id: string;
  name: string;
  graph: GeoArtGraph;
};

export const GRAPHS: GraphEntry[] = [
  { id: 'threeOrbits', name: 'Three Orbits', graph: threeOrbitsGraph },
  { id: 'earthVenus', name: 'Earth & Venus', graph: earthVenusGraph },
];

export const DEFAULT_GRAPH_ID = GRAPHS[0].id;

export function getGraph(id: string): GraphEntry {
  const entry = GRAPHS.find(g => g.id === id);
  if (!entry) throw new Error(`Unknown graph id: ${id}`);
  return entry;
}
