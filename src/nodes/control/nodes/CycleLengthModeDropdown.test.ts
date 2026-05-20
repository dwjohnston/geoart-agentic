import { describe, it, expect } from "bun:test";
import cycleLengthModeDropdownDef from "./CycleLengthModeDropdown";

describe("cycleLengthModeSelector node", () => {
	it("has the correct node kind", () => {
		expect(cycleLengthModeDropdownDef.nodeKind).toBe("cycleLengthModeSelector");
	});

	it("has correct default value", () => {
		expect(cycleLengthModeDropdownDef.defaultValues.value).toBe("arrayLength");
	});
});
