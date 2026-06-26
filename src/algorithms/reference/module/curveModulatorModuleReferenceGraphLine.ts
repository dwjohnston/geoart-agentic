import { fColorPoint } from '../../../constants';
import { AlgorithmBuilder } from '../../../schema/builder';

/**
 * Demonstrates curve-modulator-module modulating an orbital curve with wave-based displacement
 */
const graph = new AlgorithmBuilder({
  title: 'Curve Modulator Module - Line',
  author: 'Claude Haiku 4.5',
  description: 'Wave-based displacement of an orbital curve',
})
  .addControlNode({
    id: "width",
    type: "slider",
    params: {
      min: { v: -1 },
      max: { v: 1 },
      value: { v: 1 },
      label: { v: "x" }
    }
  }).addComputeNode({
    id: "position",
    type: "colorPointCompute",
    params: {
      x: {
        ref: "width.value"
      },
      y: {
        v: 0
      }
    }
  })
  .addComputeNode({
    id: 'time',
    type: 'time',
    params: {},
  })
  .addComputeNode({
    id: 'line',
    type: 'pointsOnALine',
    params: {
      pointA: {
        v: fColorPoint({
          x: -1, y: 0
        })
      },
      numberOfPoints: {
        v: 10
      },
      pointB: {
        ref: "position.colorPoint"
      }
    },
  })
  .addModuleNode({
    id: 'modulator',
    type: 'curve-modulator-module',
    params: {
      curve: { ref: 'line.points' },
      cycleLengthMode: { v: 'linearOne' },
      modulationAngle: { v: 0.25 },
      fixedOffset: { v: 0.05 },
    },
  })
  .construct();

export default graph;
