import type { GeoArtGraph } from "../_generated/schema-types";

export const minimalSchema: GeoArtGraph = {
	version: "2.0",
	control: {
		nodes: [
			{
				id: "speedSlider",
				type: "slider",
				params: {
					label: { v: "Speed" },
					min: { v: -5 },
					max: { v: 5 },
					value: { v: 0.2 },
					step: { v: 0.01 },
				},
			},
		],
	},
	compute: {
		nodes: [
			{ id: "time", type: "time", params: {} },
			{
				id: "orbit",
				type: "orbit",
				params: {
					time: { ref: "time.time" },
					radius: { v: 0.3 },
					speed: { ref: "speedSlider.value" },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: "dot",
				type: "circle",
				renderConfig: { layer: "live" },
				params: {
					center: { ref: "orbit.point" },
					radius: { v: 0.02 },
					color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
				},
			},
		],
	},
};
