import { AlgorithmBuilder } from "../../../schema/builder";


const graph = new AlgorithmBuilder({
    "author": "David Johnston",
    "description": "Builder pattern test1 - description",
    "title": "Builder Pattern test1"
})

    .addControlNode({
        "id": "numPoints",
        type: "slider",
        params: {
            label: { v: "num points" },
            "min": { v: 1 },
            max: { v: 5000 },
            "step": { v: 1 },
            value: {
                v: 25,
            }
        }
    })
    .addControlNode({
        "id": "temporalImpact1",
        type: "slider",
        params: {
            label: { v: "temporal impact1" },
            "min": { v: 0 },
            max: { v: 1 },
            "step": { v: 0.01 },
            value: {
                v: 0.1,
            }
        }
    })
    .addControlNode({
        "id": "temporalImpact2",
        type: "slider",
        params: {
            label: { v: "temporal impact2" },
            "min": { v: 0 },
            max: { v: 1 },
            "step": { v: 0.01 },
            value: {
                v: 0.1,
            }
        }
    })
    .addControlNode({
        type: "timedLineArrayModeSelector",
        id: "tl-mode",
        params: {
            label: {
                "v": "interval mode"
            },
            "value": {
                v: "distribute"
            }
        }
    })

    .addControlNode({
        type: "timedLineArrayIntervalModeSelector",
        id: "tl-mode-b",
        params: {
            label: {
                "v": "interval mode"
            },
            "value": {
                v: "inside-out"
            }
        }
    })
    .addControlNode({
        "id": "opacity",
        type: "slider",
        params: {
            label: { v: "opacity" },
            "min": { v: 0 },
            max: { v: 1 },
            "step": { v: 0.001 },
            value: {
                v: 0.01,
            }
        }
    })

    .addControlNode({
        "id": "tickRate",
        type: "slider",
        params: {
            label: { v: "tick rate" },
            "min": { v: 1 },
            max: { v: 100 },
            "step": { v: 1 },
            value: {
                v: 25,
            }
        }
    })
    .addControlNode({
        "id": "freq1",
        type: "slider",
        params: {
            label: { v: "freq1" },
            "min": { v: 0.01 },
            max: { v: 50 },
            "step": { v: 0.01 },
            value: {
                v: 1,
            }
        }
    })
    .addControlNode({
        "id": "amp1",
        type: "slider",
        params: {
            label: { v: "amp1" },
            "min": { v: 0 },
            max: { v: 10 },
            "step": { v: 0.01 },
            value: {
                v: 0.3,
            }
        }
    })
    .addControlNode({
        "id": "wave1FMFreq",
        type: "slider",
        params: {
            label: { v: "FM freq" },
            "min": { v: 0.01 },
            max: { v: 50 },
            "step": { v: 0.01 },
            value: {
                v: 1,
            }
        }
    })
    .addControlNode({
        "id": "wave1FMSamp",
        type: "slider",
        params: {
            label: { v: "FM amp" },
            "min": { v: 0 },
            max: { v: 10 },
            "step": { v: 0.01 },
            value: {
                v: 0.3,
            }
        }
    })

    .addControlNode({
        "id": "freq2",
        type: "slider",
        params: {
            label: { v: "freq2" },
            "min": { v: 0.01 },
            max: { v: 50 },
            "step": { v: 0.01 },
            value: {
                v: 1,
            }
        }
    })
    .addControlNode({
        "id": "amp2",
        type: "slider",
        params: {
            label: { v: "amp2" },
            "min": { v: 0 },
            max: { v: 1 },
            "step": { v: 0.01 },
            value: {
                v: 0.3,
            }
        }
    })
    .addComputeNode({
        type: "time",
        id: "time",
        params: {}
    })


    .addComputeNode({
        type: "wave",
        id: "wave-1",
        "params": {
            frequency: {
                ref: "freq1.value"
            },
            "time": {
                ref: "time.time"
            },
            amplitude: { ref: "amp1.value" },
            "samplerTemporalImpact": {
                ref: "temporalImpact1.value"
            }

        }
    })
    .addComputeNode({
        type: "wave",
        id: "wave-2",
        "params": {
            frequency: {
                ref: "freq2.value"
            },
            "time": {
                ref: "time.time"
            },
            amplitude: { ref: "amp2.value" },
            "samplerTemporalImpact": {
                ref: "temporalImpact2.value"
            }

        }
    })
    .addComputeNode({
        "type": "colorPointCompute",
        "id": "cp1",
        "params": {
            "r": {
                v: 1,
            },
            g: {
                v: 0,
            },
            b: {
                v: 0,
            },
            a: {
                ref: "opacity.value"
            },
            x: {
                v: -0.8
            },
            y: {
                v: -0.5
            }
        }

    }).addComputeNode({
        "type": "colorPointCompute",
        "id": "cp2",
        "params": {
            "r": {
                v: 0,
            },
            g: {
                v: 1,
            },
            b: {
                v: 0,
            },
            a: {
                ref: "opacity.value"
            },
            x: {
                v: 0.8
            },
            y: {
                v: -0.5
            }
        }

    })
    .addComputeNode({
        "type": "colorPointCompute",
        "id": "cp3",
        "params": {
            "r": {
                v: 0,
            },
            g: {
                v: 0,
            },
            b: {
                v: 1,
            },
            a: {
                ref: "opacity.value"
            },
            x: {
                v: 0
            },
            y: {
                v: 0.8
            }
        }

    })
    .addComputeNode({
        type: "pointsOnALine",
        id: "line-a",
        params: {
            "numberOfPoints": { ref: "numPoints.value" },
            "pointA": {
                ref: "cp1.colorPoint"
            },
            "pointB": {
                ref: "cp2.colorPoint"
            }
        }
    })
    .addComputeNode({
        type: "pointsOnALine",
        id: "line-b",
        params: {
            "numberOfPoints": { ref: "numPoints.value" },
            "pointA": {
                ref: "cp2.colorPoint"
            },
            "pointB": {
                ref: "cp3.colorPoint"
            }
        }
    })
    .addComputeNode({
        type: "pointsOnALine",
        id: "line-c",
        params: {
            "numberOfPoints": { ref: "numPoints.value" },
            "pointA": {
                ref: "cp3.colorPoint"
            },
            "pointB": {
                ref: "cp1.colorPoint"
            }
        }
    })
    .addComputeNode({
        'type': "curveModulator",
        id: 'curve-mod-1',
        params: {
            "modulator": {
                "ref": "wave-1.sampler"
            },
            "curve": {
                ref: "line-a.points"
            },

        }
    })
    .addComputeNode({
        'type': "curveModulator",
        id: 'curve-mod-2',
        params: {
            "modulator": {
                "ref": "wave-1.sampler"
            },
            "curve": {
                ref: "line-b.points"
            },

        }
    })
    .addComputeNode({
        'type': "curveModulator",
        id: 'curve-mod-3',
        params: {
            "modulator": {
                "ref": "wave-1.sampler"
            },
            "curve": {
                ref: "line-c.points"
            }
        }
    })

    .addComputeNode({
        'type': "curveModulator",
        id: 'curve-mod-1-b',
        params: {
            "modulator": {
                "ref": "wave-2.sampler"
            },
            "curve": {
                ref: "curve-mod-1.points"
            },

        }
    })
    .addComputeNode({
        'type': "curveModulator",
        id: 'curve-mod-2-b',
        params: {
            "modulator": {
                "ref": "wave-2.sampler"
            },
            "curve": {
                ref: "curve-mod-2.points"
            },

        }
    })
    .addComputeNode({
        'type': "curveModulator",
        id: 'curve-mod-3-b',
        params: {
            "modulator": {
                "ref": "wave-2.sampler"
            },
            "curve": {
                ref: "curve-mod-3.points"
            }
        }
    })
    .addRenderNode({
        type: "circle",
        id: "dots-anchor",
        renderConfig: {
            layer: "live"
        },
        params: {
            radius: {
                v: 0.01
            },
            centerPoints: {
                v: [
                    {
                        ref: "cp1.colorPoint"
                    },
                    {
                        ref: "cp2.colorPoint"
                    },
                    {
                        ref: "cp3.colorPoint"
                    }
                ]
            }
        }
    })
    .addRenderNode({
        type: "circle",
        id: "dots-marks-a",
        renderConfig: {
            layer: "live"
        },
        params: {
            radius: {
                v: 0.005
            },
            centerPoints: {
                ref: "line-a.points"
            }
        }
    })
    .addRenderNode({
        type: "circle",
        id: "dots-marks-b",
        renderConfig: {
            layer: "live"
        },
        params: {
            radius: {
                v: 0.005
            },
            centerPoints: {
                ref: "line-b.points"
            }
        }
    })
    .addRenderNode({
        type: "circle",
        id: "dots-marks-c",
        renderConfig: {
            layer: "live"
        },
        params: {
            radius: {
                v: 0.005
            },
            centerPoints: {
                ref: "line-c.points"
            }
        }
    })
    .addRenderNode({
        type: "circle",
        id: "dot-marks-curve-a",
        renderConfig: {
            layer: "live"
        },
        params: {
            radius: {
                v: 0.005
            },
            centerPoints: {
                ref: "curve-mod-1.points"
            }
        }
    })
    .addRenderNode({
        type: "circle",
        id: "dot-marks-curve-b",
        renderConfig: {
            layer: "live"
        },
        params: {
            radius: {
                v: 0.005
            },
            centerPoints: {
                ref: "curve-mod-2.points"
            }
        }
    })
    .addRenderNode({
        type: "circle",
        id: "dot-marks-curve-c",
        renderConfig: {
            layer: "live"
        },
        params: {
            radius: {
                v: 0.005
            },
            centerPoints: {
                ref: "curve-mod-3.points"
            }
        }
    })
    .addRenderNode({
        type: "circle",
        id: "dot-marks-curve-a-b",
        renderConfig: {
            layer: "live"
        },
        params: {
            radius: {
                v: 0.005
            },
            centerPoints: {
                ref: "curve-mod-1-b.points"
            }
        }
    })
    .addRenderNode({
        type: "circle",
        id: "dot-marks-curve-b-b",
        renderConfig: {
            layer: "live"
        },
        params: {
            radius: {
                v: 0.005
            },
            centerPoints: {
                ref: "curve-mod-2-b.points"
            }
        }
    })
    .addRenderNode({
        type: "circle",
        id: "dot-marks-curve-c-b",
        renderConfig: {
            layer: "live"
        },
        params: {
            radius: {
                v: 0.005
            },
            centerPoints: {
                ref: "curve-mod-3-b.points"
            }
        }
    })
    .addRenderNode({
        type: "timedLineArray",
        "id": "link-a-b",
        renderConfig: {
            layer: "paint"
        },
        params: {
            "colorPointsA": {
                "ref": "curve-mod-1-b.points"
            },
            "intervalMode": {
                ref: "tl-mode-b.value"
            },
            "mode": {
                ref: "tl-mode.value"
            },
            "intervalTicks": {
                ref: "tickRate.value"
            },

            "colorPointsB": {
                "ref": "curve-mod-2-b.points"
            }
        }

    }).addRenderNode({
        type: "timedLineArray",
        "id": "link-b-b",
        renderConfig: {
            layer: "paint"
        },
        params: {
            "colorPointsA": {
                "ref": "curve-mod-2-b.points"
            },
            "intervalMode": {
                ref: "tl-mode-b.value"
            },
            "mode": {
                ref: "tl-mode.value"
            },
            "intervalTicks": {
                ref: "tickRate.value"
            },

            "colorPointsB": {
                "ref": "curve-mod-3-b.points"
            }
        }

    }).addRenderNode({
        type: "timedLineArray",
        "id": "link-c-b",
        renderConfig: {
            layer: "paint"
        },
        params: {
            "colorPointsA": {
                "ref": "curve-mod-3-b.points"
            },
            "intervalMode": {
                ref: "tl-mode-b.value"
            },
            "mode": {
                ref: "tl-mode.value"
            },
            "intervalTicks": {
                ref: "tickRate.value"
            },

            "colorPointsB": {
                "ref": "curve-mod-1-b.points"
            }
        }

    })


    .construct();

console.log(graph)

export default graph