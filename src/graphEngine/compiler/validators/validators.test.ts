import { describe, expect, test } from "bun:test";
import type { GeoArtGraph } from "../../../schema/_generated/schema-types";
import { validateGraphSemantics } from "./index";

// ---------------------------------------------------------------------------
// Fixture: earth-venus graph (valid baseline)
// ---------------------------------------------------------------------------

const earthVenus: GeoArtGraph = {
	version: "1.0",
	control: {
		nodes: [
			{
				id: "earthSpeedSlider",
				type: "slider",
				params: {
					label: { v: "Earth Speed" },
					min: { v: 0 },
					max: { v: 1 },
					value: { v: 0.2 },
				},
			},
			{
				id: "venusSpeedSlider",
				type: "slider",
				params: {
					label: { v: "Venus Speed" },
					min: { v: 0 },
					max: { v: 1 },
					value: { v: 0.33 },
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
					radius: { v: 0.6 },
					speed: { ref: "earthSpeedSlider.value" },
				},
			},
			{
				id: "venusOrbit",
				type: "orbit",
				params: {
					time: { ref: "time.time" },
					radius: { v: 0.3 },
					speed: { ref: "venusSpeedSlider.value" },
				},
			},
			{
				id: "earthColorPoint",
				type: "colorPointCompute",
				params: {
					point: { ref: "earthOrbit.point" },
					color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
				},
			},
			{
				id: "venusColorPoint",
				type: "colorPointCompute",
				params: {
					point: { ref: "venusOrbit.point" },
					color: { v: { r: 1, g: 0.8, b: 0.2, a: 1 } },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: "line",
				type: "timedLine",
				renderConfig: { layer: "paint" },
				params: {
					intervalTicks: { v: 16 },
					colorPointA: { ref: "earthColorPoint.colorPoint" },
					colorPointB: { ref: "venusColorPoint.colorPoint" },
				},
			},
		],
	},
};

// ---------------------------------------------------------------------------
// Baseline
// ---------------------------------------------------------------------------

describe("validateGraphSemantics", () => {
	test("earth-venus fixture is fully valid", () => {
		const result = validateGraphSemantics(earthVenus);
		expect(result.valid).toBe(true);
		expect(result.errors).toHaveLength(0);
	});

	test("minimal empty graph is valid", () => {
		const graph: GeoArtGraph = {
			version: "1.0",
			control: { nodes: [] },
			compute: { nodes: [] },
			render: { nodes: [] },
		};
		const result = validateGraphSemantics(graph);
		expect(result.valid).toBe(true);
		expect(result.errors).toHaveLength(0);
	});
});

// ---------------------------------------------------------------------------
// Duplicate node IDs
// ---------------------------------------------------------------------------

describe("DUPLICATE_NODE_ID", () => {
	test("same id in two different layers is an error", () => {
		const graph: GeoArtGraph = {
			version: "1.0",
			control: {
				nodes: [
					{ id: "shared", type: "slider", params: { value: { v: 0.5 } } },
				],
			},
			compute: {
				nodes: [{ id: "shared", type: "time", params: {} }],
			},
			render: { nodes: [] },
		};
		const result = validateGraphSemantics(graph);
		expect(result.valid).toBe(false);
		const dupe = result.errors.find((e) => e.code === "DUPLICATE_NODE_ID");
		expect(dupe).toBeDefined();
		expect(dupe!.nodeId).toBe("shared");
	});

	test("same id twice in the same layer is an error", () => {
		const graph: GeoArtGraph = {
			version: "1.0",
			control: { nodes: [] },
			compute: {
				nodes: [
					{ id: "time", type: "time", params: {} },
					{ id: "time", type: "time", params: {} },
				],
			},
			render: { nodes: [] },
		};
		const result = validateGraphSemantics(graph);
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.code === "DUPLICATE_NODE_ID")).toBe(
			true,
		);
	});
});

// ---------------------------------------------------------------------------
// Cycle detection
// ---------------------------------------------------------------------------

