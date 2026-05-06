// Earth3Venus — three outer nodes orbit a common centre; a single inner node orbits faster.
// Lines are painted between each outer node and the inner node.
// Orbit rings and current node positions are drawn live each frame.

import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

const OUTER_COLOR = { r: 0.3, g: 0.6, b: 1, a: 0.9 };
const RING_COLOR = { r: 0.3, g: 0.3, b: 0.35, a: 0.5 };
const DOT_RADIUS = 0.015;

export const linesThroughPointGraph: GeoArtGraph = {
	version: '2.0',
	control: {
		nodes: [
			{
				id: 'outerRadiusSlider',
				type: 'slider',
				params: {
					label: { v: 'Outer Radius' },
					min: { v: 0 },
					max: { v: 1 },
					value: { v: 0.6 },
					step: { v: 0.01 },
				},
			},
			{
				id: 'outerSpeedSlider',
				type: 'slider',
				params: {
					label: { v: 'Outer Speed' },
					min: { v: -5 },
					max: { v: 5 },
					value: { v: 1 },
					step: { v: 0.1 },
				},
			}

		],
	},
	compute: {
		nodes: [
			{ id: 'time', type: 'time', params: {} },

			// Three outer orbit nodes at evenly-spaced phases (0°, 120°, 240°)
			{
				id: 'outerOrbit1',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { ref: 'outerRadiusSlider.value' },
					speed: { ref: 'outerSpeedSlider.value' },
					phase: { v: 0 },
					numPoints: { v: 2 }
				},
			},

		],
	},
	render: {
		nodes: [
			// ── Paint layer: accumulating lines ──────────────────────────────────

			// ── Live layer: orbit rings (grey, radius tracks sliders) ─────────────
			{
				id: 'outerRing',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: 'outerRadiusSlider.value' },
					color: { v: RING_COLOR },
				},
			},


			// ── Live layer: current-position dots (colour matches colorpoint) ─────
			{
				id: 'outerDot1',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'outerOrbit1.points' },
					radius: { v: DOT_RADIUS },
					color: { v: { ...OUTER_COLOR, a: 1 } },
				},
			},

			{
				id: 'lineThroughPoint',
				type: 'linesThroughPoint',
				renderConfig: { layer: 'live' },
				params: {
					points: { ref: 'outerOrbit1.points' },
					lineLength: { v: 100 }

				},
			},

		],
	},
};
