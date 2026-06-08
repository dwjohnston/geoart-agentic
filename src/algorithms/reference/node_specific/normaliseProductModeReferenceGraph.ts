import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

// Three centers, product mode, strength=1.0.
// Input orbit is stamped into three quadrants simultaneously,
// producing N×3 output points.
const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Normalise – Product Mode (3 Centers)',
	control: {
		nodes: [],
	},
	compute: {
		nodes: [
			{ id: 'time', type: 'time', params: {} },
			{
				id: 'inputOrbit',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					numPoints: { v: 6 },
					radius: { v: 0.5 },
					speed: { v: 0.3 },
					centerPoints: { v: [{ v: { x: 0, y: 0, r: 1, g: 0.6, b: 0.2, a: 1 } }] },
				},
			},
			{
				id: 'normalise',
				type: 'normalise',
				params: {
					inputPoints: { ref: 'inputOrbit.points' },
					normalisationCenters: {
						v: [
							{ v: { x: -0.5, y:  0.5, r: 0, g: 0, b: 0, a: 1 } },
							{ v: { x:  0.5, y:  0.5, r: 0, g: 0, b: 0, a: 1 } },
							{ v: { x:  0,   y: -0.5, r: 0, g: 0, b: 0, a: 1 } },
						],
					},
					normalisationSize: { v: 0.8 },
					strength: { v: 1.0 },
					mode: { v: 'product' },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: 'outputDots',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'normalise.points' },
					radius: { v: 0.025 },
					color: { v: { r: 0.4, g: 0.9, b: 0.5, a: 1 } },
				},
			},
		],
	},
};

export default graph;
