import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Orbit Center Points',
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
					radius: { v: 0.15 },
					speed: { v: 0.5 },
					numPoints: { v: 2 },
					phase: { v: 0 },
					centerPoints: {
						v: [
							{ v: { x: -0.25, y: 0, r: 1, g: 0, b: 0, a: 1 } },
							{ v: { x: 0.25, y: 0, r: 0, g: 0, b: 1, a: 1 } },
						],
					},
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: 'circles',
				type: 'circle',
				renderConfig: {
					layer: 'live',
				},
				params: {
					centerPoints: { ref: 'orbit.points' },
					radius: { v: 0.04 },
					color: { v: { r: 1, g: 1, b: 1, a: 1 } },
				},
			},
		],
	},
};

export default graph;
