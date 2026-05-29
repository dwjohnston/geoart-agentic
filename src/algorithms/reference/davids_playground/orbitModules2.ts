import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Orbit Module 2',
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
				id: 'o1',
				type: 'orbit-module',
				params: {
					time: { ref: 'time.time' },

					centerPoints: { v: [{ v: { x: 0, y: 0, r: 1, g: 1, b: 1, a: 1 } }] },

				},
			},
			{
				id: 'o2',
				type: 'orbit-module',
				params: {
					time: { ref: 'time.time' },

					centerPoints: { ref: "o1.points" },

				},
			},
			{
				id: 'o3',
				type: 'orbit-module',
				params: {
					time: { ref: 'time.time' },

					centerPoints: { ref: "o2.points" },

				},
			},
		],
	},
};

export default graph;