describe("CYCLE_DETECTED", () => {
	test("two nodes referencing each other create a cycle", () => {
		const graph: GeoArtGraph = {
			version: "1.0",
			control: { nodes: [] },
			compute: {
				nodes: [
					// nodeA.time = ref to nodeB output; nodeB.time = ref to nodeA output
					{
						id: "nodeA",
						type: "orbit",
						params: { time: { ref: "nodeB.point" } },
					},
					{
						id: "nodeB",
						type: "orbit",
						params: { time: { ref: "nodeA.point" } },
					},
				],
			},
			render: { nodes: [] },
		};
		const result = validateGraphSemantics(graph);
		expect(result.valid).toBe(false);
		const cycleErrors = result.errors.filter(
			(e) => e.code === "CYCLE_DETECTED",
		);
		expect(cycleErrors.length).toBeGreaterThan(0);
		const cycleIds = cycleErrors.map((e) => e.nodeId);
		expect(cycleIds).toContain("nodeA");
		expect(cycleIds).toContain("nodeB");
	});
});

// ---------------------------------------------------------------------------
// Reference validation — unknown node
// ---------------------------------------------------------------------------

describe("UNKNOWN_REF_NODE", () => {
	test("ref to a non-existent node is an error", () => {
		const graph: GeoArtGraph = {
			version: "1.0",
			control: { nodes: [] },
			compute: {
				nodes: [
					{
						id: "cp",
						type: "colorPointCompute",
						params: { point: { ref: "ghost.value" } },
					},
				],
			},
			render: { nodes: [] },
		};
		const result = validateGraphSemantics(graph);
		expect(result.valid).toBe(false);
		const err = result.errors.find((e) => e.code === "UNKNOWN_REF_NODE");
		expect(err).toBeDefined();
		expect(err!.nodeId).toBe("cp");
		expect(err!.paramName).toBe("point");
	});
});

// ---------------------------------------------------------------------------
// Reference validation — unknown port
// ---------------------------------------------------------------------------

describe("UNKNOWN_REF_PORT", () => {
	test("ref to a non-existent output port is an error", () => {
		const graph: GeoArtGraph = {
			version: "1.0",
			control: { nodes: [] },
			compute: {
				nodes: [
					{ id: "time", type: "time", params: {} },
					{
						id: "cp",
						type: "colorPointCompute",
						// time has no "banana" output port
						params: { point: { ref: "time.banana" } },
					},
				],
			},
			render: { nodes: [] },
		};
		const result = validateGraphSemantics(graph);
		expect(result.valid).toBe(false);
		const err = result.errors.find((e) => e.code === "UNKNOWN_REF_PORT");
		expect(err).toBeDefined();
		expect(err!.nodeId).toBe("cp");
		expect(err!.paramName).toBe("point");
	});
});

// ---------------------------------------------------------------------------
// Reference validation — type mismatch
// ---------------------------------------------------------------------------

describe("TYPE_MISMATCH", () => {
	test("wiring a number output into a point input is an error", () => {
		const graph: GeoArtGraph = {
			version: "1.0",
			control: { nodes: [] },
			compute: {
				nodes: [
					{ id: "time", type: "time", params: {} },
					{
						id: "cp",
						type: "colorPointCompute",
						// time.time outputs 'number'; colorPoint.point expects 'point'
						params: { point: { ref: "time.time" } },
					},
				],
			},
			render: { nodes: [] },
		};
		const result = validateGraphSemantics(graph);
		expect(result.valid).toBe(false);
		const err = result.errors.find((e) => e.code === "TYPE_MISMATCH");
		expect(err).toBeDefined();
		expect(err!.nodeId).toBe("cp");
		expect(err!.paramName).toBe("point");
	});

	test("correct type wiring produces no type mismatch", () => {
		const graph: GeoArtGraph = {
			version: "1.0",
			control: { nodes: [] },
			compute: {
				nodes: [
					{ id: "time", type: "time", params: {} },
					{
						id: "orbit",
						type: "orbit",
						// time.time is 'number'; orbit.time expects 'number' — correct
						params: { time: { ref: "time.time" } },
					},
				],
			},
			render: { nodes: [] },
		};
		const result = validateGraphSemantics(graph);
		expect(
			result.errors.filter((e) => e.code === "TYPE_MISMATCH"),
		).toHaveLength(0);
	});
});

