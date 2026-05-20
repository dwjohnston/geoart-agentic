import { toSolidColorPoint } from "../../../domain-helpers/colorPoint";
import { implementRenderNode } from "../implementRenderNode";

// Catmull-Rom spline interpolation
// Control points P0, P1, P2, P3 and parameter t ∈ [0, 1]
function catmullRom(
	p0: number,
	p1: number,
	p2: number,
	p3: number,
	t: number,
): number {
	const t2 = t * t;
	const t3 = t2 * t;

	return (
		0.5 *
		(2 * p1 +
			(-p0 + p2) * t +
			(2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
			(-p0 + 3 * p1 - 3 * p2 + p3) * t3)
	);
}

// Convert normalized coordinates to pixel coordinates
function toPixelCoords(
	x: number,
	y: number,
	width: number,
	height: number,
): { px: number; py: number } {
	return {
		px: x * (width / 2) + width / 2,
		py: height / 2 - y * (height / 2),
	};
}

const connectDotsNodeDef = implementRenderNode("connect-dots", {
	defaults: {
		colorPointsArray: [],
		lineWidth: 1,
		mode: "straight",
	},
	evaluate: (inputs, ctx) => {
		const points = inputs.colorPointsArray;
		const lineWidth = inputs.lineWidth;
		const mode = inputs.mode;

		if (points.length < 2) {
			return; // Nothing to draw
		}

		const canvas = ctx.canvas;
		canvas.lineWidth = lineWidth;

		if (mode === "straight") {
			// Draw line segments between consecutive points
			for (let i = 0; i < points.length - 1; i++) {
				const p1 = points[i];
				const p2 = points[i + 1];

				const p1Pixel = toPixelCoords(p1.x, p1.y, ctx.width, ctx.height);
				const p2Pixel = toPixelCoords(p2.x, p2.y, ctx.width, ctx.height);

				// Set stroke colour from p2 (the second point in the segment)
				const c2 = toSolidColorPoint(p2);
				canvas.strokeStyle = `rgba(${c2.r * 255}, ${c2.g * 255}, ${c2.b * 255}, ${c2.a})`;

				// Draw the line
				canvas.beginPath();
				canvas.moveTo(p1Pixel.px, p1Pixel.py);
				canvas.lineTo(p2Pixel.px, p2Pixel.py);
				canvas.stroke();
			}
		} else if (mode === "catmull-rom") {
			// Draw smooth curves using Catmull-Rom spline interpolation
			// Each segment from points[i] to points[i+1] uses control points from surrounding points
			const samplesPerSegment = Math.max(10, Math.ceil(50)); // Sample the curve at multiple points

			for (let i = 0; i < points.length - 1; i++) {
				// Get the 4 control points for this segment
				// P0 is the point before the segment start (or use p0 if at the beginning)
				// P1 is the segment start
				// P2 is the segment end
				// P3 is the point after the segment end (or use p2 if at the end)
				const p0 = i > 0 ? points[i - 1] : points[i];
				const p1 = points[i];
				const p2 = points[i + 1];
				const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1];

				// Set stroke colour from p2 (the second point in the segment)
				const c2 = toSolidColorPoint(p2);
				canvas.strokeStyle = `rgba(${c2.r * 255}, ${c2.g * 255}, ${c2.b * 255}, ${c2.a})`;

				canvas.beginPath();
				let firstPoint = true;

				for (let j = 0; j <= samplesPerSegment; j++) {
					const t = j / samplesPerSegment;

					// Interpolate x and y coordinates using Catmull-Rom
					const x = catmullRom(p0.x, p1.x, p2.x, p3.x, t);
					const y = catmullRom(p0.y, p1.y, p2.y, p3.y, t);

					const pixel = toPixelCoords(x, y, ctx.width, ctx.height);

					if (firstPoint) {
						canvas.moveTo(pixel.px, pixel.py);
						firstPoint = false;
					} else {
						canvas.lineTo(pixel.px, pixel.py);
					}
				}

				canvas.stroke();
			}
		}
	},
});

export default connectDotsNodeDef;
