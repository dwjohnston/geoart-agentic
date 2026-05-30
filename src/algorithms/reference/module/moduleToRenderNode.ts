import { fColorPoint } from "../../../constants";
import type { GeoArtGraph } from "../../../schema/_generated/schema-types";

const graph: GeoArtGraph = {
    version: '2.0',
    control: { nodes: [] },
    compute: {
        nodes: [],

    },
    module: {
        nodes: [
            {
                id: 'myOrbit',
                type: 'orbit-module',
                params: {
                    time: { v: 0 },
                    radius: { v: 0.2 },
                    numPoints: { v: 5 },
                    centerPoints: { v: [{ v: fColorPoint() }] }
                }
            }
        ]
    },
    render: {
        nodes: [
            {
                id: 'display',
                type: "polygon",
                renderConfig: {
                    layer: "live"
                },
                params: {
                    points: { ref: 'myOrbit.points' }  // refs module output
                }
            }
        ]

    }
};

export default graph;