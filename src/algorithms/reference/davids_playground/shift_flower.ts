import { fColorPoint } from "../../../constants";
import { AlgorithmBuilder } from "../../../schema/builder";

export default new AlgorithmBuilder({
    "author": "David",
    title: "Shift Flower",
    description: "Playing with that mandela flower thing + colorshift"
}).addComputeNode({
    id: "shift-point",
    "type": "colorPointArrayCompute",
    params: {
        "points": {
            v: [
                { v: fColorPoint({ r: 0, g: 0, b: 0, a: 0, x: 0, y: 0, dx: 1, dy: 0 }) },
                { v: fColorPoint({ r: 1, g: 0.41, b: 0.71, a: 1, x: 0, y: -1, dx: 0, dy: 1 }) },
                { v: fColorPoint({ r: 0.4, g: 0.2, b: 0.9, a: 1, x: -1, y: 0.2, dx: 1, dy: -0.2 }) },
                { v: fColorPoint({ r: 1, g: 0.5, b: 0, a: 1, x: 1, y: 0.2, dx: -1, dy: -0.2 }) },


            ]
        }
    }
}).addComputeNode({
    id: "time",
    type: "time",
    params: {}
}).addModuleNode({
    id: "o1",
    type: "orbit-module",
    params: {
        time: {
            ref: "time.time"
        },
        speed: {
            v: 0.3
        },
        centerPoints: {
            v: [
                { v: fColorPoint() }
            ]
        }
    }
}).addModuleNode({
    id: "o2",
    type: "orbit-module",
    params: {
        time: {
            ref: "time.time",

        },
        speed: {
            v: 1
        },
        centerPoints: {
            ref: "o1.points"
        }
    }
}).addModuleNode({
    "id": "shift1",
    "type": "color-shift-module",
    params: {
        "inputPoints": {
            ref: "o1.points"
        },
        falloff: {
            v: 3,
        },
        targetPoints: {
            ref: "shift-point.points"
        }
    }
}).addModuleNode({
    "id": "shift2",
    "type": "color-shift-module",
    params: {
        "inputPoints": {
            ref: "o2.points"
        },
        falloff: {
            v: 3,
        },
        targetPoints: {
            ref: "shift-point.points"
        }
    }
}).addRenderNode({
    "id": "r1",
    "type": "circle",
    "params": {
        radius: {
            v: 0.01
        },

        "centerPoints": {
            ref: "shift1.points"
        }
    },
    "renderConfig": {
        "layer": "paint"
    }
}).addRenderNode({
    "id": "r2",
    "type": "circle",
    "params": {
        radius: {
            v: 0.01
        },
        "centerPoints": {

            ref: "shift2.points"
        }
    },
    "renderConfig": {
        "layer": "paint"
    }
}).addModuleNode({
    id: "linker",
    type: "linker-module",
    params: {
        "pointsFrom": {
            ref: "shift1.points"
        },
        pointsTo: {
            ref: "shift2.points"
        }
    }
})
    .construct();