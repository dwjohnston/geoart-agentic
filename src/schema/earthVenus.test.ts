import { describe, expect, test } from 'bun:test';
import type { GeoArtGraph } from "./_generated/schema-types";
import { validateGeoArtGraph } from "./validateGeoArtGraph";

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
	});
});
