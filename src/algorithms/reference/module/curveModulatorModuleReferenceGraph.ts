import { fColorPoint } from '../../../constants';
import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

/**
 * Demonstrates curve-modulator-module modulating an orbital curve with wave-based displacement
 */
const graph: GeoArtGraph = {
  version: '2.0',
  control: {
    nodes: [
      {
        id: 'modulationAngleSlider',
        type: 'slider',
        params: {
          label: { v: 'Modulation angle' },
          min: { v: 0 },
          max: { v: 1 },
          step: { v: 0.01 },
          value: { v: 0.25 },
        },
      },
      {
        id: 'fixedOffsetSlider',
        type: 'slider',
        params: {
          label: { v: 'Fixed offset' },
          min: { v: 0 },
          max: { v: 0.2 },
          step: { v: 0.01 },
          value: { v: 0.05 },
        },
      },
    ],
  },
  compute: {
    nodes: [
      {
        id: 'time',
        type: 'time',
        params: {},
      },
    ],
  },
  module: {
    nodes: [
      {
        id: 'orbit',
        type: 'orbit-module',
        params: {
          time: { ref: 'time.time' },
          speed: { v: 0.2 },
          radius: { v: 0.3 },
          numPoints: { v: 32 },
          centerPoints: { v: [{ v: fColorPoint() }] },
        },
      },
      {
        id: 'modulator',
        type: 'curve-modulator-module',
        params: {
          curve: { ref: 'orbit.points' },
          cycleLengthMode: { v: 'linearOne' },
          modulationAngle: { ref: 'modulationAngleSlider.value' },
          fixedOffset: { ref: 'fixedOffsetSlider.value' },
        },
      },
    ],
  },
  render: {
    nodes: [],
  },
};

export default graph;
