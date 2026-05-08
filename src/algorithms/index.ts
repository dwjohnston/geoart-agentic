import { earthVenusGraph } from './earthVenus';
import { threeOrbitsGraph } from './threeOrbits';
import { earth3VenusGraph } from './earth3Venus';
import type { GeoArtGraph } from '../schema/_generated/schema-types';
import { monaLisaGraph } from './monaLisa';
import { wavingLinesGraph } from './wavingLines';
import { lfoPlanetsGraph } from './lfoPlanets';
import { singleOrbitLfoGraph } from './singleOrbitLfo';
import { pulsingSpiralsGraph } from './pulsingSpirals';
import { orbitWaveLineGraph } from './orbitWaveLine';
import { REFERENCE_GRAPHS } from './reference/_index';

export type GraphEntry = {
  id: string;
  name: string;
  graph: GeoArtGraph;
};

export const GRAPHS: GraphEntry[] = [
  { id: 'threeOrbits', name: 'Three Orbits', graph: threeOrbitsGraph },
  { id: 'earthVenus', name: 'Earth & Venus', graph: earthVenusGraph },
  { id: 'monaLisa', name: "Mona Lisa", graph: monaLisaGraph },
  { id: 'earth3Venus', name: 'Earth 3 Venus', graph: earth3VenusGraph },
  { id: 'wavingLines', name: 'Waving Lines', graph: wavingLinesGraph },
  { id: 'lfoPlanets', name: 'LFO Planets', graph: lfoPlanetsGraph },
  { id: 'singleOrbitLfo', name: 'Single Orbit LFO', graph: singleOrbitLfoGraph },
  { id: 'pulsingSpirals', name: 'Pulsing Spirals', graph: pulsingSpiralsGraph },
  { id: 'orbitWaveLine', name: 'Orbit Wave Line', graph: orbitWaveLineGraph },
  ...REFERENCE_GRAPHS
];

export const DEFAULT_GRAPH_ID = GRAPHS[0].id;

export function getGraph(id: string): GraphEntry {
  const entry = GRAPHS.find(g => g.id === id);
  if (!entry) throw new Error(`Unknown graph id: ${id}`);
  return entry;
}
