import { fColorPoint } from "../../../constants";
import type { GeoArtGraph } from "../../../schema/_generated/schema-types";

/**
 * Demonstrates point-render-module rendering circles and crosshairs for orbital points
 */
const graph: GeoArtGraph = {
  version: '2.0',
  control: { nodes: [] },
  compute: {
    nodes: [
      {
        id: "time",
        type: "time",
        params: {}
      },
    ]
  },
  module: {
    nodes: [

      {
        id: 'orbit',
        type: 'orbit-module',
        params: {
          time: { ref: "time.time" },
          speed: { v: 0.3 },
          radius: { v: 0.4 },
          numPoints: { v: 8 },
          centerPoints: { v: [{ v: fColorPoint() }] }
        }
      },
      {
        id: 'pointDisplay',
        type: 'point-render-module',
        params: {
          points: { ref: 'orbit.points' }
        }
      }
    ]
  },
  render: { nodes: [] }
};

export default graph;
