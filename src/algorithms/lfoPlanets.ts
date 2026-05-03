import type { GeoArtGraph } from '../schema/_generated/schema-types';

export const lfoPlanetsGraph: GeoArtGraph = {
	version: '2.0',
	control: {
		nodes: [
			{
				id: 'earthWaveType',
				type: 'dropdown',
				params: {
					label: { v: 'Wave Type' },
					"value": { v: "sine" },
					options: {
						"v": ["sine", "square", "saw", "reverse-saw", "triangle"].map((v => ({ v })))
					}
				},
			},
			{
				id: 'venusWaveType',
				type: 'dropdown',
				params: {
					label: { v: 'Wave Type' },
					"value": { v: "sine" },
					options: {
						"v": ["sine", "square", "saw", "reverse-saw", "triangle"].map((v => ({ v })))
					}
				},
			},
			{
				id: 'earthColor',
				type: 'colorPicker',
				params: {
					label: { v: 'Earth Color' },
					value: { v: { r: 0.3, g: 0.7, b: 1, a: 0.5 } },
				},
			},
			{
				id: 'earthBaseSpeed',
				type: 'slider',
				params: {
					label: { v: 'Earth Base Speed' },
					min: { v: -2 },
					max: { v: 2 },
					step: { v: 0.01 },
					value: { v: 1.0 },
				},
			},
			{
				id: 'earthSpeedFreq',
				type: 'slider',
				params: {
					label: { v: 'Earth Speed LFO Freq' },
					min: { v: 0.001 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0.3 },
				},
			},
			{
				id: 'earthSpeedAmp',
				type: 'slider',
				params: {
					label: { v: 'Earth Speed LFO Amp' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0 },
				},
			},
			{
				id: 'earthBaseRadius',
				type: 'slider',
				params: {
					label: { v: 'Earth Base Radius' },
					min: { v: 0 },
					max: { v: 0.5 },
					step: { v: 0.01 },
					value: { v: 0.3 },
				},
			},
			{
				id: 'earthRadiusFreq',
				type: 'slider',
				params: {
					label: { v: 'Earth Radius LFO Freq' },
					min: { v: 0.001 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0.1 },
				},
			},
			{
				id: 'earthRadiusAmp',
				type: 'slider',
				params: {
					label: { v: 'Earth Radius LFO Amp' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0 },
				},
			},
			{
				id: 'venusColor',
				type: 'colorPicker',
				params: {
					label: { v: 'Venus Color' },
					value: { v: { r: 1, g: 0.8, b: 0.2, a: 0.5 } },
				},
			},
			{
				id: 'venusBaseSpeed',
				type: 'slider',
				params: {
					label: { v: 'Venus Base Speed' },
					min: { v: -2 },
					max: { v: 2 },
					step: { v: 0.01 },
					value: { v: 1.6 },
				},
			},
			{
				id: 'venusSpeedFreq',
				type: 'slider',
				params: {
					label: { v: 'Venus Speed LFO Freq' },
					min: { v: 0.001 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0.47 },
				},
			},
			{
				id: 'venusSpeedAmp',
				type: 'slider',
				params: {
					label: { v: 'Venus Speed LFO Amp' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0 },
				},
			},
			{
				id: 'venusBaseRadius',
				type: 'slider',
				params: {
					label: { v: 'Venus Base Radius' },
					min: { v: 0 },
					max: { v: 0.5 },
					step: { v: 0.01 },
					value: { v: 0.25 },
				},
			},
			{
				id: 'venusRadiusFreq',
				type: 'slider',
				params: {
					label: { v: 'Venus Radius LFO Freq' },
					min: { v: 0.001 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0.17 },
				},
			},
			{
				id: 'venusRadiusAmp',
				type: 'slider',
				params: {
					label: { v: 'Venus Radius LFO Amp' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0 },
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
				id: 'earthSpeedLFO',
				type: 'wave',
				params: {
					time: { ref: 'time.time' },
					frequency: { ref: 'earthSpeedFreq.value' },
					amplitude: { ref: 'earthSpeedAmp.value' },

				},
			},
			{
				id: 'earthRadiusLFO',
				type: 'wave',
				params: {
					time: { ref: 'time.time' },
					frequency: { ref: 'earthRadiusFreq.value' },
					amplitude: { ref: 'earthRadiusAmp.value' },
					waveType: { ref: "earthWaveType.value" }
				},
			},
			{
				id: 'venusSpeedLFO',
				type: 'wave',
				params: {
					time: { ref: 'time.time' },
					frequency: { ref: 'venusSpeedFreq.value' },
					amplitude: { ref: 'venusSpeedAmp.value' },
				},
			},
			{
				id: 'venusRadiusLFO',
				type: 'wave',
				params: {
					time: { ref: 'time.time' },
					frequency: { ref: 'venusRadiusFreq.value' },
					amplitude: { ref: 'venusRadiusAmp.value' },
					waveType: { ref: "venusWaveType.value" }
				},
			},
			{
				id: 'earthSpeedMod',
				type: 'add',
				params: {
					a: { v: 1 },
					b: { ref: 'earthSpeedLFO.value' },
				},
			},
			{
				id: 'earthSpeed',
				type: 'multiplier',
				params: {
					a: { ref: 'earthBaseSpeed.value' },
					b: { ref: 'earthSpeedMod.sum' },
				},
			},
			{
				id: 'earthRadiusMod',
				type: 'add',
				params: {
					a: { v: 1 },
					b: { ref: 'earthRadiusLFO.value' },
				},
			},
			{
				id: 'earthRadius',
				type: 'multiplier',
				params: {
					a: { ref: 'earthBaseRadius.value' },
					b: { ref: 'earthRadiusMod.sum' },
				},
			},
			{
				id: 'venusSpeedMod',
				type: 'add',
				params: {
					a: { v: 1 },
					b: { ref: 'venusSpeedLFO.value' },
				},
			},
			{
				id: 'venusSpeed',
				type: 'multiplier',
				params: {
					a: { ref: 'venusBaseSpeed.value' },
					b: { ref: 'venusSpeedMod.sum' },
				},
			},
			{
				id: 'venusRadiusMod',
				type: 'add',
				params: {
					a: { v: 1 },
					b: { ref: 'venusRadiusLFO.value' },
				},
			},
			{
				id: 'venusRadius',
				type: 'multiplier',
				params: {
					a: { ref: 'venusBaseRadius.value' },
					b: { ref: 'venusRadiusMod.sum' },
				},
			},
			{
				id: 'earthOrbit',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					speed: { ref: 'earthSpeed.product' },
					radius: { ref: 'earthRadius.product' },
				},
			},
			{
				id: 'venusOrbit',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					speed: { ref: 'venusSpeed.product' },
					radius: { ref: 'venusRadius.product' },
				},
			},
			{
				id: 'earthCP',
				type: 'colorPointCompute',
				params: {
					point: { ref: 'earthOrbit.point' },
					color: { ref: 'earthColor.value' },
				},
			},
			{
				id: 'venusCP',
				type: 'colorPointCompute',
				params: {
					point: { ref: 'venusOrbit.point' },
					color: { ref: 'venusColor.value' },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: 'line',
				type: 'timedLine',
				renderConfig: { layer: 'paint' },
				params: {
					intervalTicks: { ref: 'linkRate.value' },
					colorPointA: { ref: 'earthCP.colorPoint' },
					colorPointB: { ref: 'venusCP.colorPoint' },
				},
			},
			{
				id: 'earthOrbitPath',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: 'earthRadius.product' },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
				},
			},
			{
				id: 'venusOrbitPath',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: 'venusRadius.product' },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
				},
			},
			{
				id: 'earthDot',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { ref: 'earthOrbit.point' },
					radius: { v: 0.02 },
					color: { ref: 'earthColor.value' },
				},
			},
			{
				id: 'venusDot',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { ref: 'venusOrbit.point' },
					radius: { v: 0.016 },
					color: { ref: 'venusColor.value' },
				},
			},
		],
	},
};
