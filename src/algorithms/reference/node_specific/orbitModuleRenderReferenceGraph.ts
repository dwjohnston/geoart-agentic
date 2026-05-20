import type { GraphWithModules } from '../../../graphEngine/compiler/moduleExpander';

// Demonstrates: render nodes explicitly referencing an orbit module's output port.
const graph: GraphWithModules = {
  version: '2.0',
  title: 'Orbit Module — Render Ref',
  modules: {
    nodes: [
      {
        id: 'venus',
        type: 'module',
        module: 'orbit',
        params: {
          time: { ref: 'time.time' },
          radius: { v: 0.35 },
          speed: { v: 1.0 },
          numPoints: { v: 3 },
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
  render: {
    nodes: [
      {
        id: 'trail',
        type: 'connect-dots',
        renderConfig: { layer: 'paint' },
        params: {
          colorPointsArray: { ref: 'venus.points' },
          lineWidth: { v: 1 },
        },
      },
    ],
  },
};

export default graph;
