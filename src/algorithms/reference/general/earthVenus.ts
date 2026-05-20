import type { GeoArtGraph } from "../../../schema/_generated/schema-types";

// Earth-Venus spirograph algorithm.
//
// Two bodies orbit a common centre at different speeds. A line is drawn
// between them on each render tick, accumulating a spirograph pattern.
// Grey trails accumulate on the paint layer to show each planet's orbital
// path. Coloured dots on the live layer show each planet's current position.

const graph: GeoArtGraph = {
	version: "2.0",
	title: "Earth Venus",
	control: {
		nodes: [
			{
				id: "earthSpeedSlider",
				type: "slider",
				params: {
					label: { v: "Earth Speed" },
					min: { v: -5 },
					max: { v: 5 },
					value: { v: 0.2 },
					step: { v: 0.01 },
				},
			},
			{
				id: "earthDistanceSlider",
				type: "slider",
				params: {
					label: { v: "Earth Distance" },
					min: { v: 0 },
					max: { v: 1 },
					value: { v: 0.2 },
					step: { v: 0.01 },
				},
			},
			{
				id: "venusSpeedSlider",
				type: "slider",
				params: {
					label: { v: "Venus Speed" },
					min: { v: -5 },
					max: { v: 5 },
					value: { v: 0.323 },
					step: { v: 0.01 },
				},
			},
			{
				id: "venusDistanceSlider",
				type: "slider",
				params: {
					label: { v: "Venus Distance" },
					min: { v: 0 },
					max: { v: 1 },
					value: { v: 0.323 },
					step: { v: 0.01 },
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
			{
				id: "earthOrbit",
				type: "orbit",
				params: {
					time: { ref: "time.time" },
					radius: { ref: "earthDistanceSlider.value" },
					speed: { ref: "earthSpeedSlider.value" },
				},
			},
			{
				id: "venusOrbit",
				type: "orbit",
				params: {
					time: { ref: "time.time" },
					radius: { ref: "venusDistanceSlider.value" },
					speed: { ref: "venusSpeedSlider.value" },
				},
			},
			{
				id: "earthColorPoint",
				type: "colorPointCompute",
				params: {
					point: { ref: "earthOrbit.point" },
					color: { v: { r: 0.3, g: 0.7, b: 1, a: 0.8 } },
				},
			},
			{
				id: "venusColorPoint",
				type: "colorPointCompute",
				params: {
					point: { ref: "venusOrbit.point" },
					color: { v: { r: 1, g: 0.8, b: 0.2, a: 0.8 } },
				},
			},
		],
	},
	render: {
		nodes: [
			// Spirograph lines between the two planets
			{
				id: "line",
				type: "timedLine",
				renderConfig: { layer: "paint" },
				params: {
					intervalTicks: { ref: "linkRate.value" },
					colorPointA: { ref: "earthColorPoint.colorPoint" },
					colorPointB: { ref: "venusColorPoint.colorPoint" },
				},
			},

			// Current-position dots — redrawn each frame on the live layer
			{
				id: "earthDot",
				type: "circle",
				renderConfig: { layer: "live" },
				params: {
					center: { ref: "earthOrbit.point" },
					radius: { v: 0.02 },
					color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
				},
			},
			{
				id: "venusDot",
				type: "circle",
				renderConfig: { layer: "live" },
				params: {
					center: { ref: "venusOrbit.point" },
					radius: { v: 0.02 },
					color: { v: { r: 1, g: 0.8, b: 0.2, a: 1 } },
				},
			},
		],
	},
};

export default graph;
