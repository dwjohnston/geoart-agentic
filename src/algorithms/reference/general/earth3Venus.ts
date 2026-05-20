// Earth3Venus — three outer nodes orbit a common centre; a single inner node orbits faster.
// Lines are painted between each outer node and the inner node.
// Orbit rings and current node positions are drawn live each frame.

import type { GeoArtGraph } from "../../../schema/_generated/schema-types";

const OUTER_COLOR = { r: 0.3, g: 0.6, b: 1, a: 0.9 };
const INNER_COLOR = { r: 1, g: 0.7, b: 0.2, a: 0.9 };
const RING_COLOR = { r: 0.3, g: 0.3, b: 0.35, a: 0.5 };
const DOT_RADIUS = 0.015;

const graph: GeoArtGraph = {
	version: "2.0",
	title: "Earth 3 Venus",
	control: {
		nodes: [
			{
				id: "outerRadiusSlider",
				type: "slider",
				params: {
					label: { v: "Outer Radius" },
					min: { v: 0 },
					max: { v: 1 },
					value: { v: 0.6 },
					step: { v: 0.01 },
				},
			},
			{
				id: "outerSpeedSlider",
				type: "slider",
				params: {
					label: { v: "Outer Speed" },
					min: { v: -5 },
					max: { v: 5 },
					value: { v: 1 },
					step: { v: 0.1 },
				},
			},
			{
				id: "innerRadiusSlider",
				type: "slider",
				params: {
					label: { v: "Inner Radius" },
					min: { v: 0 },
					max: { v: 1 },
					value: { v: 0.3 },
					step: { v: 0.01 },
				},
			},
			{
				id: "innerSpeedSlider",
				type: "slider",
				params: {
					label: { v: "Inner Speed" },
					min: { v: -5 },
					max: { v: 5 },
					value: { v: 2.3 },
					step: { v: 0.1 },
				},
			},
			{
				id: "linkRate",
				type: "slider",
				params: {
					label: { v: "Link Rate" },
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
			{ id: "time", type: "time", params: {} },

			// Three outer orbit nodes at evenly-spaced phases (0°, 120°, 240°)
			{
				id: "outerOrbit1",
				type: "orbit",
				params: {
					time: { ref: "time.time" },
					radius: { ref: "outerRadiusSlider.value" },
					speed: { ref: "outerSpeedSlider.value" },
					phase: { v: 0 },
				},
			},
			{
				id: "outerOrbit2",
				type: "orbit",
				params: {
					time: { ref: "time.time" },
					radius: { ref: "outerRadiusSlider.value" },
					speed: { ref: "outerSpeedSlider.value" },
					phase: { v: 1 / 3 },
				},
			},
			{
				id: "outerOrbit3",
				type: "orbit",
				params: {
					time: { ref: "time.time" },
					radius: { ref: "outerRadiusSlider.value" },
					speed: { ref: "outerSpeedSlider.value" },
					phase: { v: 2 / 3 },
				},
			},

			// Single inner orbit node
			{
				id: "innerOrbit",
				type: "orbit",
				params: {
					time: { ref: "time.time" },
					radius: { ref: "innerRadiusSlider.value" },
					speed: { ref: "innerSpeedSlider.value" },
				},
			},

			// Colour wrappers for the paint timedLine nodes
			{
				id: "outerCp1",
				type: "colorPointCompute",
				params: {
					point: { ref: "outerOrbit1.point" },
					color: { v: OUTER_COLOR },
				},
			},
			{
				id: "outerCp2",
				type: "colorPointCompute",
				params: {
					point: { ref: "outerOrbit2.point" },
					color: { v: OUTER_COLOR },
				},
			},
			{
				id: "outerCp3",
				type: "colorPointCompute",
				params: {
					point: { ref: "outerOrbit3.point" },
					color: { v: OUTER_COLOR },
				},
			},
			{
				id: "innerCp",
				type: "colorPointCompute",
				params: {
					point: { ref: "innerOrbit.point" },
					color: { v: INNER_COLOR },
				},
			},
		],
	},
	render: {
		nodes: [
			// ── Paint layer: accumulating lines ──────────────────────────────────
			{
				id: "line1",
				type: "timedLine",
				renderConfig: { layer: "paint" },
				params: {
					intervalTicks: { ref: "linkRate.value" },
					colorPointA: { ref: "outerCp1.colorPoint" },
					colorPointB: { ref: "innerCp.colorPoint" },
				},
			},
			{
				id: "line2",
				type: "timedLine",
				renderConfig: { layer: "paint" },
				params: {
					intervalTicks: { ref: "linkRate.value" },
					colorPointA: { ref: "outerCp2.colorPoint" },
					colorPointB: { ref: "innerCp.colorPoint" },
				},
			},
			{
				id: "line3",
				type: "timedLine",
				renderConfig: { layer: "paint" },
				params: {
					intervalTicks: { ref: "linkRate.value" },
					colorPointA: { ref: "outerCp3.colorPoint" },
					colorPointB: { ref: "innerCp.colorPoint" },
				},
			},
			// ── Live layer: orbit rings (grey, radius tracks sliders) ─────────────
			{
				id: "outerRing",
				type: "circle",
				renderConfig: { layer: "live" },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: "outerRadiusSlider.value" },
					color: { v: RING_COLOR },
				},
			},
			{
				id: "innerRing",
				type: "circle",
				renderConfig: { layer: "live" },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: "innerRadiusSlider.value" },
					color: { v: RING_COLOR },
				},
			},

			// ── Live layer: current-position dots (colour matches colorpoint) ─────
			{
				id: "outerDot1",
				type: "circle",
				renderConfig: { layer: "live" },
				params: {
					center: { ref: "outerOrbit1.point" },
					radius: { v: DOT_RADIUS },
					color: { v: { ...OUTER_COLOR, a: 1 } },
				},
			},
			{
				id: "outerDot2",
				type: "circle",
				renderConfig: { layer: "live" },
				params: {
					center: { ref: "outerOrbit2.point" },
					radius: { v: DOT_RADIUS },
					color: { v: { ...OUTER_COLOR, a: 1 } },
				},
			},
			{
				id: "outerDot3",
				type: "circle",
				renderConfig: { layer: "live" },
				params: {
					center: { ref: "outerOrbit3.point" },
					radius: { v: DOT_RADIUS },
					color: { v: { ...OUTER_COLOR, a: 1 } },
				},
			},
			{
				id: "innerDot",
				type: "circle",
				renderConfig: { layer: "live" },
				params: {
					center: { ref: "innerOrbit.point" },
					radius: { v: DOT_RADIUS },
					color: { v: { ...INNER_COLOR, a: 1 } },
				},
			},
		],
	},
};

export default graph;
