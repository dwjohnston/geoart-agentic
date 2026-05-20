import { describe, expect, test } from "bun:test";
import {
	filePathToId,
	generateAlgorithmsIndexContent,
} from "./generate-algorithms-index";

describe("filePathToId", () => {
	test("strips ReferenceGraph suffix and converts to kebab-case", () => {
		expect(
			filePathToId("./reference/canonical/colorShiftOrbitReferenceGraph.ts"),
		).toBe("color-shift-orbit");
		expect(filePathToId("./reference/general/earthVenus.ts")).toBe(
			"earth-venus",
		);
		expect(
			filePathToId("./reference/minimal/minimalThreeNodeReferenceGraph.ts"),
		).toBe("minimal-three-node");
	});
});

describe("generateAlgorithmsIndexContent", () => {
	test("generates imports, rawEntries, GRAPHS, and getGraph", () => {
		const content = generateAlgorithmsIndexContent([
			"./reference/canonical/colorShiftOrbitReferenceGraph.ts",
			"./reference/general/earthVenus.ts",
		]);
		expect(content).toContain(
			"import colorShiftOrbitReferenceGraph from './reference/canonical/colorShiftOrbitReferenceGraph';",
		);
		expect(content).toContain(
			"import earthVenus from './reference/general/earthVenus';",
		);
		expect(content).toContain(
			"'./reference/canonical/colorShiftOrbitReferenceGraph.ts', colorShiftOrbitReferenceGraph",
		);
		expect(content).toContain("export const GRAPHS");
		expect(content).toContain("export function getGraph");
		expect(content).toContain("DEFAULT_GRAPH_ID");
	});

	test("deduplicates identifiers when basenames clash", () => {
		const content = generateAlgorithmsIndexContent([
			"./reference/a/foo.ts",
			"./reference/b/foo.ts",
		]);
		expect(content).toContain("import foo from");
		expect(content).toContain("import foo_2 from");
	});
});
