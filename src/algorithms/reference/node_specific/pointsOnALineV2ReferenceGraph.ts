import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Points On A Line V2',
	control: {
		nodes: [],
	},
	compute: {
		nodes: [
			{
				id: 'points',
				type: 'colorPointArrayCompute',
				params: {
					points: {
						v: [
							{ v: { x: -0.5, y: 0, r: 1, g: 0, b: 0, a: 1 } },
							{ v: { x: 0, y: 0.5, r: 0, g: 1, b: 0, a: 1 } },
							{ v: { x: 0.5, y: 0, r: 0, g: 0, b: 1, a: 1 } },
						],
					},
				},
			},
			{
				id: 'distributed',
				type: 'pointsOnALineV2',
				params: {
					colorPoints: { ref: 'points.points' },
					numPoints: { v: 20 },
					curveMode: { v: 'straight' },
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
					colorPointsArray: { ref: 'distributed.points' },
					lineWidth: { v: 1 },
				},
			},
		],
	},
};

export default graph;
