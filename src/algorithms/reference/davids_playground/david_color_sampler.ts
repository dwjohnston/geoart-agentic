import { fColorPoint } from "../../../constants";
import { AlgorithmBuilder } from "../../../schema/builder";

export default new AlgorithmBuilder({ title: "David Color Sampler" })
    .addComputeNode({
        id: "time",
        type: "time",
        params: {}
    })
    .addModuleNode({
        "id": "w1",
        type: "wave-module",
        params: {}
    })
    .addModuleNode({
        "id": "w2",
        type: "wave-module",
        params: {}
    })
    .addModuleNode({
        "id": "w3",
        type: "wave-module",
        params: {}
    })
    .addModuleNode({
        "id": "w4",
        type: "wave-module",
        params: {}
    })
    .addComputeNode({
        id: "cs",
        "type": "colorSampler",
        params: {
            sampleR: {
                ref: "w1.sampler",
            },
            sampleB: {
                ref: "w2.sampler",
            },
            sampleG: {
                ref: "w3.sampler",
            },
            sampleA: {
                ref: "w4.sampler",
            }
        }
    }).addModuleNode({
        id: "o1",
        type: "orbit-module",
        params: {
            "colorSampler": {
                ref: "cs.colorSampler"
            },

            numPoints: {
                v: 20
            },

            "time": {
                ref: "time.time"
            },
            centerPoints: {
                v: [
                    {
                        v: fColorPoint()
                    }
                ]
            },
            radius: {
                v: 0.5
            }
        }
    }).addModuleNode({
        id: "o1-shift",
        "type": "curve-modulator-module",
        params: {


            "curve": {
                ref: "o1.points"
            },

        }
    })
    .addModuleNode({
        id: "o1-shift-2",
        "type": "curve-modulator-module",
        params: {
            "curve": {
                ref: "o1-shift.points"
            },

        }
    })
    .addModuleNode({
        id: "o2",
        type: "orbit-module",
        params: {
            "time": {
                ref: "time.time"
            },
            centerPoints: {
                v: [
                    {
                        v: fColorPoint()
                    }
                ]
            },

            radius: {
                v: 0.2
            }
        }
    }).addModuleNode({
        id: "o2-shift",
        "type": "curve-modulator-module",
        params: {
            "curve": {
                ref: "o2.points"
            },

        }
    }).addModuleNode({
        id: "reflect",
        type: "reflect-module",
        params: {
            inputPoints: {
                ref: "o1-shift-2.points",
            },
            reflectionPoints: {
                ref: "o2-shift.points"
            }
        }
    }).addModuleNode({
        id: "reflect-out",
        type: "point-render-module",
        params: {
            "points": {
                ref: "reflect.points"
            }
        }
    })
    .construct();