import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Curve Modulator',
	control: {
		nodes: [],
	},
	compute: {
		nodes: [
			{
				id: 'time',
				type: 'time',
				params: {},
			},
			{
				id: 'points',
				type: 'pointsOnALine',
				params: {
					numberOfPoints: { v: 10 },
					pointA: {
						v: { x: -0.25, y: 0, r: 1, g: 1, b: 1, a: 1, dx: 0, dy: 0 },

					},
					pointB: {
						v: { x: 0.25, y: 0, r: 1, g: 1, b: 1, a: 1, dx: 0, dy: 0 },

					},
				},
			},
			{
				id: 'modulator',
				type: 'wave',
				params: {
					time: { ref: 'time.time' },
					waveType: { v: 'sine' },
					frequency: { v: 0.5 },
					amplitude: { v: 0.1 },
					phase: { v: 0 },
					samplerTemporalImpact: { v: 1 },
				},
			},
			{
				id: 'modulated',
				type: 'curveModulator',
				params: {
					curve: { ref: 'points.points' },
					modulator: { ref: 'modulator.sampler' },
					cycleLengthMode: { v: 'linearOne' },
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
					lineWidth: { v: 1 },
				},
			},
		],
	},
};

export default graph;
