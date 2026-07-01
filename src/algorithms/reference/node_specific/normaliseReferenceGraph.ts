import type { GeoArtGraph } from '../../../schema/_generated/schema-types';
import { fColorPoint } from '../../../constants';

const graph: GeoArtGraph = {
  version: '2.0',
  title: 'Normalise',
  control: {
    nodes: [
      {
        id: 'sizeControl',
        type: 'slider',
        params: {
          label: { v: 'Size' },
          min: { v: 0 },
          max: { v: 1 },
          value: { v: 0.3 },
          step: { v: 0.05 },
        },
      },
      {
        id: 'strengthControl',
        type: 'slider',
        params: {
          label: { v: 'Strength' },
          min: { v: 0 },
          max: { v: 1 },
          value: { v: 1 },
          step: { v: 0.05 },
        },
      },
    ],
  },
  compute: {
    nodes: [
      {
        id: 'orbit',
        type: 'orbit',
        params: {
          time: { ref: 'time.time' },
          numPoints: { v: 3 },
          radius: { v: 0.4 },
          speed: { v: 0 },
          center: { v: { x: 0, y: 0 } },
        },
      },
      {
        id: 'normalise',
        type: 'normalise',
        params: {
          inputPoints: { ref: 'orbit.points' },
          normalisationCenters: {
            v: [
              { v: fColorPoint({ x: 0, y: 0 }) },
            ],
          },
          normalisationOrigin: {
            v: [
              { v: fColorPoint({ x: 0, y: 0.25 }) },
              { v: fColorPoint({ x: -0.25, y: 0 }) },
              { v: fColorPoint({ x: 0.25, y: 0 }) },
            ],
          },
          normalisationSize: { ref: 'sizeControl.value' },
          strength: { ref: 'strengthControl.value' },
        },
      },
    ],
  },
  render: {
    nodes: [
      {
        id: 'outputCircles',
        type: 'circle',
        renderConfig: { layer: 'live' },
        params: {
          centerPoints: { ref: 'normalise.points' },
          radius: { v: 0.03 },
        },
      },
    ],
  },
};

export default graph;
