import { describe, expect, test } from "vitest";
import { validateSchemaStructure } from "./validateSchemaStructure";
import productionSchema from "./schema.json";

// Minimal valid fixture where every oneOf title ends with the correct layer suffix.
const validStructuredSchema = {
	definitions: {
		controlNode: {
			oneOf: [
				{ title: "Slider Control Node" },
				{ title: "Color Picker Control Node" },
			],
		},
		computeNode: {
			oneOf: [
				{ title: "Tick Compute Node" },
				{ title: "Wave Compute Node" },
			],
		},
		renderNode: {
			oneOf: [
				{ title: "Circle Render Node" },
			],
		},
	},
};

describe("validateSchemaStructure", () => {
	describe("schema.json", () => {
		test("passes with correct layer suffixes on all oneOf titles", () => {
			const result = validateSchemaStructure(productionSchema);
			expect(result.valid).toBe(true);
			expect(result.errors).toEqual([]);
		});
	});

	describe("valid schema structure", () => {
		test("passes when all oneOf titles end with the correct layer suffix", () => {
			const result = validateSchemaStructure(validStructuredSchema);
			expect(result.valid).toBe(true);
			expect(result.errors).toEqual([]);
		});
	});

	describe("problematic schemas", () => {
		test("fails when not an object", () => {
			const result = validateSchemaStructure("not an object");
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("Schema must be an object");
		});

		test("fails when definitions is missing", () => {
			const result = validateSchemaStructure({ title: "GeoArt Graph" });
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("Schema must have a definitions object");
		});

		test("fails when controlNode definition is missing", () => {
			const result = validateSchemaStructure({
				definitions: {
					computeNode: { oneOf: [{ title: "Tick Compute Node" }] },
					renderNode: { oneOf: [{ title: "Circle Render Node" }] },
				},
			});
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("Missing definition: controlNode");
		});

		test("fails when computeNode definition is missing", () => {
			const result = validateSchemaStructure({
				definitions: {
					controlNode: { oneOf: [{ title: "Slider Control Node" }] },
					renderNode: { oneOf: [{ title: "Circle Render Node" }] },
				},
			});
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("Missing definition: computeNode");
		});

		test("fails when renderNode definition is missing", () => {
			const result = validateSchemaStructure({
				definitions: {
					controlNode: { oneOf: [{ title: "Slider Control Node" }] },
					computeNode: { oneOf: [{ title: "Tick Compute Node" }] },
				},
			});
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("Missing definition: renderNode");
		});

		test("fails when a node definition lacks a oneOf array", () => {
			const result = validateSchemaStructure({
				definitions: {
					controlNode: { description: "no oneOf here" },
					computeNode: { oneOf: [{ title: "Tick Compute Node" }] },
					renderNode: { oneOf: [{ title: "Circle Render Node" }] },
				},
			});
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("controlNode must have a oneOf array");
		});

		test("fails when a controlNode oneOf item title does not end with 'Control Node'", () => {
			const result = validateSchemaStructure({
				definitions: {
					controlNode: {
						oneOf: [
							{ title: "Slider" }, // missing "Control Node" suffix
						],
					},
					computeNode: { oneOf: [{ title: "Tick Compute Node" }] },
					renderNode: { oneOf: [{ title: "Circle Render Node" }] },
				},
			});
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes('"Slider"') && e.includes('"Control Node"'))).toBe(true);
		});

		test("fails when a computeNode oneOf item title does not end with 'Compute Node'", () => {
			const result = validateSchemaStructure({
				definitions: {
					controlNode: { oneOf: [{ title: "Slider Control Node" }] },
					computeNode: {
						oneOf: [
							{ title: "Wave Node" }, // missing "Compute Node" suffix
						],
					},
					renderNode: { oneOf: [{ title: "Circle Render Node" }] },
				},
			});
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes('"Wave Node"') && e.includes('"Compute Node"'))).toBe(true);
		});

		test("fails when a renderNode oneOf item title does not end with 'Render Node'", () => {
			const result = validateSchemaStructure({
				definitions: {
					controlNode: { oneOf: [{ title: "Slider Control Node" }] },
					computeNode: { oneOf: [{ title: "Tick Compute Node" }] },
					renderNode: {
						oneOf: [
							{ title: "Circle" }, // missing "Render Node" suffix
						],
					},
				},
			});
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes('"Circle"') && e.includes('"Render Node"'))).toBe(true);
		});

		test("fails when a oneOf item is missing its title", () => {
			const result = validateSchemaStructure({
				definitions: {
					controlNode: {
						oneOf: [
							{ description: "no title here" },
						],
					},
					computeNode: { oneOf: [{ title: "Tick Compute Node" }] },
					renderNode: { oneOf: [{ title: "Circle Render Node" }] },
				},
			});
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("controlNode.oneOf[0] must have a title string");
		});

		test("collects errors from multiple node types in one pass", () => {
			const result = validateSchemaStructure({
				definitions: {
					controlNode: { oneOf: [{ title: "Slider" }] },
					computeNode: { oneOf: [{ title: "Wave Node" }] },
					renderNode: { oneOf: [{ title: "Circle" }] },
				},
			});
			expect(result.valid).toBe(false);
			expect(result.errors).toHaveLength(3);
		});
	});
});
