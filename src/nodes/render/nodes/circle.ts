/**
 * CANONICAL LEVEL: 👑 - 2026-05-14
 *
 * Canonically demonstrates how to deal with deprecated values
 */

import { toSolidColorPoint } from "../../../domain-helpers/colorPoint";
import { implementRenderNode } from "../implementRenderNode";

const circleNodeDef = implementRenderNode("circle", {
	defaults: {
		intervalTicks: 0,
		center: { x: 0, y: 0 },
		radius: 0.02,
		eccentricity: 0,
		tilt: 0,
		color: { r: 1, g: 1, b: 1, a: 1 },
		centerPoints: [],
	},
	evaluate: (inputs, ctx) => {
		const pixelRadius = Math.abs(inputs.radius) * (ctx.width / 2);
		const radiusY = pixelRadius * (1 - inputs.eccentricity);
		const rotation = -inputs.tilt * 2 * Math.PI;

		const deprecatedColorPoint = { ...inputs.color, ...inputs.center };

		const colorPointsToUse =
			inputs.centerPoints.length > 0
				? inputs.centerPoints
				: [deprecatedColorPoint];
		colorPointsToUse.forEach((v) => {
			const { r, g, b, a, x, y } = toSolidColorPoint(v);
			const pixelX = x * (ctx.width / 2) + ctx.width / 2;
			const pixelY = ctx.height / 2 - y * (ctx.height / 2);
			ctx.canvas.strokeStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
			ctx.canvas.lineWidth = 2;
			ctx.canvas.beginPath();
			ctx.canvas.ellipse(
				pixelX,
				pixelY,
				pixelRadius,
				radiusY,
				rotation,
				0,
				Math.PI * 2,
			);
			ctx.canvas.stroke();
		});
	},
});

export default circleNodeDef;
