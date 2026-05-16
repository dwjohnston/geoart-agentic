import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Array Reference',
	control: {
		nodes: [
			{
				id: 'speedSlider',
				type: 'slider',
				params: {
					label: { v: 'Speed' },
					min: { v: -5 },
					max: { v: 5 },
					step: { v: 0.01 },
					value: { v: 1 },
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
				id: 'orbit',
				type: 'orbit',
				params: {
					numPoints: { v: 4 },
					time: { ref: 'time.time' },
					radius: { v: 0.3 },
					speed: { ref: 'speedSlider.value' },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: 'circle',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'orbit.points' },
					radius: { v: 0.02 },
				},
			},
		],
	},
};

export default graph;
