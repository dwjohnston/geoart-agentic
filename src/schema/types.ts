/** DEPRECATED DO NOT ADD TO THIS FILE
 *
 * Use the type helpers in ./typeHelpers.ts insted.
 */

/**
 * @deprecated - use the type helpers instead
 */
export type NumberValue = { kind: "number"; v: number };
/**
 * @deprecated - use the type helpers instead
 */
export type PointValue = { kind: "point"; v: { x: number; y: number } };
/**
 * @deprecated - use the type helpers instead
 */
export type ColorValue = {
	kind: "color";
	v: { r: number; g: number; b: number; a: number };
};
/**
 * @deprecated - use the type helpers instead
 */
export type ColorPointValue = {
	kind: "colorPoint";
	v: {
		x: number;
		y: number;
		r: number;
		g: number;
		b: number;
		a: number;
		dx: number;
		dy: number;
	};
};
/**
 * @deprecated - use the type helpers instead
 */
export type ColorPointArrayValue = {
	kind: "colorPointArray";
	v: Array<{
		x: number;
		y: number;
		r: number;
		g: number;
		b: number;
		a: number;
		dx: number;
		dy: number;
	}>;
};
/**
 * @deprecated - use the type helpers instead
 */
export type StringValue = { kind: "string"; v: string };
/**
 * @deprecated - use the type helpers instead
 */
export type Value =
	| NumberValue
	| PointValue
	| ColorValue
	| ColorPointValue
	| ColorPointArrayValue
	| StringValue;
