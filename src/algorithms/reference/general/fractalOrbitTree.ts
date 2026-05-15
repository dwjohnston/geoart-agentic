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
// Colour shifters: this schema has no dedicated "colour shifter" node, so
// the shifters are expressed as `colorPointCompute` colour anchors pinned
// at fixed clock positions (12 / 4 / 8 o'clock + centre). Each carries a
// target colour and is rendered as a soft disc; timedLines link them to the
// centre so the accumulated paint visibly shifts colour towards each anchor.
// The centre anchor shifts opacity towards 0 (transparent).
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

			// ---- Colour shifters (anchors) ----
			{
				id: 'shiftRadius',
				type: 'slider',
				params: {
					label: { v: 'Shifter Disc Size' },
					min: { v: 0 },
					max: { v: 0.1 },
					step: { v: 0.005 },
					value: { v: 0.03 },
				},
			},
			{
				id: 'shifterDistance',
				type: 'slider',
				params: {
					label: { v: 'Shifter Distance' },
					min: { v: 0 },
					max: { v: 0.9 },
					step: { v: 0.01 },
					value: { v: 0.8 },
				},
			},
			{
				id: 'topShiftColor',
				type: 'colorPicker',
				params: {
					label: { v: '12 o\'clock -> Yellow' },
					value: { v: { r: 1, g: 1, b: 0, a: 0.5 } },
				},
			},
			{
				id: 'fourShiftColor',
				type: 'colorPicker',
				params: {
					label: { v: '4 o\'clock -> Green' },
					value: { v: { r: 0, g: 0.8, b: 0.2, a: 0.5 } },
				},
			},
			{
				id: 'eightShiftColor',
				type: 'colorPicker',
				params: {
					label: { v: '8 o\'clock -> Light Pink' },
					value: { v: { r: 1, g: 0.7, b: 0.8, a: 0.5 } },
				},
			},
			{
				id: 'centerShiftColor',
				type: 'colorPicker',
				params: {
					label: { v: 'Centre -> Transparent' },
					value: { v: { r: 1, g: 1, b: 1, a: 0 } },
				},
			},
		],
	},
	compute: {
		nodes: [
			{ id: 'time', type: 'time', params: {} },

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
						v: [{ v: { x: 0, y: 0, r: 1, g: 0, b: 0, a: 0.25 } }],
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
					centerPoints: { ref: 'l1Orbit.points' },
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
					centerPoints: { ref: 'l2Orbit.points' },
				},
			},

			// ---- Colour shifter anchors ----
			// 12 o'clock — top of canvas (y = -distance), shifts towards yellow.
			{
				id: 'topShifter',
				type: 'colorPointCompute',
				params: {
					point: { v: { x: 0, y: -0.8 } },
					color: { ref: 'topShiftColor.value' },
				},
			},
			// 4 o'clock — lower right, shifts towards green.
			{
				id: 'fourShifter',
				type: 'colorPointCompute',
				params: {
					point: { v: { x: 0.69, y: 0.4 } },
					color: { ref: 'fourShiftColor.value' },
				},
			},
			// 8 o'clock — lower left, shifts towards light pink.
			{
				id: 'eightShifter',
				type: 'colorPointCompute',
				params: {
					point: { v: { x: -0.69, y: 0.4 } },
					color: { ref: 'eightShiftColor.value' },
				},
			},
			// Centre — shifts opacity towards 0.
			{
				id: 'centerShifter',
				type: 'colorPointCompute',
				params: {
					point: { v: { x: 0, y: 0 } },
					color: { ref: 'centerShiftColor.value' },
				},
			},
		],
	},
	render: {
		nodes: [
			// Accumulated paint — link the centre to each colour shifter so the
			// trail visibly shifts colour towards each anchor over time.
			{
				id: 'shiftLineTop',
				type: 'timedLineArray',
				renderConfig: { layer: 'paint' },
				params: {
					intervalTicks: { ref: 'linkRate.value' },
					colorPointsA: { ref: 'l1Orbit.points' },
					colorPointsB: { ref: 'l2Orbit.points' },
				},
			},
			{
				id: 'shiftLineFour',
				type: 'timedLineArray',
				renderConfig: { layer: 'paint' },
				params: {
					intervalTicks: { ref: 'linkRate.value' },
					colorPointsA: { ref: 'l2Orbit.points' },
					colorPointsB: { ref: 'l3Orbit.points' },
				},
			},
			{
				id: 'shiftLineEight',
				type: 'timedLineArray',
				renderConfig: { layer: 'paint' },
				params: {
					intervalTicks: { ref: 'linkRate.value' },
					colorPointsA: { ref: 'centerShifter.points' },
					colorPointsB: { ref: 'eightShifter.points' },
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
			// Level 1 points — red @ 0.25.
			{
				id: 'l1Points',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'l1Orbit.points' },
					radius: { v: 0.03 },
					color: { ref: 'l1Color.value' },
				},
			},
			// Level 2 points.
			{
				id: 'l2Points',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'l2Orbit.points' },
					radius: { v: 0.02 },
					color: { ref: 'l2Color.value' },
				},
			},
			// Level 3 points.
			{
				id: 'l3Points',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'l3Orbit.points' },
					radius: { v: 0.012 },
					color: { ref: 'l3Color.value' },
				},
			},

			// ---- Colour shifter discs ----
			{
				id: 'topShifterDisc',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: -0.8 } },
					radius: { ref: 'shiftRadius.value' },
					color: { ref: 'topShiftColor.value' },
				},
			},
			{
				id: 'fourShifterDisc',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0.69, y: 0.4 } },
					radius: { ref: 'shiftRadius.value' },
					color: { ref: 'fourShiftColor.value' },
				},
			},
			{
				id: 'eightShifterDisc',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: -0.69, y: 0.4 } },
					radius: { ref: 'shiftRadius.value' },
					color: { ref: 'eightShiftColor.value' },
				},
			},
			{
				id: 'centerShifterDisc',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: 'shiftRadius.value' },
					color: { ref: 'centerShiftColor.value' },
				},
			},
		],
	},
};
