import { fColorPoint } from "../../../constants";
import type { GeoArtGraph } from "../../../schema/_generated/schema-types";

const graph: GeoArtGraph = {
    version: '2.0',
    control: { nodes: [] },
    compute: {
        nodes: [{
            id: "time",
            type: "time",
            params: {}
        }
        ]
    },
    module: {
        nodes: [
            {
                id: 'orbit1',
                type: 'orbit-module',
                params: {
                    time: { ref: "time.time" },
                    radius: { v: 0.1 },
                    numPoints: { v: 1 },
                    centerPoints: { v: [{ v: fColorPoint() }] }
                }
            },
            {
                id: 'orbit2',
                type: 'orbit-module',
                params: {
                    time: { ref: "time.time" },
                    numPoints: { v: 1 },
                    centerPoints: { ref: 'orbit1.points' },  // refs another module's output
                }
            }
        ]
    },
    render: { nodes: [] }
};

export default graph;