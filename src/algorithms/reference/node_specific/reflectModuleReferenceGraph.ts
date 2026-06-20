import { fColorPoint } from '../../../constants';
import { AlgorithmBuilder } from '../../../schema/builder';

const graph = new AlgorithmBuilder({
  title: 'Reflect Module Reference',
  author: 'Claude Sonnet 4.6',
  description: 'Orbiting point reflected about two axes — demonstrates reflect-module product cardinality',
})
  .addControlNode({
    id: 'linkRate',
    type: 'slider',
    params: {
      label: { v: 'Link Rate' },
      min: { v: 1 },
      max: { v: 60 },
      step: { v: 1 },
      value: { v: 5 },
    },
  })
  .addComputeNode({ id: 'time', type: 'time', params: {} })
  .addModuleNode({
    id: 'orbit',
    type: 'orbit-module',
    params: {
      time: { ref: 'time.time' },
      radius: { v: 0.4 },
      numPoints: { v: 1 },
      centerPoints: { v: [{ v: fColorPoint({ r: 0.3, g: 0.7, b: 1, a: 1 }) }] },
    },
  })
  .addModuleNode({
    id: 'reflect',
    type: 'reflect-module',
    params: {
      inputPoints: { ref: 'orbit.points' },
      reflectionPoints: {
        v: [
          // horizontal axis through origin: reflects across y = 0
          { v: fColorPoint({ dx: 1, dy: 0, r: 1, g: 0.4, b: 0.4, a: 1 }) },
          // vertical axis through origin: reflects across x = 0
          { v: fColorPoint({ dx: 0, dy: 1, r: 0.4, g: 1, b: 0.4, a: 1 }) },
        ],
      },
    },
  })
  .addRenderNode({
    id: 'outputDots',
    type: 'circle',
    renderConfig: { layer: 'paint' },
    params: {
      centerPoints: { ref: 'reflect.points' },
      radius: { v: 0.008 },
      intervalTicks: { ref: 'linkRate.value' },
    },
  })
  .construct();

export default graph;
