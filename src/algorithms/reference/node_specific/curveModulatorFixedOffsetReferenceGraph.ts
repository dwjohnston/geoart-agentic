import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Curve Modulator Fixed Offset',
	control: {
		nodes: [
			{
				id: 'modulationAngleSlider',
				type: 'slider',
				params: {
					label: { v: 'Modulation Angle' },
					min: { v: 0 },
					max: { v: 1 },
					value: { v: 0.25 },
					step: { v: 0.01 },
				},
			},
			{
				id: 'fixedOffsetSlider',
				type: 'slider',
				params: {
					label: { v: 'Fixed Offset' },
					min: { v: 0 },
					max: { v: 0.2 },
					value: { v: 0 },
					step: { v: 0.01 },
				},
			},
		],
	},
	compute: {
		nodes: [
			{
				id: 'time',
				type: 'time',
				params: {},
			},
			{
				id: 'orbitPoints',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					speed: { v: 0.5 },
					radius: { v: 0.15 },
					numPoints: { v: 20 },
					centerPoints: { v: [] },
					phase: { v: 0 },
					eccentricity: { v: 0 },
					tilt: { v: 0 },
					center: { v: { x: 0, y: 0 } },
				},
			},
			{
				id: 'modulator',
				type: 'wave',
				params: {
					time: { ref: 'time.time' },
					waveType: { v: 'sine' },
					frequency: { v: 0.5 },
					amplitude: { v: 0.05 },
					phase: { v: 0 },
					samplerTemporalImpact: { v: 1 },
				},
			},
			{
				id: 'modulated',
				type: 'curveModulator',
				params: {
					curve: { ref: 'orbitPoints.points' },
					modulator: { ref: 'modulator.sampler' },
					cycleLengthMode: { v: 'linearOne' },
					modulationAngle: { ref: 'modulationAngleSlider.value' },
					fixedOffset: { ref: 'fixedOffsetSlider.value' },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: 'connectDots',
				type: 'connect-dots',
				renderConfig: {
					layer: 'live',
				},
				params: {
					colorPointsArray: { ref: 'modulated.points' },
					lineWidth: { v: 2 },
				},
			},
		],
	},
};

export default graph;
