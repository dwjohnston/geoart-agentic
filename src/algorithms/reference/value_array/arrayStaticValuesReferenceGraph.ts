import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

export const arrayStaticValuesReferenceGraph: GeoArtGraph = {
	version: '2.0',
	control: {
		nodes: [],
	},
	compute: {
		nodes: [],
	},
	render: {
		nodes: [
			{
				id: 'circle',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: {
						v: [
							{
								v: { x: 0.2, y: 0.2, dx: 0, dy: 0, r: 1, g: 0, b: 0, a: 1 },
							},
							{
								v: { x: 0.5, y: 0.5, dx: 0, dy: 0, r: 0, g: 1, b: 0, a: 1 },
							},
							{
								v: { x: 0.8, y: 0.2, dx: 0, dy: 0, r: 0, g: 0, b: 1, a: 1 },
							},
						],
					},
					radius: { v: 0.05 },
				},
			},
		],
	},
};
