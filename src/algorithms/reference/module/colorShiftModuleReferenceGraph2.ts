import { fColorPoint } from '../../../constants';
import { AlgorithmBuilder } from '../../../schema/builder';

const graph = new AlgorithmBuilder({
  title: 'Colour Shift Module Reference 2',
  author: 'claude-sonnet-4-6',
  description: 'Orbital points with colour shifted toward three static target points',
})
  .addComputeNode({ id: 'time', type: 'time', params: {} })
  .addModuleNode({
    id: 'inputOrbit',
    type: 'orbit-module',
    params: {
      time: { ref: 'time.time' },
      speed: { v: 0.15 },
      radius: { v: 1 },
      numPoints: { v: 24 },
      eccentricity: { v: 0.9 },
      centerPoints: { v: [{ v: fColorPoint({ r: 0.5, g: 0.5, b: 0.5, a: 1 }) }] },
    },
  })
  .addModuleNode({
    id: 'colorShift',
    type: 'color-shift-module',
    params: {
      inputPoints: { ref: 'inputOrbit.points' },
      targetPoints: {
        v: [
          { v: fColorPoint({ x: 0, y: 0, r: 1, g: 0.1, b: 0.1, a: 1, dx: 1, dy: 0 }) },
        ],
      },
      "mode": {
        v: "proximity-with-direction"
      },
      falloff: { v: 3 },
      strength: { v: 1 },
    },
  })
  .addModuleNode({
    id: 'output',
    type: 'point-render-module',
    params: {
      points: { ref: 'colorShift.points' },
    },
  })
  .construct();

export default graph;
