import type { GraphWithModules } from '../../../graphEngine/compiler/moduleExpander';

// Demonstrates: orbit module receiving a ref from a compute node (wave-modulated speed).
const graph: GraphWithModules = {
  version: '2.0',
  title: 'Orbit Module — Compute Node Input',
  modules: {
    nodes: [
      {
        id: 'venus',
        type: 'module',
        module: 'orbit',
        params: {
          time: { ref: 'time.time' },
          radius: { v: 0.35 },
          speed: { ref: 'speedWave.value' },
        },
      },
    ],
  },
  control: { nodes: [] },
  compute: {
    nodes: [
      { id: 'time', type: 'time', params: {} },
      {
        id: 'speedWave',
        type: 'wave',
        params: {
          time: { ref: 'time.time' },
          frequency: { v: 0.2 },
          amplitude: { v: 1.5 },
        },
      },
    ],
  },
  render: { nodes: [] },
};

export default graph;
