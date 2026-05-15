// This file is auto-generated. Run: bun run generate:algorithms-index
import type { GraphEntry } from '../index';

import { earth3VenusGraph } from './general/earth3Venus';
import { earthVenusGraph } from './general/earthVenus';
import { fractalOrbitTreeGraph } from './general/fractalOrbitTree';
import { lfoPlanetsGraph } from './general/lfoPlanets';
import { monaLisaGraph } from './general/monaLisa';
import { orbitWaveLineGraph3 } from './general/orbitWaveLine3';
import { pulsingSpiralsGraph } from './general/pulsingSpirals';
import { singleOrbitLfoGraph } from './general/singleOrbitLfo';
import { threeOrbitsGraph } from './general/threeOrbits';
import { twoOrbitCurveGraph } from './general/twoOrbitCurve';
import { wavingLinesGraph } from './general/wavingLines';
import { minimalThreeNodeGraph } from './minimal/minimalThreeNodeReferenceGraph';
import { circleGraph } from './node_specific/circleReferenceGraph';
import { connectDotsGraph } from './node_specific/connectDotsReferenceGraph';
import { connectTheDotsGraph } from './node_specific/connectTheDotsReferenceGraph';
import { curveModulatorGraph } from './node_specific/curveModulatorReferenceGraph';
import { linesThroughPointGraph } from './node_specific/linesThroughPointReferenceGraph';
import { orbitCenterPointsGraph } from './node_specific/orbitCenterPointsReferenceGraph';
import { polygonGraph } from './node_specific/polygonReferenceGraph';
import { timedLineArrayGraph } from './node_specific/timedLineArrayReferenceGraph';
import { timedLineGraph } from './node_specific/timedLineReferenceGraph';
import { arrayMixedValuesReferenceGraph } from './value_array/arrayMixedValuesReferenceGraph';
import { arrayReferenceReferenceGraph } from './value_array/arrayReferenceReferenceGraph';
import { arrayStaticValuesReferenceGraph } from './value_array/arrayStaticValuesReferenceGraph';

export const REFERENCE_GRAPHS: GraphEntry[] = [
  { id: 'earth3venus', name: 'Earth3 Venus', graph: earth3VenusGraph },
  { id: 'earth-venus', name: 'Earth Venus', graph: earthVenusGraph },
  { id: 'fractal-orbit-tree', name: 'Fractal Orbit Tree', graph: fractalOrbitTreeGraph },
  { id: 'lfo-planets', name: 'Lfo Planets', graph: lfoPlanetsGraph },
  { id: 'mona-lisa', name: 'Mona Lisa', graph: monaLisaGraph },
  { id: 'orbit-wave-line3', name: 'Orbit Wave Line3', graph: orbitWaveLineGraph3 },
  { id: 'pulsing-spirals', name: 'Pulsing Spirals', graph: pulsingSpiralsGraph },
  { id: 'single-orbit-lfo', name: 'Single Orbit Lfo', graph: singleOrbitLfoGraph },
  { id: 'three-orbits', name: 'Three Orbits', graph: threeOrbitsGraph },
  { id: 'two-orbit-curve', name: 'Two Orbit Curve', graph: twoOrbitCurveGraph },
  { id: 'waving-lines', name: 'Waving Lines', graph: wavingLinesGraph },
  { id: 'minimal-three-node', name: 'Minimal Three Node', graph: minimalThreeNodeGraph },
  { id: 'circle', name: 'Circle', graph: circleGraph },
  { id: 'connect-dots', name: 'Connect Dots', graph: connectDotsGraph },
  { id: 'connect-the-dots', name: 'Connect The Dots', graph: connectTheDotsGraph },
  { id: 'curve-modulator', name: 'Curve Modulator', graph: curveModulatorGraph },
  { id: 'lines-through-point', name: 'Lines Through Point', graph: linesThroughPointGraph },
  { id: 'orbit-center-points', name: 'Orbit Center Points', graph: orbitCenterPointsGraph },
  { id: 'polygon', name: 'Polygon', graph: polygonGraph },
  { id: 'timed-line-array', name: 'Timed Line Array', graph: timedLineArrayGraph },
  { id: 'timed-line', name: 'Timed Line', graph: timedLineGraph },
  { id: 'array-mixed-values', name: 'Array Mixed Values', graph: arrayMixedValuesReferenceGraph },
  { id: 'array-reference', name: 'Array Reference', graph: arrayReferenceReferenceGraph },
  { id: 'array-static-values', name: 'Array Static Values', graph: arrayStaticValuesReferenceGraph },
];
