import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

// Color Shift Orbit — demonstrates the `colorShift` compute node combined
// with `colorPointArrayCompute`.
//
// A single orbit at the canvas centre (0,0) generates 3 evenly-spaced
// points. The orbit's colour is supplied via a `colorPointArrayCompute`
// node holding one centre point at (0,0) coloured red @ 0.1 opacity, so
// every generated orbit point resolves to r:1 g:0 b:0 a:0.1.
//
// Three static target colour points are assembled into a colorPointArray
// via a second `colorPointArrayCompute` node:
//   North (0, 0.2)   -> shift g and b towards 1 (cyan-ish), leave r/a
//   South (0, -0.2)  -> shift a towards 0 (fade out), leave r/g/b
//   East  (0.2, 0)   -> shift b towards 1, a towards 0.3, leave r/g
// `null` channels on a target are ignored by the colour shift.
//
// The orbit's `points` and the target array feed a `colorShift` node.
// `falloff` and `strength` are exposed as controls. The colour-shifted
// points are painted (connect dots) and drawn as live markers, alongside
// the grey orbit path and grey orbit-centre marker.

const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Color Shift Orbit',

	control: {
		nodes: [
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
			{
				id: 'orbitSpeed',
				type: 'slider',
				params: {
					label: { v: 'Orbit Speed' },
					min: { v: -5 },
					max: { v: 5 },
					step: { v: 0.01 },
					value: { v: 0.3 },
				},
			},
			{
				id: 'orbitRadius',
				type: 'slider',
				params: {
					label: { v: 'Orbit Radius' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0.55 },
				},
			},
			{
				id: 'shiftFalloff',
				type: 'slider',
				params: {
					label: { v: 'Shift Falloff' },
					min: { v: 0 },
					max: { v: 5 },
					step: { v: 0.1 },
					value: { v: 5 },
				},
			},
			{
				id: 'shiftStrength',
				type: 'slider',
				params: {
					label: { v: 'Shift Strength' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.05 },
					value: { v: 1 },
				},
			},
		],
	},
	compute: {
		nodes: [
			{ id: 'time', type: 'time', params: {} },

			// Orbit centre: single point at (0,0), red @ 0.1 opacity. This
			// colour propagates to every generated orbit point.
			{
				id: 'orbitCenter',
				type: 'colorPointArrayCompute',
				params: {
					points: {
						v: [{ v: { x: 0, y: 0, r: 1, g: 0, b: 0, a: 0.1 } }],
					},
				},
			},

			// One orbit at the centre — radius 0.15, 3 points.
			{
				id: 'orbit',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { ref: 'orbitRadius.value' },
					speed: { ref: 'orbitSpeed.value' },
					numPoints: { v: 3 },
					phase: { v: 0 },
					centerPoints: { ref: 'orbitCenter.points' },
				},
			},

			// Three static target colour points assembled into an array.
			{
				id: 'targets',
				type: 'colorPointArrayCompute',
				params: {
					points: {
						v: [
							// North
							{ v: { x: 0, y: 1, r: 0, g: 1, b: 1, a: 1 } },
							// South
							{ v: { x: 0, y: -1, r: null, g: null, b: null, a: 0 } },
							// East
							{ v: { x: 1, y: 0, r: null, g: null, b: 1, a: 1 } },
						],
					},
				},
			},

			// Pull the orbit points' colours towards the targets.
			{
				id: 'shift',
				type: 'colorShift',
				params: {
					inputPoints: { ref: 'orbit.points' },
					targetPoints: { ref: 'targets.points' },
					falloff: { ref: 'shiftFalloff.value' },
					strength: { ref: 'shiftStrength.value' },
				},
			},
		],
	},
	render: {
		nodes: [
			// Accumulated paint — link the colour-shifted points to the raw
			// orbit points so the colour shift leaves a visible trail.
			{
				id: 'shiftTrail',
				type: 'timedLineArray',
				renderConfig: { layer: 'paint' },
				params: {
					intervalTicks: { ref: 'linkRate.value' },
					colorPointsA: { ref: 'shift.points' },
					colorPointsB: { ref: 'shift.points' },
				},
			},

			// ---- Live structure (cleared each frame) ----
			// Grey orbit path centred at origin.
			{
				id: 'orbitPath',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: 'orbitRadius.value' },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.4 } },
				},
			},
			// Grey orbit-centre marker.
			{
				id: 'centerMarker',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { v: 0.02 },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
				},
			},
			// Colour-shifted orbit points.
			{
				id: 'shiftedPoints',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'shift.points' },
					radius: { v: 0.03 },
				},
			},

			// ---- Colour shift target anchor markers ----
			{
				id: 'northAnchor',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: "targets.points" },
					radius: { v: 0.025 },
				},
			}

		],
	},
};

export default graph;
