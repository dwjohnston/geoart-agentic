import { describe, it, expect } from "bun:test";
import timedLineArrayIntervalModeDropdownDef from "./TimedLineArrayIntervalModeDropdown";

describe("timedLineArrayIntervalModeSelector node", () => {
	it("has the correct node kind", () => {
		expect(timedLineArrayIntervalModeDropdownDef.nodeKind).toBe(
			"timedLineArrayIntervalModeSelector",
		);
	});

	it("has correct default value", () => {
		expect(timedLineArrayIntervalModeDropdownDef.defaultValues.value).toBe(
			"all",
		);
	});
});
