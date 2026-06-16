import { fColorPoint } from "../../../constants";
import { AlgorithmBuilder } from "../../../schema/builder";

export default new AlgorithmBuilder({
    title: "Davids rotate 2"
})
    .addComputeNode({
        type: "time",
        id: "time",
        params: {}
    }).addComputeNode({
        type: "colorPointArrayCompute",
        id: "og-shift-points",
        params: {
            "points": {
                v: [
                    {
                        v: fColorPoint({
                            x: 0,
                            y: -0.25,
                            r: 1.0,
                            a: 1,
                            g: 0.176,
                            b: 0.471,
                        })
                    },
                    {
                        v: fColorPoint({
                            x: 0.217,
                            y: 0.125,
                            r: 0.176,
                            a: 1,

                            g: 0.886,
                            b: 0.902,
                        })
                    },
                    {
                        v: fColorPoint({
                            x: -0.217,
                            y: 0.125,
                            r: 0.224,
                            a: 1,

                            g: 1.0,
                            b: 0.078,
                        })
                    }
                ]
            }
        }
    })
    .addModuleNode({
        type: "orbit-module",
        id: "o1",
        params: {
            time: {
                ref: "time.time"
            },
            numPoints: {
                v: 20
            },
            "radius": {
                v: 0.3
            },
            centerPoints: {
                v: [{
                    v: fColorPoint()
                }]
            }
        }
    }).addModuleNode({
        "type": "color-shift-module",
        "id": 'o1-shifted',
        params: {
            "inputPoints": {
                ref: "o1.points",

            },
            "targetPoints": {
                "ref": "og-shift-points.points"
            }
        }
    }).
    addModuleNode({
        type: "orbit-module",
        id: "o2",
        params: {
            time: {
                ref: "time.time"
            },
            numPoints: {
                v: 10
            },
            "radius": {
                v: 0.25
            },
            centerPoints: {
                v: [{
                    v: fColorPoint()
                }]
            }
        }
    }).addModuleNode({
        "type": "color-shift-module",
        "id": 'o2-shifted',
        params: {
            "inputPoints": {
                ref: "o2.points",

            },
            "targetPoints": {
                "ref": "og-shift-points.points"
            }
        }
    }).addModuleNode({
        type: "wave-module",
        id: "wave",
        params: {
            "frequency": {
                v: 0.1
            }
        }
    })
    .addModuleNode({
        type: "rotate-module",
        id: "rotate",
        params: {
            inputPoints: {
                ref: 'o1-shifted.points',

            },
            rotationCenters: {
                ref: "o2-shifted.points"
            },
            rotationAmount: {
                ref: "wave.value"
            }
        }
    }).addModuleNode({
        type: "point-render-module",
        id: "render-point",
        params: {
            "points": {
                ref: "rotate.points"
            }
        }
    }).construct()