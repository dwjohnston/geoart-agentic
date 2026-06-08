import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

// Two centers, sequential mode, strength=0.5.
// Each pass progressively nudges the cloud toward the next center,
// keeping output cardinality equal to input (N points, not N×M).
const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Normalise – Sequential Mode (2 Centers)',
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
					value: { v: 0.5 },
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
					radius: { v: 0.4 },
					speed: { v: 0.25 },
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
							{ v: { x: -0.4, y:  0.0, r: 0, g: 0, b: 0, a: 1 } },
							{ v: { x:  0.4, y:  0.0, r: 0, g: 0, b: 0, a: 1 } },
						],
					},
					normalisationSize: { v: 0.6 },
					strength: { ref: 'strengthControl.value' },
					mode: { v: 'sequential' },
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
					radius: { v: 0.02 },
					color: { v: { r: 0.6, g: 0.6, b: 0.6, a: 0.5 } },
				},
			},
			{
				id: 'outputDots',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'normalise.points' },
					radius: { v: 0.03 },
					color: { v: { r: 1, g: 0.4, b: 0.8, a: 1 } },
				},
			},
		],
	},
};

export default graph;
