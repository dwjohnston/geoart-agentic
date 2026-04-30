import { defineComputeNode } from '../types';
import { pointsOnALine } from './pointsOnALine';

export const pointsOnALineNodeDef = defineComputeNode("pointsOnALine", {
  isTimeDependant: false,
  defaults: {
    "pointA": {
      "v": {
        "color": {
          r: 1,
          g: 1,
          b: 1,
          a: 1
        },
        point: {
          x: 1,
          y: 1,
        },
        "valueType": "colorPoint" as const
      } as const
    },
    "pointB": {
      "v": {
        "color": {
          r: 1,
          g: 1,
          b: 1,
          a: 1
        },
        point: {
          x: 1,
          y: 1,
        },
        "valueType": "colorPoint" as const
      } as const
    },
    "numberOfPoints": {
      "v": 1
    }
  },
  evaluate: (inputs) => {
    const pointA = inputs.pointA.v;
    const pointB = inputs.pointB.v;
    const numberOfPoints = inputs.numberOfPoints.v;


    const points = pointsOnALine({
      ...pointA.color,
      ...pointA.point
    }, {
      ...pointB.color,
      ...pointB.point
    }, numberOfPoints)
    return {

      points: points.map((v) => {
        return {
          color: {
            r: v.r,
            g: v.g,
            b: v.b,
            a: v.a
          },
          point: {
            x: v.x,
            y: v.y
          },
          valueType: "colorPoint" as const,
        }
      })
    }

  },
});
