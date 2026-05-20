import type { GraphWithModules } from '../../../graphEngine/compiler/moduleExpander';

// Demonstrates: an orbit module using another orbit module's output as its centerPoints.
// The outer orbit's center tracks the inner orbit's current position (epicycle).
const graph: GraphWithModules = {
  version: '2.0',
  title: 'Orbit Module — Chained Modules',
  modules: {
    nodes: [
      {
        id: 'inner',
        type: 'module',
        module: 'orbit',
        params: {
          time: { ref: 'time.time' },
          radius: { v: 0.25 },
          speed: { v: 1.0 },
        },
      },
      {
        id: 'outer',
        type: 'module',
        module: 'orbit',
        params: {
          time: { ref: 'time.time' },
          radius: { v: 0.1 },
          speed: { v: 3.0 },
          centerPoints: { ref: 'inner.points' },
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
