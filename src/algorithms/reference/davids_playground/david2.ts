import { AlgorithmBuilder } from "../../../schema/builder";


export default new AlgorithmBuilder({
    'author': "David",
    "description": "hello",
    "title": "david 1"
}).addComputeNode({
    id: "time",
    type: "time",
    params: {}
}).addComputeNode({
    id: 'rainbowPoints',
    type: 'colorPointArrayCompute',
    params: {
        points: {
            v: [
                // Red
                { v: { x: 0, y: -0.8, r: 1, g: 0, b: 0, a: 1, dx: 1, dy: 0 } },
                // Orange
                { v: { x: 0.6254, y: -0.4988, r: 1, g: 0.5, b: 0, a: 1, dx: 1, dy: 0 } },
                // Yellow
                { v: { x: 0.7799, y: 0.178, r: 1, g: 1, b: 0, a: 1, dx: 1, dy: 0 } },
                // Green
                { v: { x: 0.3326, y: 0.7277, r: 0, g: 1, b: 0, a: 1, dx: 1, dy: 0 } },
                // Blue
                { v: { x: -0.3326, y: 0.7277, r: 0, g: 0, b: 1, a: 1, dx: 1, dy: 0 } },
                // Indigo
                { v: { x: -0.7799, y: 0.178, r: 0.29, g: 0, b: 0.51, a: 1, dx: 1, dy: 0 } },
                // Violet
                { v: { x: -0.6254, y: -0.4988, r: 0.56, g: 0, b: 1, a: 1, dx: 1, dy: 0 } },
            ],
        },
    },
},)

    .addModuleNode({
        "type": "orbit-module",
        "id": "o1",
        "params": {
            time: { ref: "time.time" },
            numPoints: { v: 20 },
            centerPoints: {
                v: [{
                    v: {
                        dx: 0,
                        dy: 0,
                        x: 0,
                        y: 0,
                        r: 0.5,
                        g: 0.5,
                        b: 0.5,
                        a: 0.5
                    }
                }]
            }
        }
    })
    .addComputeNode({
        id: "color-shift",
        type: "colorShift",
        params: {
            "inputPoints": {
                ref: "o1.points"
            },
            "targetPoints": {
                ref: "rainbowPoints.points"
            },
            "strength": {
                v: 1
            },
            "falloff": {
                v: 2
            }
        }
    }).addModuleNode({
        "id": "color-shift-points-a",
        "type": "point-render-module",
        params: {
            "points": {
                ref: "color-shift.points"
            },

        }
    }).addModuleNode({
        "id": "arms",
        "type": "curve-modulator-module",
        "params": {
            curve: {
                ref: "color-shift.points"
            },

        }
    }).addModuleNode({
        "id": "arms2",
        "type": "curve-modulator-module",
        "params": {
            curve: {
                ref: "arms.points"
            },
            fixedOffset: {
                v: 0.2
            }
        }
    }).addModuleNode({
        id: "linker",
        type: "linker-module",
        params: {
            "pointsFrom": {
                ref: "arms.points"
            },
            pointsTo: {
                ref: "arms2.points"
            }
        }
    })



    .construct()