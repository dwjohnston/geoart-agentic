import type { GeoArtGraph } from "../../../schema/_generated/schema-types";

const graph: GeoArtGraph = {
	version: "2.0",
	title: "Circle",
	control: {
		nodes: [],
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
					radius: { v: 0.3 },
					speed: { v: 0.5 },
					numPoints: { v: 1 },
					phase: { v: 0 },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: "circle",
				type: "circle",
				renderConfig: {
					layer: "live",
				},
				params: {
					centerPoints: { ref: "orbit.points" },
					radius: { v: 0.05 },
					color: { v: { r: 1, g: 1, b: 1, a: 1 } },
				},
			},
		],
	},
};

export default graph;