// ---------------------------------------------------------------------------
// Enum value validation
// ---------------------------------------------------------------------------

describe("INVALID_ENUM_VALUE", () => {
	test("valid graph with no enum ports produces no enum errors", () => {
		// No currently-registered compute nodes have enum ports.
		// This test asserts no false positives. Negative-case coverage will be
		// added once a node with enum ports (e.g. wave) is added to the registry.
		const result = validateGraphSemantics(earthVenus);
		expect(
			result.errors.filter((e) => e.code === "INVALID_ENUM_VALUE"),
		).toHaveLength(0);
	});
});

// ---------------------------------------------------------------------------
// Orphaned nodes
// ---------------------------------------------------------------------------

describe("ORPHANED_NODE", () => {
	test("a compute node not connected to any render node is a warning", () => {
		const graph: GeoArtGraph = {
			version: "1.0",
			control: { nodes: [] },
			compute: {
				nodes: [
					{ id: "time", type: "time", params: {} },
					// unusedTime is not referenced by any other node
					{ id: "unusedTime", type: "time", params: {} },
				],
			},
			render: {
				nodes: [
					{
						id: "line",
						type: "timedLine",
						renderConfig: { layer: "paint" },
						params: {
							intervalTicks: { v: 16 },
							colorPointA: { ref: "time.time" }, // intentionally wrong type — only testing orphan
							colorPointB: { ref: "time.time" },
						},
					},
				],
			},
		};
		const result = validateGraphSemantics(graph);
		// Warnings do not make the graph invalid
		const orphanErrors = result.errors.filter(
			(e) => e.code === "ORPHANED_NODE",
		);
		expect(orphanErrors.length).toBeGreaterThan(0);
		expect(orphanErrors.some((e) => e.nodeId === "unusedTime")).toBe(true);
	});

	test("orphaned node warning does not make the graph invalid", () => {
		const graph: GeoArtGraph = {
			version: "1.0",
			control: {
				nodes: [
					{ id: "unusedSlider", type: "slider", params: { value: { v: 0.5 } } },
				],
			},
			compute: {
				nodes: [
					{ id: "time", type: "time", params: {} },
					{
						id: "orbit",
						type: "orbit",
						params: { time: { ref: "time.time" } },
					},
					{
						id: "cp",
						type: "colorPointCompute",
						params: { point: { ref: "orbit.point" } },
					},
				],
			},
			render: {
				nodes: [
					{
						id: "line",
						type: "timedLine",
						renderConfig: { layer: "paint" },
						params: {
							intervalTicks: { v: 16 },
							colorPointA: { ref: "cp.colorPoint" },
							colorPointB: { ref: "cp.colorPoint" },
						},
					},
				],
			},
		};
		const result = validateGraphSemantics(graph);
		expect(result.valid).toBe(true); // warning only, not an error
		expect(
			result.errors.some(
				(e) => e.code === "ORPHANED_NODE" && e.nodeId === "unusedSlider",
			),
		).toBe(true);
	});

	test("all-connected earth-venus graph has no orphaned nodes", () => {
		const result = validateGraphSemantics(earthVenus);
		expect(
			result.errors.filter((e) => e.code === "ORPHANED_NODE"),
		).toHaveLength(0);
	});

	test("graph with no render nodes produces no orphan warnings", () => {
		const graph: GeoArtGraph = {
			version: "1.0",
			control: { nodes: [] },
			compute: { nodes: [{ id: "time", type: "time", params: {} }] },
			render: { nodes: [] },
		};
		const result = validateGraphSemantics(graph);
		expect(
			result.errors.filter((e) => e.code === "ORPHANED_NODE"),
		).toHaveLength(0);
	});
});
