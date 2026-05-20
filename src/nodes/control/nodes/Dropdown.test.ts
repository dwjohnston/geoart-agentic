import { describe, it, expect } from "bun:test";
import dropdownNodeDef from "./Dropdown";

describe("dropdown node", () => {
	it("has the correct node kind", () => {
		expect(dropdownNodeDef.nodeKind).toBe("dropdown");
	});

	it("has correct default value", () => {
		expect(dropdownNodeDef.defaultValues.value).toBe("");
	});
});
