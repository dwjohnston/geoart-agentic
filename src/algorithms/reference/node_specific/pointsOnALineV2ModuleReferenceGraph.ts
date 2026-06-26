import { fColorPoint } from '../../../constants';
import { AlgorithmBuilder } from '../../../schema/builder';

const graph = new AlgorithmBuilder({
  title: 'Points on a Line V2 Module Reference',
  author: 'Claude Sonnet 4.6',
  description: 'Orbit points redistributed along the path using points-on-a-line-v2-module',
})
  .addComputeNode({ id: 'time', type: 'time', params: {} })
  .addModuleNode({
    id: 'orbit',
    type: 'orbit-module',
    params: {
      time: { ref: 'time.time' },
      radius: { v: 0.4 },
      numPoints: { v: 6 },
      centerPoints: { v: [{ v: fColorPoint({ r: 1, g: 0.5, b: 0, a: 1 }) }] },
    },
  })
  .addModuleNode({
    id: 'poal',
    type: 'points-on-a-line-v2-module',
    params: {
      colorPoints: { ref: 'orbit.points' },
      numPoints: { v: 20 },
      curveMode: { v: 'straight' },
    },
  })
  .construct();

export default graph;
