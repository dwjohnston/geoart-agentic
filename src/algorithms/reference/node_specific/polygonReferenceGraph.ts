import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

const graph: GeoArtGraph = {
    version: '2.0',
    title: 'Polygon',
    control: {
        nodes: [],
    },
    compute: {
        nodes: [
            {
                id: 'time',
                type: 'time',
                params: {},
            },
            {
                id: 'orbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    radius: { v: 0.3 },
                    speed: { v: 0.5 },
                    numPoints: { v: 5 },
                    phase: { v: 0 },
                },
            },

        ],
    },
    render: {
        nodes: [
            {
                id: 'polygon',
                type: 'polygon',
                renderConfig: {
                    layer: 'live',
                },
                params: {
                    points: { ref: 'orbit.points' },
                },
            },
        ],
    },
};

export default graph;
