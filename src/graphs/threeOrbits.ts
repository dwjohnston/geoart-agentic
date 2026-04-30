import type { GeoArtGraph } from '../schema/_generated/schema-types';

// Three-orbit spirograph algorithm.
//
// Orbit A circles the canvas centre.
// Orbit B circles planet A.
// Orbit C circles planet B.
// The trail of planet C accumulates the spirograph pattern.
// Speed and radius of each orbit are slider-controlled.

export const threeOrbitsGraph: GeoArtGraph = {
	version: '2.0',
	control: {
		nodes: [


			{
				id: "aColor",
				type: "colorPicker",
				params: {
					label: { v: "Orbit A Color" },
					value: {
						"v": {
							"r": 1,
							"g": 0,
							"b": 0,
							"a": 0.5
						}
					}

				}
			},
			{
				id: "bColor",
				type: "colorPicker",
				params: {
					label: { v: "Orbit B Color" },
					value: {
						"v": {
							"r": 1,
							"g": 1,
							"b": 0,
							"a": 0.5
						}
					}

				}
			},
			{
				id: "cColor",
				type: "colorPicker",
				params: {
					label: { v: "Orbit C Color" },
					value: {
						"v": {
							"r": 1,
							"g": 0,
							"b": 1,
							"a": 0.5
						}
					}

				}
			},
			{
				id: 'aSpeedSlider',
				type: 'slider',
				params: {
					label: { v: 'Orbit A Speed' },
					min: { v: -5 },
					max: { v: 5 },
					value: { v: 0.4 },
					step: { v: 0.01 }

				},

			},
			{
				id: 'aRadiusSlider',
				type: 'slider',
				params: {
					label: { v: 'Orbit A Size' },
					min: { v: 0 },
					max: { v: 0.9 },
					value: { v: 0.5 },
					step: { v: 0.01 }

				},
			},
			{
				id: 'bSpeedSlider',
				type: 'slider',
				params: {
					label: { v: 'Orbit B Speed' },
					min: { v: -5 },
					max: { v: 5 },
					value: { v: 1.2 },
					step: { v: 0.01 }

				},
			},
			{
				id: 'bRadiusSlider',
				type: 'slider',
				params: {
					label: { v: 'Orbit B Size' },
					min: { v: 0 },
					max: { v: 0.5 },
					value: { v: 0.25 },
					step: { v: 0.01 }

				},
			},
			{
				id: 'cSpeedSlider',
				type: 'slider',
				params: {
					label: { v: 'Orbit C Speed' },
					min: { v: -5 },
					max: { v: 5 },
					value: { v: 3.0 },
					step: { v: 0.01 }

				},
			},
			{
				id: 'cRadiusSlider',
				type: 'slider',
				params: {
					label: { v: 'Orbit C Size' },
					min: { v: 0 },
					max: { v: 0.3 },
					value: { v: 0.1 },
					step: { v: 0.01 }

				},
			},
			{
				id: 'linkRate',
				type: 'slider',
				params: {
					label: { v: 'Link Rate' },
					min: { v: 1 },
					max: { v: 120 },
					step: { v: 1 },
					value: { v: 10 },
				},
			},


		],
	},
	compute: {
		nodes: [
			{ id: 'time', type: 'time', params: {} },
			{
				id: 'orbitA',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { ref: 'aRadiusSlider.value' },
					speed: { ref: 'aSpeedSlider.value' },
					// center defaults to origin
				},
			},
			{
				id: 'orbitB',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { ref: 'bRadiusSlider.value' },
					speed: { ref: 'bSpeedSlider.value' },
					center: { ref: 'orbitA.point' },
				},
			},
			{
				id: 'orbitC',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { ref: 'cRadiusSlider.value' },
					speed: { ref: 'cSpeedSlider.value' },
					center: { ref: 'orbitB.point' },
				},
			},
			{
				id: 'cpA',
				type: 'colorPointCompute',
				params: {
					point: { ref: 'orbitA.point' },
					color: { ref: "aColor.value" }
				},
			},
			{
				id: 'cpB',
				type: 'colorPointCompute',
				params: {
					point: { ref: 'orbitB.point' },
					color: { ref: "bColor.value" }
				},
			},
			{
				id: 'cpC',
				type: 'colorPointCompute',
				params: {
					point: { ref: 'orbitC.point' },
					color: { ref: "cColor.value" }
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: 'lineA',
				type: 'timedLine',
				renderConfig: { layer: 'paint' },
				params: {
					intervalTicks: { ref: 'linkRate.value' },
					colorPointA: { ref: 'cpA.colorPoint' },
					colorPointB: { ref: 'cpB.colorPoint' },
				},
			},
			{
				id: 'lineB',
				type: 'timedLine',
				renderConfig: { layer: 'paint' },
				params: {
					intervalTicks: { ref: 'linkRate.value' },
					colorPointA: { ref: 'cpA.colorPoint' },
					colorPointB: { ref: 'cpC.colorPoint' },
				},
			},
			{
				id: 'lineC',
				type: 'timedLine',
				renderConfig: { layer: 'paint' },
				params: {
					intervalTicks: { ref: 'linkRate.value' },
					colorPointA: { ref: 'cpB.colorPoint' },
					colorPointB: { ref: 'cpC.colorPoint' },
				},
			},
			// Live position dots — redrawn each frame
			{
				id: 'drawOrbitA',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					radius: { ref: 'aRadiusSlider.value' },
					color: { ref: 'aColor.value' },
				},
			},
			{
				id: 'drawOrbitB',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { ref: 'orbitB.point' },
					radius: { ref: 'bRadiusSlider.value' },
					color: { ref: 'bColor.value' },
				},
			},
			{
				id: 'drawOrbitC',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { ref: 'orbitC.point' },
					radius: { ref: 'cRadiusSlider.value' },
					color: { ref: 'cColor.value' },
				},
			},
			{
				id: 'dotA',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { ref: 'orbitA.point' },
					radius: { v: 0.02 },
					color: { ref: 'aColor.value' },
				},
			},
			{
				id: 'dotB',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { ref: 'orbitB.point' },
					radius: { v: 0.016 },
					color: { ref: 'bColor.value' },
				},
			},
			{
				id: 'dotC',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { ref: 'orbitC.point' },
					radius: { v: 0.012 },
					color: { ref: 'cColor.value' },
				},
			},
		],
	},
};
