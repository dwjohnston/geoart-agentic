import { AlgorithmBuilder } from "../../../schema/builder";

/**
 * Builder Pattern Test 2 - Ratio Version
 *
 * This is an alternative implementation to builder_pattern_test1 that demonstrates
 * organizing related control values through mathematical relationships rather than
 * having them all be independent controls.
 *
 * Instead of independent sliders for freq1 and freq2, this version uses:
 * - A base frequency slider
 * - A multiply node to establish freq2 as a ratio of the base frequency
 *
 * The same approach is applied to amplitudes:
 * - A base amplitude slider
 * - A multiply node to establish amp2 as a ratio of the base amplitude
 *
 * All other aspects remain identical to test1 (same visual output, curve modulators, render nodes).
 */

const graph = new AlgorithmBuilder({
    "author": "David Johnston",
    "description": "Builder pattern test2 - ratio version",
    "title": "Builder Pattern test2 (Ratio Version)"
})

    // Base control sliders
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

    // Base frequency and ratio
    .addControlNode({
        "id": "baseFreq",
        type: "slider",
        params: {
            label: { v: "base freq" },
            "min": { v: 0.01 },
            max: { v: 50 },
            "step": { v: 0.01 },
            value: {
                v: 1,
            }
        }
    })
    .addControlNode({
        "id": "freqRatio",
        type: "slider",
        params: {
            label: { v: "freq ratio (freq2/freq1)" },
            "min": { v: 0.1 },
            max: { v: 10 },
            "step": { v: 0.1 },
            value: {
                v: 1,
            }
        }
    })

    // Base amplitude and ratio
    .addControlNode({
        "id": "baseAmp",
        type: "slider",
        params: {
            label: { v: "base amp" },
            "min": { v: 0 },
            max: { v: 10 },
            "step": { v: 0.01 },
            value: {
                v: 0.3,
            }
        }
    })
    .addControlNode({
        "id": "ampRatio",
        type: "slider",
        params: {
            label: { v: "amp ratio (amp2/amp1)" },
            "min": { v: 0.1 },
            max: { v: 10 },
            "step": { v: 0.1 },
            value: {
                v: 1,
            }
        }
    })

    // FM frequency and amplitude (independent)
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

    // Time node
    .addComputeNode({
        type: "time",
        id: "time",
        params: {}
    })

    // Frequency multiplier: freq2 = baseFreq * freqRatio
    .addComputeNode({
        type: "multiplier",
        id: "freq2-calc",
        params: {
            a: { ref: "baseFreq.value" },
            b: { ref: "freqRatio.value" }
        }
    })

    // Amplitude multiplier: amp2 = baseAmp * ampRatio
    .addComputeNode({
        type: "multiplier",
        id: "amp2-calc",
        params: {
            a: { ref: "baseAmp.value" },
            b: { ref: "ampRatio.value" }
        }
    })

    // Wave 1: uses baseFreq and baseAmp
    .addComputeNode({
        type: "wave",
        id: "wave-1",
        "params": {
            frequency: {
                ref: "baseFreq.value"
            },
            "time": {
                ref: "time.time"
            },
            amplitude: { ref: "baseAmp.value" },
            "samplerTemporalImpact": {
                ref: "temporalImpact1.value"
            }

        }
    })

    // Wave 2: uses calculated freq2 and amp2
    .addComputeNode({
        type: "wave",
        id: "wave-2",
        "params": {
            frequency: {
                ref: "freq2-calc.product"
            },
            "time": {
                ref: "time.time"
            },
            amplitude: { ref: "amp2-calc.product" },
            "samplerTemporalImpact": {
                ref: "temporalImpact2.value"
            }

        }
    })

    // Color point definitions
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

    // Line definitions
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

    // Curve modulators - wave 1 modulates base lines
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

    // Curve modulators - wave 2 modulates wave-1-modulated curves
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

    // Render nodes - anchor points
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

    // Render nodes - line markers
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

    // Render nodes - first curve modulation markers
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

    // Render nodes - second curve modulation markers
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

    // Render nodes - timed lines
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

export default graph;
