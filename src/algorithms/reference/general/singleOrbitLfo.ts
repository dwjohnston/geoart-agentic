import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

export const singleOrbitLfoGraph: GeoArtGraph = {
	version: '2.0',
	control: {
		nodes: [
			{
				id: 'orbitColor',
				type: 'colorPicker',
				params: {
					label: { v: 'Orbit Color' },
					value: { v: { r: 0.3, g: 0.7, b: 1, a: 0.5 } },
				},
			},
			{
				id: 'baseSpeed',
				type: 'slider',
				params: {
					label: { v: 'Base Speed' },
					min: { v: -5 },
					max: { v: 5 },
					step: { v: 0.01 },
					value: { v: 0.15 },
				},
			},
			{
				id: 'speedLfoFreq',
				type: 'slider',
				params: {
					label: { v: 'Speed LFO Frequency' },
					min: { v: 0.001 },
					max: { v: 1 },
					step: { v: 0.001 },
					value: { v: 0.5 },
				},
			},
			{
				id: 'speedLfoAmp',
				type: 'slider',
				params: {
					label: { v: 'Speed LFO Amplitude' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0 },
				},
			},
			{
				id: 'orbitRadius',
				type: 'slider',
				params: {
					label: { v: 'Orbit Radius' },
					min: { v: 0 },
					max: { v: 0.9 },
					step: { v: 0.01 },
					value: { v: 0.5 },
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
				id: 'speedLFO',
				type: 'wave',
				params: {
					time: { ref: 'time.time' },
					frequency: { ref: 'speedLfoFreq.value' },
					amplitude: { ref: 'speedLfoAmp.value' },
				},
			},
			{
				id: 'speedMod',
				type: 'add',
				params: {
					a: { v: 1 },
					b: { ref: 'speedLFO.value' },
				},
			},
			{
				id: 'speed',
				type: 'multiplier',
				params: {
					a: { ref: 'baseSpeed.value' },
					b: { ref: 'speedMod.sum' },
				},
			},
			{
				id: 'orbit',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					speed: { ref: 'speed.product' },
					radius: { ref: 'orbitRadius.value' },
				},
			},
			{
				id: 'cp',
				type: 'colorPointCompute',
				params: {
					point: { ref: 'orbit.point' },
					color: { ref: 'orbitColor.value' },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: 'orbitRing',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: 'orbitRadius.value' },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
				},
			},

			{
				id: 'trail',
				type: 'circle',
				renderConfig: { layer: 'paint' },
				params: {
					center: { ref: 'orbit.point' },
					radius: { v: 0.005 },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
					intervalTicks: { ref: 'linkRate.value' },
				},
			},
			{
				id: 'dot',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { ref: 'orbit.point' },
					radius: { v: 0.02 },
					color: { ref: 'orbitColor.value' },
				},
			},
		],
	},
};
