import type { GeoArtGraph } from '../schema/_generated/schema-types';

// Orbit wave line algorithm.
//
// Two orbits positioned at bottom-left and top-right. A line of points
// connects them, modulated by a wave. The orbits are rendered as circles
// on the live layer (redrawn each frame), and the connecting line points
// are drawn on the paint layer (accumulating over time).

export const orbitWaveLineGraph: GeoArtGraph = {
	version: '2.0',
	control: {
		nodes: [
			{
				id: 'orbitASpeedSlider',
				type: 'slider',
				params: {
					label: { v: 'Orbit A Speed' },
					min: { v: -5 },
					max: { v: 5 },
					value: { v: 0.15 },
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
					value: { v: 0.25 },
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
					label: { v: 'Wave Amplitude' },
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
					label: { v: 'Wave Frequency' },
					min: { v: 0.001 },
					max: { v: 20 },
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
					radius: { v: 0.25 },
					speed: { ref: 'orbitASpeedSlider.value' },
					center: { v: { x: -0.7, y: -0.7 } },
					numPoints: { v: 1 },
					phase: { v: 0 },
				},
			},
			// Top-right orbit
			{
				id: 'orbitB',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { v: 0.25 },
					speed: { ref: 'orbitBSpeedSlider.value' },
					center: { v: { x: 0.7, y: 0.7 } },
					numPoints: { v: 1 },
					phase: { v: 0 },
				},
			},
			// Wave modulator
			{
				id: 'waveMod',
				type: 'wave',
				params: {
					time: { v: 0 },
					amplitude: { ref: 'waveAmplitudeSlider.value' },
					frequency: { ref: 'waveFrequencySlider.value' },
					phase: { v: 0 },
					waveType: { v: 'sine' },
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
					modulateBy: { ref: 'waveMod.sampler' },
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
		],
	},
	render: {
		nodes: [
			// Connect the dots on paint layer (accumulates over time)
			{
				id: 'connectLinePoints',
				type: 'connect-dots',
				renderConfig: { layer: 'live' },
				params: {
					colorPointsArray: { ref: 'linePoints.points' },
					lineWidth: { v: 1 },
				},
			},

			// Orbit A circle (live layer, redrawn each frame)
			{
				id: 'orbitACircle',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: -0.7, y: -0.7 } },
					radius: { v: 0.25 },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
				},
			},
			// Orbit B circle (live layer, redrawn each frame)
			{
				id: 'orbitBCircle',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0.7, y: 0.7 } },
					radius: { v: 0.25 },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
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
