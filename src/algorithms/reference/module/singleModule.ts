import { fColorPoint } from "../../../constants";
import type { GeoArtGraph } from "../../../schema/_generated/schema-types";

const graph: GeoArtGraph = {
    version: '2.0',
    control: {
        nodes: [
        ]
    },
    compute: {
        nodes: [
            {
                id: 'globalTime',
                type: 'time',
                params: {}
            },

        ]
    },
    module: {
        nodes: [
            {
                id: 'myOrbit',
                type: 'orbit-module',
                params: {
                    time: { ref: 'globalTime.time' },
                    centerPoints: { v: [{ v: fColorPoint() }] }
                }
            }
        ]
    },
    render: { nodes: [] }
};

export default graph;