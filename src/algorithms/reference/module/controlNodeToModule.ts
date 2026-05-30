import { fColorPoint } from "../../../constants";
import type { GeoArtGraph } from "../../../schema/_generated/schema-types";

const graph: GeoArtGraph = {
    version: '2.0',
    control: {
        nodes: [
            {
                id: 'radiusSlider',
                type: 'slider',
                params: {
                    min: { v: 0, },
                    max: { v: 0.01 },
                    label: { v: "Radius" },
                    value: { v: 0.1 },
                }
            }
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
                    radius: { ref: "radiusSlider.value" },
                    numPoints: { v: 8 },
                    centerPoints: { v: [{ v: fColorPoint() }] }
                }
            }
        ]
    },
    render: { nodes: [] }
};

export default graph;