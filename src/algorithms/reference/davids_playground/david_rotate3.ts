import { fColorPoint } from "../../../constants";
import { AlgorithmBuilder } from "../../../schema/builder";

export default new AlgorithmBuilder({
    title: "Davids rotate 3"
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
                            dx: 0.5,
                            dy: 0.5
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
                            dx: 0.5,
                            dy: 0.5
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

                            dx: 0.5,
                            dy: 0.5
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
                    v: fColorPoint({
                        r: 0.5, g: 0, b: 0
                    })
                }]
            }
        }
    })
    .addModuleNode({
        type: "orbit-module",
        id: "o2",
        params: {
            time: {
                ref: "time.time"
            },
            numPoints: {
                v: 20
            },
            "radius": {
                v: 0.5
            },
            centerPoints: {
                v: [{
                    v: fColorPoint({
                        r: 0.5, g: 0.5, b: 0.5
                    })
                }]
            }
        }
    }).addModuleNode({
        "type": "color-shift-module",
        id: "cs",
        params: {
            "inputPoints": {
                ref: "o2.points"
            },
            "targetPoints": {
                "ref": "og-shift-points.points"
            }
        }
    })

    .addModuleNode({
        "id": "reflect",
        "type": "reflect-module",
        "params": {
            "inputPoints": {
                ref: "o1.points"
            },
            "reflectionPoints": {
                ref: "cs.points"
            },
            "colorShiftOperation": {
                "v": "hue-shift"
            }
        }
    }).addModuleNode({
        "id": "render",
        type: "point-render-module",
        params: {

            "points": {
                ref: "reflect.points"
            }
        }
    }).addModuleNode({
        id: "shifted-ref",
        type: "point-render-module",
        "params": {
            points: {
                ref: "cs.points"
            }
        }
    })

    .construct()