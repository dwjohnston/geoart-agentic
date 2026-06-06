import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Normalise',
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
				id: 'orbit',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					numPoints: { v: 5 },
					radius: { v: 0.4 },
					speed: { v: 1 },
					center: { v: { x: 0, y: 0 } },
				},
			},
			{
				id: 'normalise',
				type: 'normalise',
				params: {
					inputPoints: { ref: 'orbit.points' },
					normalisationCenters: {
						v: [
							{ v: { x: 0, y: 0, r: 0.5, g: 0.8, b: 0.5, a: 1 } },
						],
					},
					normalisationSize: { v: 0.3 },
					strength: { v: 1 },
					mode: { v: 'product' },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: 'outputCircles',
				type: 'circle',
				renderConfig: {
					layer: 'live',
				},
				params: {
					centerPoints: { ref: 'normalise.points' },
					radius: { v: 0.025 },
				},
			},
		],
	},
};

export default graph;
