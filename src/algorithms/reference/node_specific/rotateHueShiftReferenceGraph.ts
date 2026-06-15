import { fColorPoint } from '../../../constants';
import { AlgorithmBuilder } from '../../../schema/builder';

const graph = new AlgorithmBuilder({
  title: 'Rotate Hue Shift',
  author: 'Claude Sonnet 4.6',
  description:
    'Red orbit points rotated about a green center — angle-based hue shift produces a rainbow ring on the paint canvas',
})
  .addComputeNode({ id: 'time', type: 'time', params: {} })
  .addModuleNode({
    id: 'orbit',
    type: 'orbit-module',
    params: {
      time: { ref: 'time.time' },
      speed: { v: 0.1 },
      radius: { v: 0.45 },
      numPoints: { v: 8 },
      centerPoints: { v: [{ v: fColorPoint({ r: 1, g: 0, b: 0, a: 0.8 }) }] },
    },
  })
  .addModuleNode({
    id: 'rotate',
    type: 'rotate-module',
    params: {
      inputPoints: { ref: 'orbit.points' },
      rotationCenters: {
        v: [{ v: fColorPoint({ x: 0, y: 0, dx: 1, dy: 0, r: 0, g: 1, b: 0, a: 1 }) }],
      },
      rotationAmount: { v: 0 },
      colorShiftOperation: { v: 'hue-shift' },
    },
  })
  .addRenderNode({
    id: 'trail',
    type: 'circle',
    renderConfig: { layer: 'paint' },
    params: {
      centerPoints: { ref: 'rotate.points' },
      radius: { v: 0.015 },
      intervalTicks: { v: 3 },
    },
  })
  .construct();

export default graph;
