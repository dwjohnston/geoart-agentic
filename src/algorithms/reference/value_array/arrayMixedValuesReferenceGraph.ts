import type { GeoArtGraph } from "../../../schema/_generated/schema-types";

const graph: GeoArtGraph = {
	version: "2.0",
	title: "Array Mixed Values",
	control: {
		nodes: [
			{
				id: "speedSlider",
				type: "slider",
				params: {
					label: { v: "Speed" },
					min: { v: -5 },
					max: { v: 5 },
					step: { v: 0.01 },
					value: { v: 1 },
				},
			},
		],
	},
	compute: {
		nodes: [
			{
				id: "time",
				type: "time",
				params: {},
			},
			{
				id: "orbit",
				type: "orbit",
				params: {
					time: { ref: "time.time" },
					radius: { v: 0.2 },
					speed: { ref: "speedSlider.value" },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: "circle",
				type: "circle",
				renderConfig: { layer: "live" },
				params: {
					centerPoints: {
						v: [
							{
								v: { x: 0.2, y: 0.2, dx: 0, dy: 0, r: 1, g: 0, b: 0, a: 1 },
							},
							{
								ref: "orbit.point",
							},
							{
								v: { x: 0.8, y: 0.2, dx: 0, dy: 0, r: 0, g: 0, b: 1, a: 1 },
							},
						],
					},
					radius: { v: 0.02 },
				},
			},
		],
	},
};

export default graph;
