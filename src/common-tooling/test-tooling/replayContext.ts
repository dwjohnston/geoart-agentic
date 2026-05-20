/**
 * CANONICAL LEVEL: 🧪 - 2026-05-14
 */

import type { Canvas } from "@napi-rs/canvas";
import { createCanvas } from "@napi-rs/canvas";
import type { Call } from "./fakeContext";

const creatorPrefixes: Record<string, string> = {
	createLinearGradient: "gradient",
	createRadialGradient: "gradient",
	createConicGradient: "gradient",
	createPattern: "pattern",
};

export function replayCallsOnCanvas(
	calls: Call[],
	width: number,
	height: number,
): Canvas {
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d") as unknown as Record<string, unknown>;
	const subObjects: Record<string, unknown> = {};

	for (const call of calls) {
		if (call.kind === "property") {
			ctx[call.name] = call.value;
		} else {
			const dot = call.name.indexOf(".");
			if (dot !== -1) {
				const prefix = call.name.slice(0, dot);
				const method = call.name.slice(dot + 1);
				const obj = subObjects[prefix] as Record<string, unknown> | undefined;
				if (obj) {
					(obj[method] as (...a: unknown[]) => unknown)(...call.args);
				}
			} else {
				const fn = ctx[call.name] as ((...a: unknown[]) => unknown) | undefined;
				if (typeof fn === "function") {
					const result = fn.call(ctx, ...call.args);
					const prefix = creatorPrefixes[call.name];
					if (prefix) subObjects[prefix] = result;
				}
			}
		}
	}

	return canvas;
}
