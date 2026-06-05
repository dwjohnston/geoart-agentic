import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Orbit Module',
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
		],
	},
	render: {
		nodes: [],
	},
	module: {
		nodes: [
			{
				id: 'my-orbit',
				type: 'orbit-module',
				params: {
					time: { ref: 'time.time' },
					speed: { v: 0.01 },
					radius: { v: 0.3 },
					numPoints: { v: 1 },
					centerPoints: { v: [{ v: { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1 } }] },
					phase: { v: 0 },
					eccentricity: { v: 0 },
					tilt: { v: 0 },
				},
			},
		],
	},
};

export default graph;
