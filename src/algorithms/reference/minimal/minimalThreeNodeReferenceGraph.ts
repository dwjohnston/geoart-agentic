import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

const graph: GeoArtGraph = {
    version: '2.0',
    title: 'Minimal Three Node',
    control: {
        nodes: [
            {
                id: 'radius',
                type: 'slider',
                params: {
                    label: { v: 'Radius' },
                    min: { v: 0 },
                    max: { v: 0.5 },
                    step: { v: 0.01 },
                    value: { v: 0.1 },
                },
            },
        ],
    },
    compute: {
        nodes: [
            {
                id: 'time',
                type: 'time',
                params: {},
            },
            {
                id: 'earthOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    radius: { ref: 'radius.value' },
                    speed: { v: 1 },
                },
            },
        ],
    },
    render: {
        nodes: [
            {
                id: 'circle',
                type: 'circle',
                renderConfig: {
                    "layer": "live"
                },
                params: {
                    radius: { v: 0.25 },
                    centerPoints: { ref: "earthOrbit.points" }

                },
            },
        ],
    },
};

export default graph;
