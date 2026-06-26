import { fColorPoint } from '../../../constants';
import { AlgorithmBuilder } from '../../../schema/builder';

/**
 * Demonstrates curve-modulator-module modulating an orbital curve with wave-based displacement
 */
const graph = new AlgorithmBuilder({
  title: 'Curve Modulator Module - Orbit 2nd level',
  author: 'Claude Haiku 4.5',
  description: 'Wave-based displacement of an orbital curve',
})
  .addComputeNode({
    id: 'time',
    type: 'time',
    params: {},
  })
  .addModuleNode({
    id: 'orbit',
    type: 'orbit-module',
    params: {
      time: { ref: 'time.time' },
      speed: { v: 0.2 },
      radius: { v: 0.3 },
      numPoints: { v: 32 },
      centerPoints: { v: [{ v: fColorPoint() }] },
    },
  })
  .addModuleNode({
    id: 'modulator',
    type: 'curve-modulator-module',
    params: {
      curve: { ref: 'orbit.points' },

      cycleLengthMode: { v: 'linearOne' },
      modulationAngle: { v: 0.25 },
      fixedOffset: { v: 0.05 },
    },
  })
  .addModuleNode({
    id: 'm2',
    type: 'curve-modulator-module',
    params: {
      curve: {
        ref: "modulator.points",
      },
      cycleLengthMode: { v: 'linearOne' },
      modulationAngle: { v: 0.25 },
      fixedOffset: { v: 0.05 },
    },
  })
  .construct();

export default graph;
