import type { GeoArtGraph } from "../../../schema/_generated/schema-types";

const graph: GeoArtGraph = {
	version: "2.0",
	title: "Timed Line",
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
				id: "orbitA",
				type: "orbit",
				params: {
					time: { ref: "time.time" },
					radius: { v: 0.2 },
					speed: { v: 0.5 },
					numPoints: { v: 1 },
					phase: { v: 0 },
				},
			},
			{
				id: "orbitB",
				type: "orbit",
				params: {
					time: { ref: "time.time" },
					radius: { v: 0.3 },
					speed: { v: 0.3 },
					numPoints: { v: 1 },
					phase: { v: 0.5 },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: "timedLine",
				type: "timedLine",
				renderConfig: {
					layer: "paint",
				},
				params: {
					colorPointA: { ref: "orbitA.point" },
					colorPointB: { ref: "orbitB.point" },
					intervalTicks: { v: 10 },
				},
			},
			{
				id: "circle",
				type: "circle",
				renderConfig: {
					layer: "live",
				},
				params: {
					centerPoints: { ref: "orbitA.points" },
					radius: { v: 0.01 },
				},
			},
			{
				id: "circle2",
				type: "circle",
				renderConfig: {
					layer: "live",
				},
				params: {
					centerPoints: { ref: "orbitB.points" },
					radius: { v: 0.01 },
				},
			},
		],
	},
};

export default graph;
