import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Celestial Harmonium',

	control: {
		nodes: [
			{
				id: 'spinSpeed',
				type: 'slider',
				params: {
					label: { v: 'Spin Speed' },
					min: { v: -5 },
					max: { v: 5 },
					step: { v: 0.01 },
					value: { v: 1.0 },
				},
			},
			{
				id: 'pointCount',
				type: 'slider',
				params: {
					label: { v: 'Points' },
					min: { v: 3 },
					max: { v: 24 },
					step: { v: 1 },
					value: { v: 10 },
				},
			},
			{
				id: 'pulseFreq',
				type: 'slider',
				params: {
					label: { v: 'Pulse Freq' },
					min: { v: 0.1 },
					max: { v: 10 },
					step: { v: 0.1 },
					value: { v: 1.5 },
				},
			},
			{
				id: 'pulseAmp',
				type: 'slider',
				params: {
					label: { v: 'Pulse Amp' },
					min: { v: 0 },
					max: { v: 0.3 },
					step: { v: 0.01 },
					value: { v: 0.08 },
				},
			},
			{
				id: 'radiusInner',
				type: 'slider',
				params: {
					label: { v: 'Inner Radius' },
					min: { v: 0.05 },
					max: { v: 0.7 },
					step: { v: 0.01 },
					value: { v: 0.28 },
				},
			},
			{
				id: 'radiusMid',
				type: 'slider',
				params: {
					label: { v: 'Mid Radius' },
					min: { v: 0.1 },
					max: { v: 0.9 },
					step: { v: 0.01 },
					value: { v: 0.5 },
				},
			},
			{
				id: 'radiusOuter',
				type: 'slider',
				params: {
					label: { v: 'Outer Radius' },
					min: { v: 0.2 },
					max: { v: 1.0 },
					step: { v: 0.01 },
					value: { v: 0.75 },
				},
			},
			{
				id: 'trailRate',
				type: 'slider',
				params: {
					label: { v: 'Trail Rate' },
					min: { v: 1 },
					max: { v: 60 },
					step: { v: 1 },
					value: { v: 6 },
				},
			},
			{
				id: 'connectMode',
				type: 'timedLineArrayModeSelector',
				params: {
					label: { v: 'Weave Mode' },
					value: { v: 'all-to-all' },
				},
			},
			{
				id: 'intervalMode',
				type: 'timedLineArrayIntervalModeSelector',
				params: {
					label: { v: 'Interval Mode' },
					value: { v: 'all' },
				},
			},
		],
	},

	compute: {
		nodes: [
			{ id: 'time', type: 'time', params: {} },

			// Breathing pulse
			{
				id: 'pulseWave',
				type: 'wave',
				params: {
					time: { ref: 'time.time' },
					waveType: { v: 'sine' },
					frequency: { ref: 'pulseFreq.value' },
					amplitude: { v: 1 },
					phase: { v: 0 },
				},
			},
			{
				id: 'pulseOffset',
				type: 'multiplier',
				params: {
					a: { ref: 'pulseWave.value' },
					b: { ref: 'pulseAmp.value' },
				},
			},

			// Pulse-modulated radii — all rings breathe in phase
			{
				id: 'rInner',
				type: 'add',
				params: {
					a: { ref: 'radiusInner.value' },
					b: { ref: 'pulseOffset.product' },
				},
			},
			{
				id: 'rMid',
				type: 'add',
				params: {
					a: { ref: 'radiusMid.value' },
					b: { ref: 'pulseOffset.product' },
				},
			},
			{
				id: 'rOuter',
				type: 'add',
				params: {
					a: { ref: 'radiusOuter.value' },
					b: { ref: 'pulseOffset.product' },
				},
			},

			// Differential speeds — outer rings counter-rotate or lag
			{
				id: 'speedMid',
				type: 'multiplier',
				params: {
					a: { ref: 'spinSpeed.value' },
					b: { v: -0.7 },
				},
			},
			{
				id: 'speedOuter',
				type: 'multiplier',
				params: {
					a: { ref: 'spinSpeed.value' },
					b: { v: 0.45 },
				},
			},

			// Coloured centre points — colour propagates to orbit output
			{
				id: 'cpInner',
				type: 'colorPointArrayCompute',
				params: {
					points: {
						v: [{ v: { x: 0, y: 0, r: 1, g: 0.3, b: 0.1, a: 0.8 } }],
					},
				},
			},
			{
				id: 'cpMid',
				type: 'colorPointArrayCompute',
				params: {
					points: {
						v: [{ v: { x: 0, y: 0, r: 0.1, g: 0.9, b: 0.3, a: 0.7 } }],
					},
				},
			},
			{
				id: 'cpOuter',
				type: 'colorPointArrayCompute',
				params: {
					points: {
						v: [{ v: { x: 0, y: 0, r: 0.2, g: 0.1, b: 1, a: 0.5 } }],
					},
				},
			},

			// Three orbital rings sharing a common centre
			{
				id: 'ring1',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { ref: 'rInner.sum' },
					speed: { ref: 'spinSpeed.value' },
					numPoints: { ref: 'pointCount.value' },
					phase: { v: 0 },
					centerPoints: { ref: 'cpInner.points' },
				},
			},
			{
				id: 'ring2',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { ref: 'rMid.sum' },
					speed: { ref: 'speedMid.product' },
					numPoints: { ref: 'pointCount.value' },
					phase: { v: 0.15 },
					centerPoints: { ref: 'cpMid.points' },
				},
			},
			{
				id: 'ring3',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { ref: 'rOuter.sum' },
					speed: { ref: 'speedOuter.product' },
					numPoints: { ref: 'pointCount.value' },
					phase: { v: 0.3 },
					centerPoints: { ref: 'cpOuter.points' },
				},
			},
		],
	},

	render: {
		nodes: [
			// ---- Paint layer: woven orbital trails ----
			{
				id: 'weave12',
				type: 'timedLineArray',
				renderConfig: { layer: 'paint' },
				params: {
					intervalTicks: { ref: 'trailRate.value' },
					colorPointsA: { ref: 'ring1.points' },
					colorPointsB: { ref: 'ring2.points' },
					mode: { ref: 'connectMode.value' },
					intervalMode: { ref: 'intervalMode.value' },
				},
			},
			{
				id: 'weave23',
				type: 'timedLineArray',
				renderConfig: { layer: 'paint' },
				params: {
					intervalTicks: { ref: 'trailRate.value' },
					colorPointsA: { ref: 'ring2.points' },
					colorPointsB: { ref: 'ring3.points' },
					mode: { ref: 'connectMode.value' },
					intervalMode: { ref: 'intervalMode.value' },
				},
			},
			{
				id: 'weave13',
				type: 'timedLineArray',
				renderConfig: { layer: 'paint' },
				params: {
					intervalTicks: { ref: 'trailRate.value' },
					colorPointsA: { ref: 'ring1.points' },
					colorPointsB: { ref: 'ring3.points' },
					mode: { ref: 'connectMode.value' },
					intervalMode: { ref: 'intervalMode.value' },
				},
			},

			// ---- Live layer: orbit paths ----
			{
				id: 'pathInner',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: 'radiusInner.value' },
					color: { v: { r: 0.3, g: 0.1, b: 0.05, a: 0.25 } },
				},
			},
			{
				id: 'pathMid',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: 'radiusMid.value' },
					color: { v: { r: 0.05, g: 0.3, b: 0.1, a: 0.2 } },
				},
			},
			{
				id: 'pathOuter',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: 'radiusOuter.value' },
					color: { v: { r: 0.05, g: 0.05, b: 0.3, a: 0.15 } },
				},
			},

			// ---- Live layer: orbital nodes ----
			{
				id: 'dotsInner',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'ring1.points' },
					radius: { v: 0.018 },
				},
			},
			{
				id: 'dotsMid',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'ring2.points' },
					radius: { v: 0.018 },
				},
			},
			{
				id: 'dotsOuter',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'ring3.points' },
					radius: { v: 0.018 },
				},
			},
		],
	},
};

export default graph;
