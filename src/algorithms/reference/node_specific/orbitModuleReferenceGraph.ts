import type { GraphWithModules } from '../../../graphEngine/compiler/moduleExpander';

const graph: GraphWithModules = {
  version: '2.0',
  title: 'Orbit Module',
  modules: {
    nodes: [
      {
        id: 'venus',
        type: 'module',
        module: 'orbit',
        params: {
          time: { ref: 'time.time' },
          radius: { v: 0.4 },
          speed: { v: 1.2 },
        },
      },
    ],
  },
  control: { nodes: [] },
  compute: {
    nodes: [
      { id: 'time', type: 'time', params: {} },
    ],
  },
  render: { nodes: [] },
};

export default graph;
