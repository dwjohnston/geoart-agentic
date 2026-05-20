import type { ResolvedValue } from "../schema/typeHelpers";

export function fColorPoint(
	partial: Partial<ResolvedValue<"colorPointValue">> = {},
): ResolvedValue<"colorPointValue"> {
	return {
		x: 0,
		y: 0,
		r: 1,
		g: 1,
		b: 1,
		a: 1,
		dx: 0,
		dy: 0,
		...partial,
	};
}
