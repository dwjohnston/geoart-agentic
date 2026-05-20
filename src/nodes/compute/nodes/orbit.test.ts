import { describe, expect, it } from "bun:test";
import orbitNodeDef from "./orbit";
import type { NodeInputsResolved } from "../../../schema/typeHelpers";

// speed=1 → 1 orbit per 600 ticks. Tick values for clean positions:
//   t=0    → angle=0    (rightmost point)
//   t=150  → angle=π/2  (quarter turn, top)
//   t=300  → angle=π    (half turn, leftmost)
const base = {
	time: 0,
	radius: 0.5,
	speed: 1,
	center: { x: 0, y: 0 },
	numPoints: 1,
	phase: 0,
	eccentricity: 0,
	tilt: 0,
	centerPoints: [],
} satisfies NodeInputsResolved<"orbit">;

describe("orbitNodeDef", () => {
	it("at t=0, point is at (radius, 0)", () => {
		const { point } = orbitNodeDef.evaluate(base);
		expect(point.x).toBeCloseTo(0.5);
		expect(point.y).toBeCloseTo(0);
	});

	it("at t=150 (quarter turn), point is at (0, radius)", () => {
		const { point } = orbitNodeDef.evaluate({ ...base, time: 150 });
		expect(point.x).toBeCloseTo(0);
		expect(point.y).toBeCloseTo(0.5);
	});

	it("at t=300 (half turn), point is at (-radius, 0)", () => {
		const { point } = orbitNodeDef.evaluate({ ...base, time: 300 });
		expect(point.x).toBeCloseTo(-0.5);
		expect(point.y).toBeCloseTo(0);
	});

	it("at t=600 (full turn), point returns to start", () => {
		const { point } = orbitNodeDef.evaluate({ ...base, time: 600 });
		expect(point.x).toBeCloseTo(0.5);
		expect(point.y).toBeCloseTo(0);
	});

	it("speed=2 doubles angular velocity", () => {
		const { point } = orbitNodeDef.evaluate({ ...base, speed: 2, time: 150 });
		expect(point.x).toBeCloseTo(-0.5);
		expect(point.y).toBeCloseTo(0);
	});

	it("radius=0 always returns origin", () => {
		const { point } = orbitNodeDef.evaluate({ ...base, radius: 0, time: 100 });
		expect(point.x).toBeCloseTo(0);
		expect(point.y).toBeCloseTo(0);
	});

	it("center offset shifts the point", () => {
		const { point } = orbitNodeDef.evaluate({
			...base,
			center: { x: 0.3, y: 0.2 },
		});
		expect(point.x).toBeCloseTo(0.8);
		expect(point.y).toBeCloseTo(0.2);
	});

	it("phase shifts starting angle", () => {
		const { point } = orbitNodeDef.evaluate({ ...base, phase: 0.25 });
		expect(point.x).toBeCloseTo(0);
		expect(point.y).toBeCloseTo(0.5);
	});

	it("numPoints=4 returns four evenly-spaced colour points", () => {
		const { points } = orbitNodeDef.evaluate({ ...base, numPoints: 4 });
		expect(points).toHaveLength(4);
		expect(points[0].x).toBeCloseTo(0.5);
		expect(points[0].y).toBeCloseTo(0);
		expect(points[1].x).toBeCloseTo(0, 5);
		expect(points[1].y).toBeCloseTo(0.5);
		expect(points[2].x).toBeCloseTo(-0.5);
		expect(points[2].y).toBeCloseTo(0, 5);
		expect(points[3].x).toBeCloseTo(0, 5);
		expect(points[3].y).toBeCloseTo(-0.5);
	});

	it("colour points have white colour by default", () => {
		const { points } = orbitNodeDef.evaluate(base);
		expect(points[0]).toMatchObject({ r: 1, g: 1, b: 1, a: 1 });
	});

	it("numPoints=2 returns two points 180 degrees apart", () => {
		const { points } = orbitNodeDef.evaluate({ ...base, numPoints: 2 });
		expect(points).toHaveLength(2);
		expect(points[0].x).toBeCloseTo(0.5);
		expect(points[1].x).toBeCloseTo(-0.5);
	});

	it("exports tangent in direction of motion", () => {
		const { points } = orbitNodeDef.evaluate({ ...base, numPoints: 4 });

		// Check that each point has a unit-magnitude tangent
		points.forEach((p) => {
			const mag = Math.sqrt((p.dx ?? 0) ** 2 + (p.dy ?? 0) ** 2);
			expect(mag).toBeCloseTo(1, 2); // Tangent should be normalised
		});
	});

	it("tangents are perpendicular to radius at each point", () => {
		const { points } = orbitNodeDef.evaluate({ ...base, numPoints: 4 });

		points.forEach((p) => {
			// Radius vector from center to point
			const radiusX = p.x - base.center.x;
			const radiusY = p.y - base.center.y;

			// Dot product of radius and tangent should be near zero (perpendicular)
			const dotProduct = radiusX * (p.dx ?? 0) + radiusY * (p.dy ?? 0);
			expect(dotProduct).toBeCloseTo(0, 1);
		});
	});

	it("tangent at t=0 points upward (perpendicular to rightmost radius)", () => {
		const { points } = orbitNodeDef.evaluate({
			...base,
			phase: 0,
			numPoints: 1,
		});

		const point = points[0];

		// At t=0, angle=0, point is at (radius, 0)
		// Tangent should be (-sin(0), cos(0)) = (0, 1)
		expect(point.x).toBeCloseTo(0.5);
		expect(point.y).toBeCloseTo(0);
		expect(point.dx).toBeCloseTo(0);
		expect(point.dy).toBeCloseTo(1);

		// After 1 tick with speed=150 (quarter orbit per tick), it should be in the top center position
		const result2 = orbitNodeDef.evaluate({
			...base,
			phase: 0,
			numPoints: 1,
			time: 1,
			speed: 600 / 4,
		});
		expect(result2.points[0].x).toBeCloseTo(0);
		expect(result2.points[0].y).toBeCloseTo(0.5);
		expect(result2.points[0].dx).toBeCloseTo(-1);
		expect(result2.points[0].dy).toBeCloseTo(0);
	});
	describe("eccentricity", () => {
		it("eccentricity=0 produces a circle (default behaviour)", () => {
			const { point } = orbitNodeDef.evaluate({
				...base,
				time: 150,
				eccentricity: 0,
			});
			expect(point.x).toBeCloseTo(0);
			expect(point.y).toBeCloseTo(0.5);
		});

		it("eccentricity=1 collapses the orbit to a flat line (y=0 for all t)", () => {
			const atZero = orbitNodeDef.evaluate({
				...base,
				time: 0,
				eccentricity: 1,
			});
			const atQuarter = orbitNodeDef.evaluate({
				...base,
				time: 150,
				eccentricity: 1,
			});
			const atHalf = orbitNodeDef.evaluate({
				...base,
				time: 300,
				eccentricity: 1,
			});
			expect(atZero.point.y).toBeCloseTo(0);
			expect(atQuarter.point.y).toBeCloseTo(0);
			expect(atHalf.point.y).toBeCloseTo(0);
		});

		it("eccentricity=1 at t=0 puts point at (radius, 0)", () => {
			const { point } = orbitNodeDef.evaluate({ ...base, eccentricity: 1 });
			expect(point.x).toBeCloseTo(0.5);
			expect(point.y).toBeCloseTo(0);
		});

		it("eccentricity=0.5 squashes the y-axis to half radius at the quarter turn", () => {
			const { point } = orbitNodeDef.evaluate({
				...base,
				time: 150,
				eccentricity: 0.5,
			});
			expect(point.x).toBeCloseTo(0);
			expect(point.y).toBeCloseTo(0.25);
		});
	});

	describe("centerPoints", () => {
		it("3 centre points with numPoints=2 produces 6 output points", () => {
			const centres = [
				{ x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 },
				{ x: 0.5, y: 0.5, r: 0, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
				{ x: -0.5, y: -0.5, r: 0, g: 0, b: 1, a: 1, dx: 0, dy: 0 },
			];
			const { points } = orbitNodeDef.evaluate({
				...base,
				centerPoints: centres,
				numPoints: 2,
			});
			expect(points).toHaveLength(6);
		});

		it("output points inherit colour from their respective centre point", () => {
			const centres = [
				{ x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 },
				{ x: 0.5, y: 0.5, r: 0, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
			];
			const { points } = orbitNodeDef.evaluate({
				...base,
				centerPoints: centres,
				numPoints: 1,
			});
			expect(points).toHaveLength(2);
			expect(points[0]).toMatchObject({ r: 1, g: 0, b: 0, a: 1 });
			expect(points[1]).toMatchObject({ r: 0, g: 1, b: 0, a: 1 });
		});

		it("centerPoints takes precedence over center when both are provided", () => {
			const centres = [
				{ x: 0.2, y: 0.3, r: 0.5, g: 0.5, b: 0.5, a: 1, dx: 0, dy: 0 },
			];
			const { points } = orbitNodeDef.evaluate({
				...base,
				centerPoints: centres,
				center: { x: 0.9, y: 0.9 },
				numPoints: 1,
			});
			// orbit should be around (0.2, 0.3), not (0.9, 0.9)
			expect(points).toHaveLength(1);
			expect(points[0]).toMatchObject({ r: 0.5, g: 0.5, b: 0.5, a: 1 });
		});

		it("empty centerPoints falls back to the center input", () => {
			const { points } = orbitNodeDef.evaluate({
				...base,
				centerPoints: [],
				center: { x: 0.3, y: 0.2 },
				numPoints: 1,
			});
			expect(points).toHaveLength(1);
			// orbit at t=0, radius=0.5 around (0.3, 0.2) → x = 0.3 + 0.5, y = 0.2
			expect(points[0].x).toBeCloseTo(0.8);
			expect(points[0].y).toBeCloseTo(0.2);
		});
	});

	describe("tilt", () => {
		it("tilt=0 produces no rotation (default behaviour)", () => {
			const { point } = orbitNodeDef.evaluate({ ...base, tilt: 0 });
			expect(point.x).toBeCloseTo(0.5);
			expect(point.y).toBeCloseTo(0);
		});

		it("tilt=0.25 rotates the orbit 90 degrees — t=0 point moves to (0, radius)", () => {
			const { point } = orbitNodeDef.evaluate({ ...base, tilt: 0.25 });
			expect(point.x).toBeCloseTo(0);
			expect(point.y).toBeCloseTo(0.5);
		});

		it("tilt=0.5 rotates 180 degrees — t=0 point moves to (-radius, 0)", () => {
			const { point } = orbitNodeDef.evaluate({ ...base, tilt: 0.5 });
			expect(point.x).toBeCloseTo(-0.5);
			expect(point.y).toBeCloseTo(0);
		});

		it("tilt=0.25 with eccentricity=0.5 — quarter-turn point lands at (-0.25, 0)", () => {
			// At t=150 (angle=π/2): px=0, py=radius*(1-0.5)*sin(π/2)=0.25
			// Rotate by tilt=0.25 (90°): x = -py*sin(π/2) = -0.25, y = py*cos(π/2) = 0
			const { point } = orbitNodeDef.evaluate({
				...base,
				time: 150,
				eccentricity: 0.5,
				tilt: 0.25,
			});
			expect(point.x).toBeCloseTo(-0.25);
			expect(point.y).toBeCloseTo(0);
		});
	});
});
