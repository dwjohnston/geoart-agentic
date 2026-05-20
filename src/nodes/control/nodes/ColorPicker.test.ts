import { describe, expect, it } from "vitest";
import colorPickerNodeDef from "./ColorPicker";

describe("colorPicker node", () => {
	it("has the correct node kind", () => {
		expect(colorPickerNodeDef.nodeKind).toBe("colorPicker");
	});

	it("has correct default color value", () => {
		expect(colorPickerNodeDef.defaultValues.value).toEqual({
			r: 1,
			g: 1,
			b: 1,
			a: 1,
		});
	});

	it("has correct default label", () => {
		expect(colorPickerNodeDef.defaultValues.label).toBe("");
	});
});
