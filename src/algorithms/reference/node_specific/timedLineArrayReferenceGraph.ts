import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Timed Line Array',
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
				id: 'orbitInner',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { v: 0.15 },
					speed: { v: 0.5 },
					numPoints: { v: 3 },
					phase: { v: 0 },
				},
			},
			{
				id: 'orbitOuter',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { v: 0.35 },
					speed: { v: 0.3 },
					numPoints: { v: 3 },
					phase: { v: 0 },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: 'timedLineArray',
				type: 'timedLineArray',
				renderConfig: {
					layer: 'paint',
				},
				params: {
					colorPointsA: { ref: 'orbitInner.points' },
					colorPointsB: { ref: 'orbitOuter.points' },
					intervalTicks: { v: 10 },
				},
			}, {
				id: 'circle',
				type: "circle",
				renderConfig: {
					layer: "live"
				},
				params: {
					centerPoints: { ref: "orbitInner.points" },
					radius: { v: 0.01 }
				}
			},
			{
				id: 'circle2',
				type: "circle",
				renderConfig: {
					layer: "live"
				},
				params: {
					centerPoints: { ref: "orbitOuter.points" },
					radius: { v: 0.01 }
				}
			}
		],
	},
};

export default graph;
