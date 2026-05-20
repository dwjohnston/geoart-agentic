import type { GeoArtGraph } from "../../../schema/_generated/schema-types";

const graph: GeoArtGraph = {
	version: "2.0",
	title: "Connect Dots",
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
					numPoints: { v: 6 },
					phase: { v: 0 },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: "connectDots",
				type: "connect-dots",
				renderConfig: {
					layer: "live",
				},
				params: {
					colorPointsArray: { ref: "orbit.points" },
					lineWidth: { v: 1 },
				},
			},
		],
	},
};

export default graph;
