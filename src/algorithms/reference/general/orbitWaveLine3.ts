import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

// Orbit wave line algorithm.
//
// Two orbits positioned at bottom-left and top-right. A line of points
// connects them, modulated by a wave. The orbits are rendered as circles
// on the live layer (redrawn each frame), and the connecting line points
// are drawn on the paint layer (accumulating over time).

const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Orbit Wave Line 3',
	control: {
		nodes: [
			{
				id: "aColor",
				type: "colorPicker",
				params: {
					label: { v: "Orbit A Color" },
					value: {
						"v": {
							"r": 1,
							"g": 0,
							"b": 0,
							"a": 0.5
						}
					}

				}
			},
			{
				id: "eccentricity1",
				type: "slider",
				params: {
					label: { v: "eccentricity" },
					value: { v: 0.9 },

					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 }

				}
			},
			{
				id: "tilt1",
				type: "slider",
				params: {
					label: { v: "tilt" },
					value: { v: 0.1 },

					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 }
				}
			},
			{
				id: "eccentricity2",
				type: "slider",
				params: {
					label: { v: "eccentricity" },
					value: { v: 0.9 },

					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 }

				}
			},
			{
				id: "tilt2",
				type: "slider",
				params: {
					label: { v: "tilt" },
					value: { v: 0.5 },

					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 }
				}
			},
			{
				id: 'temporalImpact1',
				type: 'slider',
				params: {
					label: { v: 'Sampler Temporal Impact' },
					min: { v: 0 },
					max: { v: 0.1 },
					value: { v: 0.05 },
					step: { v: 0.001 }
				},
			},
			{
				id: 'temporalImpact2',
				type: 'slider',
				params: {
					label: { v: 'Sampler Temporal Impact' },
					min: { v: 0 },
					max: { v: 0.1 },
					value: { v: 0.05 },
					step: { v: 0.001 }
				},
			},
			{
				id: 'temporalImpact3',
				type: 'slider',
				params: {
					label: { v: 'Sampler Temporal Impact' },
					min: { v: 0 },
					max: { v: 0.1 },
					value: { v: 0.05 },
					step: { v: 0.001 }
				},
			},
			{
				id: 'orbitASpeedSlider',
				type: 'slider',
				params: {
					label: { v: 'Orbit A Speed' },
					min: { v: -5 },
					max: { v: 5 },
					value: { v: 0.02 },
					step: { v: 0.01 }
				},
			},
			{
				id: 'orbitBSpeedSlider',
				type: 'slider',
				params: {
					label: { v: 'Orbit B Speed' },
					min: { v: -5 },
					max: { v: 5 },
					value: { v: -0.02 },
					step: { v: 0.01 }
				},
			},
			{
				id: 'numberOfPointsSlider',
				type: 'slider',
				params: {
					label: { v: 'Number of Points' },
					min: { v: 2 },
					max: { v: 500 },
					value: { v: 20 },
					step: { v: 1 }
				},
			},
			{
				id: 'waveAmplitudeSlider',
				type: 'slider',
				params: {
					label: { v: 'Wave Amplitude 1' },
					min: { v: 0 },
					max: { v: 1 },
					value: { v: 0.1 },
					step: { v: 0.01 }
				},
			},
			{
				id: 'waveFrequencySlider',
				type: 'slider',
				params: {
					label: { v: 'Wave Frequency 1' },
					min: { v: 0.001 },
					max: { v: 20 },
					value: { v: 4 },
					step: { v: 0.01 }
				},
			},
			{
				id: 'wave2AmplitudeSlider',
				type: 'slider',
				params: {
					label: { v: 'Wave Amplitude 2' },
					min: { v: 0 },
					max: { v: 1 },
					value: { v: 0.1 },
					step: { v: 0.01 }
				},
			},
			{
				id: 'wave2FrequencySlider',
				type: 'slider',
				params: {
					label: { v: 'Wave Frequency 2' },
					min: { v: 0.001 },
					max: { v: 100 },
					value: { v: 4 },
					step: { v: 0.01 }
				},
			},
			{
				id: 'wave3AmplitudeSlider',
				type: 'slider',
				params: {
					label: { v: 'Wave Amplitude 3' },
					min: { v: 0 },
					max: { v: 1 },
					value: { v: 0.1 },
					step: { v: 0.01 }
				},
			},
			{
				id: 'wave3FrequencySlider',
				type: 'slider',
				params: {
					label: { v: 'Wave Frequency 3' },
					min: { v: 0.001 },
					max: { v: 200 },
					value: { v: 4 },
					step: { v: 0.01 }
				},
			},
			{
				id: 'linkRate',
				type: 'slider',
				params: {
					label: { v: 'Link Rate' },
					min: { v: 1 },
					max: { v: 120 },
					step: { v: 1 },
					value: { v: 10 },
				},
			},
		],
	},
	compute: {
		nodes: [
			{ id: 'time', type: 'time', params: {} },
			// Bottom-left orbit
			{
				id: 'orbitA',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { v: 1 },
					speed: { ref: 'orbitASpeedSlider.value' },
					numPoints: { v: 1 },
					phase: { v: 0 },
					eccentricity: { ref: "eccentricity1.value" },
					tilt: { ref: "tilt1.value" }

				},
			},
			// Top-right orbit
			{
				id: 'orbitB',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { v: 1 },
					speed: { ref: 'orbitBSpeedSlider.value' },
					numPoints: { v: 1 },
					phase: { v: 0 },
					eccentricity: { ref: "eccentricity2.value" },
					tilt: { ref: "tilt2.value" }
				},
			},
			// Wave modulator
			{
				id: 'waveMod1',
				type: 'wave',
				params: {
					time: { ref: 'time.time' },
					amplitude: { ref: 'waveAmplitudeSlider.value' },
					frequency: { ref: 'waveFrequencySlider.value' },
					phase: { v: 0 },
					waveType: { v: 'sine' },
					samplerTemporalImpact: { ref: "temporalImpact1.value" }
				},
			},
			{
				id: 'waveMod2',
				type: 'wave',
				params: {
					time: { ref: 'time.time' },
					amplitude: { ref: 'wave2AmplitudeSlider.value' },
					frequency: { ref: 'wave2FrequencySlider.value' },
					phase: { v: 0 },
					waveType: { v: 'sine' },
					samplerTemporalImpact: { ref: "temporalImpact2.value" }

				},
			},
			{
				id: 'waveMod3',
				type: 'wave',
				params: {
					time: { ref: 'time.time' },
					amplitude: { ref: 'wave3AmplitudeSlider.value' },
					frequency: { ref: 'wave3FrequencySlider.value' },
					phase: { v: 0 },
					waveType: { v: 'sine' },
					samplerTemporalImpact: { ref: "temporalImpact3.value" }

				},
			},
			// Points along the line between the two orbits
			{
				id: 'linePoints',
				type: 'pointsOnALine',
				params: {
					pointA: { ref: 'orbitA.point' },
					pointB: { ref: 'orbitB.point' },
					numberOfPoints: { ref: 'numberOfPointsSlider.value' },
				},
			},
			// Color points for orbit A
			{
				id: 'orbitAColorPoint',
				type: 'colorPointCompute',
				params: {
					point: { ref: 'orbitA.point' },
					color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
				},
			},
			// Color points for orbit B
			{
				id: 'orbitBColorPoint',
				type: 'colorPointCompute',
				params: {
					point: { ref: 'orbitB.point' },
					color: { v: { r: 1, g: 0.3, b: 0.5, a: 1 } },
				},
			},

			{
				id: 'firstModulated',
				type: 'curveModulator',
				params: {
					curve: { ref: 'linePoints.points' },
					modulator: { ref: 'waveMod1.sampler' },
					"cycleLengthMode": { v: "linearOne", }
				},
			},
			{
				id: 'secondModulated',
				type: 'curveModulator',
				params: {
					curve: { ref: 'firstModulated.points' },
					modulator: { ref: 'waveMod2.sampler' },
					"cycleLengthMode": { v: "linearOne", }

				},
			},
			{
				id: 'thirdModulated',
				type: 'curveModulator',
				params: {
					curve: { ref: 'secondModulated.points' },
					modulator: { ref: 'waveMod3.sampler' },
					"cycleLengthMode": { v: "linearOne", }

				},
			},
		],
	},
	render: {
		nodes: [
			// Connect the dots on paint layer (accumulates over time)
			// {
			// 	id: 'connectLinePoints',
			// 	type: 'connect-dots',
			// 	renderConfig: { layer: 'live' },
			// 	params: {
			// 		colorPointsArray: { ref: 'linePoints.points' },
			// 		lineWidth: { v: 1 },
			// 	},
			// },

			{
				id: 'connectLinePoints',
				type: 'connect-dots',
				renderConfig: { layer: 'live' },
				params: {
					colorPointsArray: { ref: 'firstModulated.points' },
					lineWidth: { v: 1 },
					mode: { v: "catmull-rom" }

				},
			},
			{
				id: 'connectLinePoints2',
				type: 'connect-dots',
				renderConfig: { layer: 'live' },
				params: {
					colorPointsArray: { ref: 'secondModulated.points' },
					lineWidth: { v: 1 },
					mode: { v: "catmull-rom" }

				},
			},
			{
				id: 'connectLinePoints3',
				type: 'connect-dots',
				renderConfig: { layer: 'live' },
				params: {
					colorPointsArray: { ref: 'thirdModulated.points' },
					lineWidth: { v: 1 },
					mode: { v: "catmull-rom" }

				},
			},

			{
				id: 'level1dots',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					radius: { v: 0.01 },
					centerPoints: {
						ref: 'firstModulated.points'
					}

				},
			},

			{
				id: 'level1cross',
				type: 'linesThroughPoint',
				renderConfig: { layer: 'live' },
				params: {
					points: {
						ref: 'firstModulated.points'
					},
					lineLength: {
						v: 0.03
					},
					degrees: {
						v: [
							{
								v: 0,
							},
							{
								v: 90,
							}
						]
					}

				},
			},
			{
				id: 'level2cross',
				type: 'linesThroughPoint',
				renderConfig: { layer: 'live' },
				params: {
					points: {
						ref: 'secondModulated.points'
					},
					lineLength: {
						v: 0.03
					},
					degrees: {
						v: [
							{
								v: 0,
							},
							{
								v: 90,
							}
						]
					}

				},
			},
			{
				id: 'level3cross',
				type: 'linesThroughPoint',
				renderConfig: { layer: 'live' },
				params: {
					points: {
						ref: 'thirdModulated.points'
					},
					lineLength: {
						v: 0.03
					},
					degrees: {
						v: [
							{
								v: 0,
							},
							{
								v: 90,
							}
						]
					}

				},
			},


			{
				id: 'level2dots',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					radius: { v: 0.01 },
					centerPoints: {
						ref: 'secondModulated.points'
					}

				},
			},

			{
				id: 'level3dots',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					radius: { v: 0.01 },
					centerPoints: {
						ref: 'thirdModulated.points'
					}

				},
			},

			// Orbit A circle (live layer, redrawn each frame)
			{
				id: 'orbitACircle',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					radius: { v: 1 },
					color: { ref: 'aColor.value' },

					eccentricity: { ref: "eccentricity1.value" },
					tilt: { ref: "tilt1.value" }

				},
			},
			// Orbit B circle (live layer, redrawn each frame)
			{
				id: 'orbitBCircle',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					radius: { v: 1 },

					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
					eccentricity: { ref: "eccentricity2.value" },
					tilt: { ref: "tilt2.value" }
				},
			},
			// Orbit A position dot (live layer)
			{
				id: 'orbitADot',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { ref: 'orbitA.point' },
					radius: { v: 0.02 },
					color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
				},
			},
			// Orbit B position dot (live layer)
			{
				id: 'orbitBDot',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { ref: 'orbitB.point' },
					radius: { v: 0.02 },
					color: { v: { r: 1, g: 0.3, b: 0.5, a: 1 } },
				},
			},
		],
	},
};

export default graph;
