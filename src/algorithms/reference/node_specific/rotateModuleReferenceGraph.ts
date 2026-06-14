import { fColorPoint } from '../../../constants';
import { AlgorithmBuilder } from '../../../schema/builder';

const graph = new AlgorithmBuilder({
  title: 'Rotate Module Reference',
  author: 'Claude Sonnet 4.6',
  description: 'Orbiting points rotated about a fixed center — demonstrates rotate-module product cardinality',
})
  .addComputeNode({ id: 'time', type: 'time', params: {} })
  .addModuleNode({
    id: 'orbit',
    type: 'orbit-module',
    params: {
      time: { ref: 'time.time' },
      radius: { v: 0.4 },
      numPoints: { v: 6 },
      centerPoints: { v: [{ v: fColorPoint({ r: 0.3, g: 0.7, b: 1, a: 1 }) }] },
    },
  })
  .addModuleNode({
    id: 'wave',
    type: 'wave-module',
    params: {
      amplitude: { v: 0.5 },
      frequency: { v: 0.5 },
    },
  })
  .addModuleNode({
    id: 'rotate',
    type: 'rotate-module',
    params: {
      inputPoints: { ref: 'orbit.points' },
      rotationCenters: {
        v: [{ v: { x: 0.25, y: 0.25, dx: 0, dy: 0, r: 1, g: 1, b: 1, a: 1 } }],
      },
      rotationAmount: { ref: 'wave.value' },
    },
  })
  .addRenderNode({
    id: 'outputDots',
    type: 'circle',
    renderConfig: { layer: 'live' },
    params: {
      centerPoints: { ref: 'rotate.points' },
      radius: { v: 0.015 },
      intervalTicks: { v: 0 },
    },
  })
  .construct();

export default graph;
