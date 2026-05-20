import type { GraphWithModules } from '../../../graphEngine/compiler/moduleExpander';

// Demonstrates: orbit module receiving refs from explicitly declared control nodes.
const graph: GraphWithModules = {
  version: '2.0',
  title: 'Orbit Module — Control Node Input',
  modules: {
    nodes: [
      {
        id: 'venus',
        type: 'module',
        module: 'orbit',
        params: {
          time: { ref: 'time.time' },
          radius: { ref: 'radiusSlider.value' },
          speed: { ref: 'speedSlider.value' },
        },
      },
    ],
  },
  control: {
    nodes: [
      {
        id: 'radiusSlider',
        type: 'slider',
        params: {
          label: { v: 'Radius' },
          min: { v: 0 },
          max: { v: 0.5 },
          value: { v: 0.3 },
          step: { v: 0.01 },
        },
      },
      {
        id: 'speedSlider',
        type: 'slider',
        params: {
          label: { v: 'Speed' },
          min: { v: -3 },
          max: { v: 3 },
          value: { v: 1 },
          step: { v: 0.1 },
        },
      },
    ],
  },
  compute: {
    nodes: [
      { id: 'time', type: 'time', params: {} },
    ],
  },
  render: { nodes: [] },
};

export default graph;
