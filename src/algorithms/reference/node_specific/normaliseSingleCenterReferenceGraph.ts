import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

// Single center, product mode.
// A unit-square orbit is normalised into the bottom-left quadrant.
// Adjust Strength to interpolate between the original and fully normalised positions.
const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Normalise – Single Center',
	control: {
		nodes: [
			{
				id: 'strengthControl',
				type: 'slider',
				params: {
					label: { v: 'Strength' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 1 },
				},
			},
		],
	},
	compute: {
		nodes: [
			{ id: 'time', type: 'time', params: {} },
			{
				id: 'inputOrbit',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					numPoints: { v: 8 },
					radius: { v: 0.5 },
					speed: { v: 0.2 },
					centerPoints: { v: [{ v: { x: 0, y: 0, r: 1, g: 0.6, b: 0.2, a: 1 } }] },
				},
			},
			{
				id: 'normalise',
				type: 'normalise',
				params: {
					inputPoints: { ref: 'inputOrbit.points' },
					normalisationCenters: {
						v: [{ v: { x: -0.5, y: -0.5, r: 0, g: 0, b: 0, a: 1 } }],
					},
					normalisationSize: { v: 1.0 },
					strength: { ref: 'strengthControl.value' },
					mode: { v: 'product' },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: 'inputDots',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'inputOrbit.points' },
					radius: { v: 0.025 },
				},
			},
			{
				id: 'outputDots',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'normalise.points' },
					radius: { v: 0.03 },
					color: { v: { r: 0.2, g: 0.8, b: 1, a: 1 } },
				},
			},
		],
	},
};

export default graph;
