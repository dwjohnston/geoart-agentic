import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

export const colorShiftGraph: GeoArtGraph = {
	version: '2.0',
	control: {
		nodes: [
			{
				id: 'falloffControl',
				type: 'slider',
				params: {
					label: { v: 'Falloff' },
					min: { v: 0 },
					max: { v: 5 },
					value: { v: 5 },
					step: { v: 0.1 },
				},
			},
			{
				id: 'strengthControl',
				type: 'slider',
				params: {
					label: { v: 'Strength' },
					min: { v: 0 },
					max: { v: 1 },
					value: { v: 1 },
					step: { v: 0.05 },
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
				id: "orbit",
				type: "orbit",
				params: {
					time: { ref: 'time.time' },

					numPoints: { v: 3 },
					radius: { v: 0.25 },
					speed: { v: 1 },
					center: { v: { x: 0, y: 0, } }

				}

			},
			{
				id: 'colorShift',
				type: 'colorShift',
				params: {
					inputPoints: {

						ref: "orbit.points"

					},
					targetPoints: {
						v: [
							{
								v: {
									x: 0,
									y: 1,
									r: 1,
									g: 0,
									b: 0,
									a: 1,
								},
							},
							{
								v: {
									x: 0,
									y: -1,
									r: 0,
									g: 1,
									b: 0,
									a: 0.5,
								},
							},
						],
					},
					falloff: { ref: 'falloffControl.value' },
					strength: { ref: 'strengthControl.value' },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: 'outputCircles',
				type: 'circle',
				renderConfig: {
					layer: 'live',
				},
				params: {
					centerPoints: { ref: 'colorShift.points' },
					radius: { v: 0.03 },
				},
			},
		],
	},
};
