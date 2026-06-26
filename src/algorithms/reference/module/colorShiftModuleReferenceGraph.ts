import { fColorPoint } from '../../../constants';
import { AlgorithmBuilder } from '../../../schema/builder';

const graph = new AlgorithmBuilder({
  title: 'Colour Shift Module Reference',
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
      radius: { v: 0.4 },
      numPoints: { v: 24 },
      centerPoints: { v: [{ v: fColorPoint({ r: 0.8, g: 0.8, b: 0.8, a: 1 }) }] },
    },
  })
  .addModuleNode({
    id: 'colorShift',
    type: 'color-shift-module',
    params: {
      inputPoints: { ref: 'inputOrbit.points' },
      targetPoints: {
        v: [
          { v: fColorPoint({ x: 0, y: 0.3, r: 1, g: 0.1, b: 0.1, a: 1 }) },
          { v: fColorPoint({ x: 0.3, y: -0.2, r: 0.1, g: 1, b: 0.1, a: 1 }) },
          { v: fColorPoint({ x: -0.3, y: -0.2, r: 0.1, g: 0.1, b: 1, a: 1 }) },
        ],
      },
      falloff: { v: 0.3 },
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
