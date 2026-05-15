import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

// Fractal Orbit Tree — a 3-level self-similar orbit structure.
//
// Level 1 (root):  one orbit centred at (0,0), rendered red @ 0.25 opacity,
//                   producing 3 evenly-spaced points.
// Level 2:          one orbit whose centres ARE the 3 level-1 points
//                   (driven via `centerPoints`), each producing 3 points -> 9.
// Level 3:          one orbit whose centres ARE the 9 level-2 points,
//                   each producing 3 points -> 27.
//
// The orbit compute node generates one sub-orbit per centre point and
// flattens every generated point into its `points` output, so a single
// orbit node per level expresses the whole fractal tier. Each level's
// `points` output is fed straight into the next level's `centerPoints`.
//
// Colour shift: each level's points pass through a `colorShift` node before
// being painted/rendered. Four positional anchors pull the colour of nearby
// points by inverse-distance weighting: 12 o'clock -> yellow, 4 o'clock ->
// green, 8 o'clock -> light pink, and a centre anchor that shifts only the
// alpha channel towards 0 (transparent). `falloff` and `strength` are exposed
// as controls.
//
// Every tunable parameter is exposed as a control node and wired in by ref.

export const fractalOrbitTreeGraph: GeoArtGraph = {
	version: '2.0',
	control: {
		nodes: [
			// ---- Global ----
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
				id: 'pointsPerOrbit',
				type: 'slider',
				params: {
					label: { v: 'Points Per Orbit' },
					min: { v: 1 },
					max: { v: 8 },
					step: { v: 1 },
					value: { v: 3 },
				},
			},

			// ---- Level 1 ----
			{
				id: 'l1Radius',
				type: 'slider',
				params: {
					label: { v: 'L1 Radius' },
					min: { v: 0 },
					max: { v: 0.5 },
					step: { v: 0.01 },
					value: { v: 0.35 },
				},
			},
			{
				id: 'l1Speed',
				type: 'slider',
				params: {
					label: { v: 'L1 Speed' },
					min: { v: -5 },
					max: { v: 5 },
					step: { v: 0.01 },
					value: { v: 0.4 },
				},
			},
			{
				id: 'l1Eccentricity',
				type: 'slider',
				params: {
					label: { v: 'L1 Eccentricity' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0 },
				},
			},
			{
				id: 'l1Tilt',
				type: 'slider',
				params: {
					label: { v: 'L1 Tilt' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0 },
				},
			},
			{
				id: 'l1Color',
				type: 'colorPicker',
				params: {
					label: { v: 'L1 Color' },
					value: { v: { r: 1, g: 0, b: 0, a: 0.25 } },
				},
			},

			// ---- Level 2 ----
			{
				id: 'l2Radius',
				type: 'slider',
				params: {
					label: { v: 'L2 Radius' },
					min: { v: 0 },
					max: { v: 0.3 },
					step: { v: 0.01 },
					value: { v: 0.16 },
				},
			},
			{
				id: 'l2Speed',
				type: 'slider',
				params: {
					label: { v: 'L2 Speed' },
					min: { v: -5 },
					max: { v: 5 },
					step: { v: 0.01 },
					value: { v: 1.1 },
				},
			},
			{
				id: 'l2Eccentricity',
				type: 'slider',
				params: {
					label: { v: 'L2 Eccentricity' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0 },
				},
			},
			{
				id: 'l2Tilt',
				type: 'slider',
				params: {
					label: { v: 'L2 Tilt' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0 },
				},
			},
			{
				id: 'l2Color',
				type: 'colorPicker',
				params: {
					label: { v: 'L2 Color' },
					value: { v: { r: 0.2, g: 0.6, b: 1, a: 0.4 } },
				},
			},

			// ---- Level 3 ----
			{
				id: 'l3Radius',
				type: 'slider',
				params: {
					label: { v: 'L3 Radius' },
					min: { v: 0 },
					max: { v: 0.15 },
					step: { v: 0.005 },
					value: { v: 0.06 },
				},
			},
			{
				id: 'l3Speed',
				type: 'slider',
				params: {
					label: { v: 'L3 Speed' },
					min: { v: -5 },
					max: { v: 5 },
					step: { v: 0.01 },
					value: { v: 2.6 },
				},
			},
			{
				id: 'l3Eccentricity',
				type: 'slider',
				params: {
					label: { v: 'L3 Eccentricity' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0 },
				},
			},
			{
				id: 'l3Tilt',
				type: 'slider',
				params: {
					label: { v: 'L3 Tilt' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0 },
				},
			},
			{
				id: 'l3Color',
				type: 'colorPicker',
				params: {
					label: { v: 'L3 Color' },
					value: { v: { r: 1, g: 1, b: 1, a: 0.5 } },
				},
			},

			// ---- Colour shift ----
			{
				id: 'shiftFalloff',
				type: 'slider',
				params: {
					label: { v: 'Shift Falloff' },
					min: { v: 0 },
					max: { v: 5 },
					step: { v: 0.1 },
					value: { v: 2 },
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


			{
				id: "center",
				type: "colorPointCompute",
				params: {
					color: { ref: "l1Color.value" },
					point: { v: { x: 0, y: 0 } }
				}
			},
			// Level 1 — single root orbit at the canvas centre (0,0).
			{
				id: 'l1Orbit',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { ref: 'l1Radius.value' },
					speed: { ref: 'l1Speed.value' },
					numPoints: { ref: 'pointsPerOrbit.value' },
					eccentricity: { ref: 'l1Eccentricity.value' },
					tilt: { ref: 'l1Tilt.value' },
					phase: { v: 0 },
					centerPoints: {
						ref: "center.points"
					},
				},
			},

			// Level 2 — one orbit per level-1 point (3 -> 9 points).
			{
				id: 'l2Orbit',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { ref: 'l2Radius.value' },
					speed: { ref: 'l2Speed.value' },
					numPoints: { ref: 'pointsPerOrbit.value' },
					eccentricity: { ref: 'l2Eccentricity.value' },
					tilt: { ref: 'l2Tilt.value' },
					phase: { v: 0 },
					centerPoints: { ref: 'l1Shift.points' },
				},
			},

			// Level 3 — one orbit per level-2 point (9 -> 27 points).
			{
				id: 'l3Orbit',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { ref: 'l3Radius.value' },
					speed: { ref: 'l3Speed.value' },
					numPoints: { ref: 'pointsPerOrbit.value' },
					eccentricity: { ref: 'l3Eccentricity.value' },
					tilt: { ref: 'l3Tilt.value' },
					phase: { v: 0 },
					centerPoints: { ref: 'l2Shift.points' },
				},
			},

			// ---- Colour shift ----
			// Positional anchors pull nearby points' colour by inverse-distance.
			// The centre anchor sets r/g/b to null so only alpha shifts -> 0.
			{
				id: 'l1Shift',
				type: 'colorShift',
				params: {
					inputPoints: { ref: 'l1Orbit.points' },
					targetPoints: {
						v: [
							{ v: { x: 0, y: -0.8, r: 1, g: 1, b: 0, a: 0.5 } },
							{ v: { x: 0.69, y: 0.4, r: 0, g: 0.8, b: 0.2, a: 0.5 } },
							{ v: { x: -0.69, y: 0.4, r: 1, g: 0.7, b: 0.8, a: 0.5 } },
							{ v: { x: 0, y: 0, r: null, g: null, b: null, a: 0 } },
						],
					},
					falloff: { ref: 'shiftFalloff.value' },
					strength: { ref: 'shiftStrength.value' },
				},
			},
			{
				id: 'l2Shift',
				type: 'colorShift',
				params: {
					inputPoints: { ref: 'l2Orbit.points' },
					targetPoints: {
						v: [
							{ v: { x: 0, y: -0.8, r: 1, g: 1, b: 0, a: 0.5 } },
							{ v: { x: 0.69, y: 0.4, r: 0, g: 0.8, b: 0.2, a: 0.5 } },
							{ v: { x: -0.69, y: 0.4, r: 1, g: 0.7, b: 0.8, a: 0.5 } },
							{ v: { x: 0, y: 0, r: null, g: null, b: null, a: 0 } },
						],
					},
					falloff: { ref: 'shiftFalloff.value' },
					strength: { ref: 'shiftStrength.value' },
				},
			},
			{
				id: 'l3Shift',
				type: 'colorShift',
				params: {
					inputPoints: { ref: 'l3Orbit.points' },
					targetPoints: {
						v: [
							{ v: { x: 0, y: -0.8, r: 1, g: 1, b: 0, a: 0.5 } },
							{ v: { x: 0.69, y: 0.4, r: 0, g: 0.8, b: 0.2, a: 0.5 } },
							{ v: { x: -0.69, y: 0.4, r: 1, g: 0.7, b: 0.8, a: 0.5 } },
							{ v: { x: 0, y: 0, r: null, g: null, b: null, a: 0 } },
						],
					},
					falloff: { ref: 'shiftFalloff.value' },
					strength: { ref: 'shiftStrength.value' },
				},
			},
		],
	},
	render: {
		nodes: [
			// Accumulated paint — link consecutive levels of colour-shifted
			// points so the trail visibly shifts colour towards each anchor.
			{
				id: 'shiftLineL1L2',
				type: 'timedLineArray',
				renderConfig: { layer: 'paint' },
				params: {
					intervalTicks: { ref: 'linkRate.value' },
					colorPointsA: { ref: 'l1Shift.points' },
					colorPointsB: { ref: 'l2Shift.points' },
				},
			},
			{
				id: 'shiftLineL2L3',
				type: 'timedLineArray',
				renderConfig: { layer: 'paint' },
				params: {
					intervalTicks: { ref: 'linkRate.value' },
					colorPointsA: { ref: 'l2Shift.points' },
					colorPointsB: { ref: 'l3Shift.points' },
				},
			},

			// ---- Live structure (cleared each frame) ----
			// Level 1 ring path centred at origin.
			{
				id: 'l1Path',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: 'l1Radius.value' },
					eccentricity: { ref: 'l1Eccentricity.value' },
					tilt: { ref: 'l1Tilt.value' },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.3 } },
				},
			},
			// Level 1 points — colour-shifted.
			{
				id: 'l1Points',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'l1Shift.points' },
					radius: { v: 0.03 },
				},
			},
			// Level 2 points — colour-shifted.
			{
				id: 'l2Points',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'l2Shift.points' },
					radius: { v: 0.02 },
				},
			},
			// Level 3 points — colour-shifted.
			{
				id: 'l3Points',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'l3Shift.points' },
					radius: { v: 0.012 },
				},
			},

			// ---- Colour shift anchor markers ----
			{
				id: 'topAnchorDisc',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: -0.8 } },
					radius: { v: 0.03 },
					color: { v: { r: 1, g: 1, b: 0, a: 0.5 } },
				},
			},
			{
				id: 'fourAnchorDisc',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0.69, y: 0.4 } },
					radius: { v: 0.03 },
					color: { v: { r: 0, g: 0.8, b: 0.2, a: 0.5 } },
				},
			},
			{
				id: 'eightAnchorDisc',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: -0.69, y: 0.4 } },
					radius: { v: 0.03 },
					color: { v: { r: 1, g: 0.7, b: 0.8, a: 0.5 } },
				},
			},
			{
				id: 'centerAnchorDisc',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { v: 0.03 },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.2 } },
				},
			},
		],
	},
};
