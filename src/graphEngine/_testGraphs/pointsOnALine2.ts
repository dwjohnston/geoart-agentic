import type { GeoArtGraph } from '../../schema/_generated/schema-types';


export const pointsOnALineTestGraph: GeoArtGraph = {
    version: '1.0',
    control: {
        nodes: [],
    },
    compute: {
        nodes: [
            { id: 'time', type: 'time', params: {} },
            // --- Four orbits, one per quadrant ---
            {
                id: 'tlOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    center: { v: { x: -0.5, y: 0.5 } },
                },
            },
            {
                id: 'trOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    center: { v: { x: 0.5, y: 0.5 } },
                },
            },
            {
                id: 'blOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    center: { v: { x: -0.5, y: -0.5 } },
                },
            },
            {
                id: 'brOrbit',
                type: 'orbit',
                params: {
                    time: { ref: 'time.time' },
                    center: { v: { x: 0.5, y: -0.5 } },
                },
            },
            // --- Pack orbit positions with colours ---
            {
                id: 'cpTopLeft',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'tlOrbit.point' },
                },
            },
            {
                id: 'cpTopRight',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'trOrbit.point' },
                },
            },
            {
                id: 'cpBottomLeft',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'blOrbit.point' },
                },
            },
            {
                id: 'cpBottomRight',
                type: 'colorPointCompute',
                params: {
                    point: { ref: 'brOrbit.point' },
                },
            },
            // --- Rows of evenly-spaced points ---
            {
                id: 'topLine',
                type: 'pointsOnALine',
                params: {
                    pointA: { ref: 'cpTopLeft.colorPoint' },
                    pointB: { ref: 'cpTopRight.colorPoint' },
                },
            },
            {
                id: 'bottomLine',
                type: 'pointsOnALine',
                params: {
                    pointA: { ref: 'cpBottomLeft.colorPoint' },
                    pointB: { ref: 'cpBottomRight.colorPoint' },
                },
            },
        ],
    },
    render: {
        nodes: [
            // --- Waving curtain of lines ---
            {
                id: 'curtain',
                type: 'timedLineArray',
                renderConfig: { layer: 'paint' },
                params: {
                    intervalTicks: { v: 30 },
                    colorPointsA: { ref: 'topLine.points' },
                    colorPointsB: { ref: 'bottomLine.points' },
                },
            },
            {
                id: 'lineDrawTop',
                type: 'timedLine',
                renderConfig: { layer: 'live' },
                params: {
                    intervalTicks: { v: 30 },
                    colorPointA: { ref: 'cpTopLeft.colorPoint' },
                    colorPointB: { ref: 'cpTopRight.colorPoint' },
                },
            },
            {
                id: 'lineDrawBottom',
                type: 'timedLine',
                renderConfig: { layer: 'live' },
                params: {
                    intervalTicks: { v: 30 },
                    colorPointA: { ref: 'cpBottomLeft.colorPoint' },
                    colorPointB: { ref: 'cpBottomRight.colorPoint' },
                },
            },
            // --- Live orbit indicators ---
            {
                id: 'dotTL',
                type: 'circle',
                renderConfig: { layer: 'live' },
                params: {
                    center: { ref: 'tlOrbit.point' },
                    radius: { v: 0.015 },
                },
            },
            {
                id: 'dotTR',
                type: 'circle',
                renderConfig: { layer: 'live' },
                params: {
                    center: { ref: 'trOrbit.point' },
                    radius: { v: 0.015 },
                },
            },
            {
                id: 'dotBL',
                type: 'circle',
                renderConfig: { layer: 'live' },
                params: {
                    center: { ref: 'blOrbit.point' },
                    radius: { v: 0.015 },
                },
            },
            {
                id: 'dotBR',
                type: 'circle',
                renderConfig: { layer: 'live' },
                params: {
                    center: { ref: 'brOrbit.point' },
                    radius: { v: 0.015 },
                },
            },
        ],
    },
};
