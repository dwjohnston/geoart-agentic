import { describe, expect, test } from 'bun:test';
import type { GeoArtGraph } from "./_generated/schema-types";
import { validateGeoArtGraph, validateGeoArtGraphWithErrors } from "./validateGeoArtGraph";

describe("earth venus example algorithm validates against schema", () => {
	test("valid graph", () => {
		const earthVenus: GeoArtGraph = {
			version: "2.0",
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

		expect(validateGeoArtGraph(earthVenus)).toBe(true);
		expect(validateGeoArtGraphWithErrors(earthVenus)).toBeNull();
	});

	test("invalid graph", () => {
		// @ts-expect-error - Deliberately broken: render is missing.
		const notMatching: GeoArtGraph = {
			version: "0.1",
			control: { nodes: [] },
			compute: { nodes: [] },
			// render is missing
		};

		expect(() => validateGeoArtGraph(notMatching)).not.toThrow();
		expect(validateGeoArtGraph(notMatching)).toBe(false);
		const result = validateGeoArtGraphWithErrors(notMatching);
		expect(result).not.toBeNull();
		expect(result?.errors).toBeDefined();
		expect(result?.errors.length).toBeGreaterThan(0);
		expect(result?.errors.some(err => err.includes("render"))).toBe(true);
	});

	test("compute nodes have params specific to their type", () => {
		const graph: GeoArtGraph = {
			version: "2.0",
			control: { nodes: [] },
			compute: {
				nodes: [
					{
						id: "wave1",
						type: "wave",
						params: {
							frequency: { v: 1 },
							// @ts-expect-error - Deliberately broken: radius is an orbit param, not a wave param
							radius: { v: 0.5 },
						},
					},
				],
			},
			render: { nodes: [] },
		};

		expect(validateGeoArtGraph(graph)).toBe(false);
		const result = validateGeoArtGraphWithErrors(graph);
		expect(result).not.toBeNull();
		expect(result?.errors.length).toBeGreaterThan(0);
		expect(result?.errors.some(err => err.includes("radius") || err.includes("additionalProperties"))).toBe(true);
	});

	test("controls nodes have params specific to their type", () => {
		const graph: GeoArtGraph = {
			version: "2.0",
			control: {
				nodes: [
					{
						id: "earthSpeedSlider",
						type: "colorPicker",
						params: {
							label: { v: "Earth Speed" },
							// @ts-expect-error - Deliberately broken
							min: { v: 0 },
							max: { v: 1 },
							value: { v: 0.2 },
						},
					},
				],
			},
			compute: { nodes: [] },
			render: { nodes: [] },
		};

		expect(validateGeoArtGraph(graph)).toBe(false);
		const result = validateGeoArtGraphWithErrors(graph);
		expect(result).not.toBeNull();
		expect(result?.errors.length).toBeGreaterThan(0);
		expect(result?.errors.some(err => err.includes("min") || err.includes("max") || err.includes("additionalProperties"))).toBe(true);
	});

	test("render nodes have params specific to their type", () => {
		const graph: GeoArtGraph = {
			version: "2.0",
			control: { nodes: [] },
			compute: { nodes: [] },
			render: {
				nodes: [
					{
						id: "circle1",
						type: "circle",
						renderConfig: { layer: "live" },
						params: {
							center: { v: { x: 0, y: 0 } },
							// @ts-expect-error - Deliberately broken: pointA/pointB are timedLine params, not circle params
							pointA: { v: { x: 0, y: 0 } },
						},
					},
				],
			},
		};

		expect(validateGeoArtGraph(graph)).toBe(false);
		const result = validateGeoArtGraphWithErrors(graph);
		expect(result).not.toBeNull();
		expect(result?.errors.length).toBeGreaterThan(0);
		expect(result?.errors.some(err => err.includes("pointA") || err.includes("additionalProperties"))).toBe(true);
	});

	test("module declaration with orbit-module", () => {
		const graph: GeoArtGraph = {
			version: "2.0",
			control: { nodes: [] },
			compute: { nodes: [] },
			module: {
				nodes: [
					{
						id: "my-orbit",
						type: "orbit-module",
						params: {
							speed: { v: 0.01 },
							radius: { v: 0.4 },
							numPoints: { v: 100 },
							centerPoints: { v: [{ v: { x: 0.5, y: 0.5, r: 1, g: 1, b: 1, a: 1 } }] },
							phase: { v: 0 },
							eccentricity: { v: 0 },
							tilt: { v: 0 },
						},
						controls: {
							speed: true,
							radius: true,

						},
						render: {
							live: {
								point: true,
								path: true,
							},
							paint: {
								trace: false,
							},
						},
					},
				],
			},
			render: { nodes: [] },
		};

		expect(validateGeoArtGraph(graph)).toBe(true);
		expect(validateGeoArtGraphWithErrors(graph)).toBeNull();
	});

	test("module declaration with orbit-module - with type errors", () => {
		const graph: GeoArtGraph = {
			version: "2.0",
			control: { nodes: [] },
			compute: { nodes: [] },
			module: {
				nodes: [
					{
						id: "my-orbit",
						type: "orbit-module",
						params: {
							// @ts-expect-error - invalid type
							speed: { v: "aaaa" },
							radius: { v: 0.4 },
							numPoints: { v: 100 },
							centerPoints: { v: [{ v: { x: 0.5, y: 0.5, r: 1, g: 1, b: 1, a: 1 } }] },
							phase: { v: 0 },
							eccentricity: { v: 0 },
							tilt: { v: 0 },
						},
						controls: {
							speed: true,
							radius: true,
						},
						render: {
							live: {
								// @ts-expect-error - invalid type
								path: 1,
							},
							paint: {
								trace: false,
							},
						},
					},
				],
			},
			render: { nodes: [] },
		};

		expect(validateGeoArtGraph(graph)).toBe(false);
		const result = validateGeoArtGraphWithErrors(graph);
		expect(result).not.toBeNull();
		expect(result?.errors.length).toBeGreaterThan(0);
	});
});
