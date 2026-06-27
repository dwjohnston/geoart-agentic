import { fColorPoint } from '../../../constants';
import { AlgorithmBuilder } from '../../../schema/builder';

const graph = new AlgorithmBuilder({
  title: 'Points on a Line V2 Module Reference 2',
  author: 'David',
  description: 'Triangle points on a line',
})
  .addComputeNode({ id: 'time', type: 'time', params: {} })
  .addComputeNode({
    type: "colorPointArrayCompute",
    id: "triangle",
    params: {
      "points": {
        v: [
          { "v": fColorPoint({ x: 0, y: -0.5, r: 1, g: 0, b: 0, a: 1 }) },
          { "v": fColorPoint({ x: 1, y: 0.8, r: 0, g: 1, b: 0, a: 1 }) },
          { "v": fColorPoint({ x: -1, y: 0.8, r: 0, g: 0, b: 1, a: 1 }) },
          { "v": fColorPoint({ x: 0, y: -0.5, r: 1, g: 0, b: 0, a: 1 }) },

        ]
      }
    }
  })
  .addModuleNode({
    type: "wave-module",
    id: "wave1",
    params: {}
  })
  .addModuleNode({
    id: 'poal',
    type: 'points-on-a-line-v2-module',
    params: {
      colorPoints: { ref: 'triangle.points' },
      numPoints: { v: 30 },
      curveMode: { v: 'straight' },
    },
  })
  .addModuleNode({
    type: "curve-modulator-module",
    id: "poal-mod",
    params: {
      "curve": {
        ref: "poal.points"
      }
    }
  })
  .addModuleNode({
    type: "orbit-module",
    id: "o",
    params: {
      time: {
        ref: "time.time"
      },

      centerPoints: {
        v: [
          { v: fColorPoint() }
        ]
      },
      numPoints: {
        v: 8
      },
      radius: {
        v: 0.2
      }
    }
  }).addModuleNode({
    type: "reflect-module",
    id: "reflect",
    params: {
      inputPoints: {
        ref: "o.points"

      },
      reflectionPoints: {
        ref: "poal-mod.points"
      }
    }
  }).addModuleNode({
    id: "draw",
    type: "point-render-module",
    params: {
      points: {
        ref: "reflect.points"
      }
    }
  })

  .construct();

export default graph;
