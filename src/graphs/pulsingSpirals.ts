import type { GeoArtGraph } from '../schema/_generated/schema-types';

// Pulsing Spirals
//
// Two orbiting bodies whose radii breathe in and out, driven by lfo-control nodes.
// A third lfo-control modulates the speed of the inner orbit.
// Lines accumulate between the two bodies on the paint layer, building a
// spirograph that warps and pulses as the LFOs cycle.

export const pulsingSpiralsGraph: GeoArtGraph = {
	version: '2.0',
	control: {
		nodes: [
			// --- Inner orbit LFO (controls radius oscillation) ---
			{
				id: 'innerRadiusLfo',
				type: 'lfo-control',
				params: {
					baseValue:  { v: 0.35 },
					frequency:  { v: 0.08 },
					amplitude:  { v: 0.15 },
					waveShape:  { v: 'sine' },
				},
			},
			// --- Outer orbit LFO (controls radius oscillation) ---
			{
				id: 'outerRadiusLfo',
				type: 'lfo-control',
				params: {
					baseValue:  { v: 0.65 },
					frequency:  { v: 0.05 },
					amplitude:  { v: 0.2 },
					waveShape:  { v: 'triangle' },
				},
			},
			// --- Speed modulation LFO (modulates inner orbit speed) ---
			{
				id: 'speedLfo',
				type: 'lfo-control',
				params: {
					baseValue:  { v: 1.0 },
					frequency:  { v: 0.12 },
					amplitude:  { v: 0.0 },
					waveShape:  { v: 'sine' },
				},
			},
			// --- Colours ---
			{
				id: 'innerColor',
				type: 'colorPicker',
				params: {
					label: { v: 'Inner Color' },
					value: { v: { r: 0.2, g: 0.8, b: 1, a: 0.5 } },
				},
			},
			{
				id: 'outerColor',
				type: 'colorPicker',
				params: {
					label: { v: 'Outer Color' },
					value: { v: { r: 1, g: 0.4, b: 0.1, a: 0.5 } },
				},
			},
			// --- Base speeds ---
			{
				id: 'innerSpeedSlider',
				type: 'slider',
				params: {
					label: { v: 'Inner Speed' },
					min:   { v: -5 },
					max:   { v: 5 },
					step:  { v: 0.01 },
					value: { v: 1.0 },
				},
			},
			{
				id: 'outerSpeedSlider',
				type: 'slider',
				params: {
					label: { v: 'Outer Speed' },
					min:   { v: -5 },
					max:   { v: 5 },
					step:  { v: 0.01 },
					value: { v: 0.618 },
				},
			},
			// --- Link rate ---
			{
				id: 'linkRate',
				type: 'slider',
				params: {
					label: { v: 'Link Rate' },
					min:   { v: 1 },
					max:   { v: 120 },
					step:  { v: 1 },
					value: { v: 10 },
				},
			},
		],
	},
	compute: {
		nodes: [
			{ id: 'time', type: 'time', params: {} },

			// --- Inner radius LFO wave ---
			{
				id: 'innerRadiusWave',
				type: 'wave',
				params: {
					time:      { ref: 'time.time' },
					frequency: { ref: 'innerRadiusLfo.frequency' },
					amplitude: { ref: 'innerRadiusLfo.amplitude' },
					waveType:  { ref: 'innerRadiusLfo.waveShape' },
				},
			},
			// baseValue + wave output → dynamic radius
			{
				id: 'innerRadius',
				type: 'add',
				params: {
					a: { ref: 'innerRadiusLfo.baseValue' },
					b: { ref: 'innerRadiusWave.value' },
				},
			},

			// --- Outer radius LFO wave ---
			{
				id: 'outerRadiusWave',
				type: 'wave',
				params: {
					time:      { ref: 'time.time' },
					frequency: { ref: 'outerRadiusLfo.frequency' },
					amplitude: { ref: 'outerRadiusLfo.amplitude' },
					waveType:  { ref: 'outerRadiusLfo.waveShape' },
				},
			},
			{
				id: 'outerRadius',
				type: 'add',
				params: {
					a: { ref: 'outerRadiusLfo.baseValue' },
					b: { ref: 'outerRadiusWave.value' },
				},
			},

			// --- Speed modulation: speedLfo drives inner orbit speed ---
			{
				id: 'speedModWave',
				type: 'wave',
				params: {
					time:      { ref: 'time.time' },
					frequency: { ref: 'speedLfo.frequency' },
					amplitude: { ref: 'speedLfo.amplitude' },
					waveType:  { ref: 'speedLfo.waveShape' },
				},
			},
			// speedLfo.baseValue + oscillation → multiplier factor
			{
				id: 'speedModFactor',
				type: 'add',
				params: {
					a: { ref: 'speedLfo.baseValue' },
					b: { ref: 'speedModWave.value' },
				},
			},
			// Final inner speed = base speed × modulation factor
			{
				id: 'innerSpeed',
				type: 'multiplier',
				params: {
					a: { ref: 'innerSpeedSlider.value' },
					b: { ref: 'speedModFactor.sum' },
				},
			},

			// --- Orbits ---
			{
				id: 'innerOrbit',
				type: 'orbit',
				params: {
					time:   { ref: 'time.time' },
					speed:  { ref: 'innerSpeed.product' },
					radius: { ref: 'innerRadius.sum' },
				},
			},
			{
				id: 'outerOrbit',
				type: 'orbit',
				params: {
					time:   { ref: 'time.time' },
					speed:  { ref: 'outerSpeedSlider.value' },
					radius: { ref: 'outerRadius.sum' },
				},
			},

			// --- Color points ---
			{
				id: 'innerCP',
				type: 'colorPointCompute',
				params: {
					point: { ref: 'innerOrbit.point' },
					color: { ref: 'innerColor.value' },
				},
			},
			{
				id: 'outerCP',
				type: 'colorPointCompute',
				params: {
					point: { ref: 'outerOrbit.point' },
					color: { ref: 'outerColor.value' },
				},
			},
		],
	},
	render: {
		nodes: [
			// --- Accumulating spirograph lines ---
			{
				id: 'spiralLine',
				type: 'timedLine',
				renderConfig: { layer: 'paint' },
				params: {
					intervalTicks: { ref: 'linkRate.value' },
					colorPointA:   { ref: 'innerCP.colorPoint' },
					colorPointB:   { ref: 'outerCP.colorPoint' },
				},
			},
			// --- Orbit path rings (live) ---
			{
				id: 'innerOrbitRing',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: 'innerRadius.sum' },
					color:  { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
				},
			},
			{
				id: 'outerOrbitRing',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: 'outerRadius.sum' },
					color:  { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
				},
			},
			// --- Position dots (live) ---
			{
				id: 'innerDot',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { ref: 'innerOrbit.point' },
					radius: { v: 0.02 },
					color:  { ref: 'innerColor.value' },
				},
			},
			{
				id: 'outerDot',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { ref: 'outerOrbit.point' },
					radius: { v: 0.016 },
					color:  { ref: 'outerColor.value' },
				},
			},
		],
	},
};
