import { describe, expect, test } from 'bun:test';
import { validateSchemaStructure } from "./validateSchemaStructure";
import type { SchemaSet } from "./validateSchemaStructure";
import productionSchema from "./schema.json";
import productionValueKinds from "./value-kinds.schema.json";
import productionRefableValueKinds from "./refable-value-kinds.schema.json";

// Minimal valid fixture where every oneOf title ends with the correct layer suffix.
// Nodes have x-outputs arrays as required by the new rules.
const validStructuredSchema = {
	definitions: {
		controlNode: {
			oneOf: [
				{
					title: "Slider Control Node",
					"x-outputs": [{ name: "value", valueType: "numberValue" }],
					params: { properties: {} },
				},
				{
					title: "Color Picker Control Node",
					"x-outputs": [{ name: "value", valueType: "colorValue" }],
					params: { properties: {} },
				},
			],
		},
		computeNode: {
			oneOf: [
				{
					title: "Tick Compute Node",
					"x-outputs": [{ name: "time", valueType: "numberValue" }],
					params: { properties: {} },
				},
				{
					title: "Wave Compute Node",
					"x-outputs": [{ name: "value", valueType: "numberValue" }],
					params: { properties: {} },
				},
			],
		},
		renderNode: {
			oneOf: [
				{
					title: "Circle Render Node",
					"x-outputs": [],
					params: { properties: {} },
				},
			],
		},
	},
};

/** Wrap a single schema object as a SchemaSet so old tests can keep working. */
function asSchemaSet(schema: unknown): SchemaSet {
	return {
		"schema.json": schema,
		"value-kinds.schema.json": productionValueKinds,
		"refable-value-kinds.schema.json": productionRefableValueKinds,
	};
}

/** Full production SchemaSet. */
const productionSchemaSet: SchemaSet = {
	"schema.json": productionSchema,
	"value-kinds.schema.json": productionValueKinds,
	"refable-value-kinds.schema.json": productionRefableValueKinds,
};

/** Minimal value-kinds fixture with the definitions referenced in validStructuredSchema. */
const minimalValueKinds = {
	definitions: {
		numberValue: { title: "Number Value", type: "number" },
		colorValue: { title: "Color Value", type: "object" },
	},
};

describe("validateSchemaStructure", () => {
	describe("production schemas", () => {
		test("passes with the full production SchemaSet", () => {
			const result = validateSchemaStructure(productionSchemaSet);
			expect(result.errors).toEqual([]);
			expect(result.valid).toBe(true);
		});
	});

	describe("valid schema structure", () => {
		test("passes when all oneOf titles end with the correct layer suffix", () => {
			const result = validateSchemaStructure(asSchemaSet(validStructuredSchema));
			expect(result.valid).toBe(true);
			expect(result.errors).toEqual([]);
		});

		test("passes with full SchemaSet including auxiliary schemas", () => {
			const schemas: SchemaSet = {
				"schema.json": validStructuredSchema,
				"value-kinds.schema.json": minimalValueKinds,
				"refable-value-kinds.schema.json": {
					definitions: {
						numberValueOrRef: { title: "Number Value Or Ref" },
					},
				},
			};
			const result = validateSchemaStructure(schemas);
			expect(result.valid).toBe(true);
			expect(result.errors).toEqual([]);
		});
	});

	describe("problematic schemas", () => {
		test("fails when not an object", () => {
			const result = validateSchemaStructure(asSchemaSet("not an object"));
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("Schema must be an object");
		});

		test("fails when definitions is missing", () => {
			const result = validateSchemaStructure(asSchemaSet({ title: "GeoArt Graph" }));
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("Schema must have a definitions object");
		});

		test("fails when controlNode definition is missing", () => {
			const result = validateSchemaStructure(asSchemaSet({
				definitions: {
					computeNode: { oneOf: [{ title: "Tick Compute Node" }] },
					renderNode: { oneOf: [{ title: "Circle Render Node" }] },
				},
			}));
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("Missing definition: controlNode");
		});

		test("fails when computeNode definition is missing", () => {
			const result = validateSchemaStructure(asSchemaSet({
				definitions: {
					controlNode: { oneOf: [{ title: "Slider Control Node" }] },
					renderNode: { oneOf: [{ title: "Circle Render Node" }] },
				},
			}));
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("Missing definition: computeNode");
		});

		test("fails when renderNode definition is missing", () => {
			const result = validateSchemaStructure(asSchemaSet({
				definitions: {
					controlNode: { oneOf: [{ title: "Slider Control Node" }] },
					computeNode: { oneOf: [{ title: "Tick Compute Node" }] },
				},
			}));
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("Missing definition: renderNode");
		});

		test("fails when a node definition lacks a oneOf array", () => {
			const result = validateSchemaStructure(asSchemaSet({
				definitions: {
					controlNode: { description: "no oneOf here" },
					computeNode: { oneOf: [{ title: "Tick Compute Node" }] },
					renderNode: { oneOf: [{ title: "Circle Render Node" }] },
				},
			}));
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("controlNode must have a oneOf array");
		});

		test("fails when a controlNode oneOf item title does not end with 'Control Node'", () => {
			const result = validateSchemaStructure(asSchemaSet({
				definitions: {
					controlNode: {
						oneOf: [
							{ title: "Slider" }, // missing "Control Node" suffix
						],
					},
					computeNode: { oneOf: [{ title: "Tick Compute Node" }] },
					renderNode: { oneOf: [{ title: "Circle Render Node" }] },
				},
			}));
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes('"Slider"') && e.includes('"Control Node"'))).toBe(true);
		});

		test("fails when a computeNode oneOf item title does not end with 'Compute Node'", () => {
			const result = validateSchemaStructure(asSchemaSet({
				definitions: {
					controlNode: { oneOf: [{ title: "Slider Control Node" }] },
					computeNode: {
						oneOf: [
							{ title: "Wave Node" }, // missing "Compute Node" suffix
						],
					},
					renderNode: { oneOf: [{ title: "Circle Render Node" }] },
				},
			}));
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes('"Wave Node"') && e.includes('"Compute Node"'))).toBe(true);
		});

		test("fails when a renderNode oneOf item title does not end with 'Render Node'", () => {
			const result = validateSchemaStructure(asSchemaSet({
				definitions: {
					controlNode: { oneOf: [{ title: "Slider Control Node" }] },
					computeNode: { oneOf: [{ title: "Tick Compute Node" }] },
					renderNode: {
						oneOf: [
							{ title: "Circle" }, // missing "Render Node" suffix
						],
					},
				},
			}));
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes('"Circle"') && e.includes('"Render Node"'))).toBe(true);
		});

		test("fails when a oneOf item is missing its title", () => {
			const result = validateSchemaStructure(asSchemaSet({
				definitions: {
					controlNode: {
						oneOf: [
							{ description: "no title here" },
						],
					},
					computeNode: { oneOf: [{ title: "Tick Compute Node" }] },
					renderNode: { oneOf: [{ title: "Circle Render Node" }] },
				},
			}));
			expect(result.valid).toBe(false);
			expect(result.errors).toContain("controlNode.oneOf[0] must have a title string");
		});

		test("collects errors from multiple node types in one pass", () => {
			const result = validateSchemaStructure(asSchemaSet({
				definitions: {
					controlNode: { oneOf: [{ title: "Slider" }] },
					computeNode: { oneOf: [{ title: "Wave Node" }] },
					renderNode: { oneOf: [{ title: "Circle" }] },
				},
			}));
			expect(result.valid).toBe(false);
			// At minimum, one title error per node type. Additional errors (e.g. missing
			// x-outputs) may also be reported — the important thing is all three layers
			// are checked in a single pass.
			expect(result.errors.length).toBeGreaterThanOrEqual(3);
			expect(result.errors.some((e) => e.includes("controlNode") && e.includes('"Control Node"'))).toBe(true);
			expect(result.errors.some((e) => e.includes("computeNode") && e.includes('"Compute Node"'))).toBe(true);
			expect(result.errors.some((e) => e.includes("renderNode") && e.includes('"Render Node"'))).toBe(true);
		});
	});

	describe("naming conventions", () => {
		test("fails when a value-kinds definition name does not end with 'Value'", () => {
			const schemas: SchemaSet = {
				"schema.json": validStructuredSchema,
				"refable-value-kinds.schema.json": {
					definitions: {
						numberValueOrRef: { title: "Number Value Or Ref" },
						numberParam: { title: "Number Param" }, // missing "ValueOrRef" suffix
					},
				},
				"value-kinds.schema.json": {
					definitions: {
						numberValue: { title: "Number Value" },
						badName: { title: "Bad Name" }, // missing "Value" suffix
					},
				},
			};
			const result = validateSchemaStructure(schemas);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes('"badName"') && e.includes('value-kinds.schema.json'))).toBe(true);
		});

		test("fails when a refable-value-kinds definition name does not end with 'ValueOrRef'", () => {
			const schemas: SchemaSet = {
				"schema.json": validStructuredSchema,
				"value-kinds.schema.json": {
					definitions: {
						numberValue: { title: "Number Value" },
					},
				},
				"refable-value-kinds.schema.json": {
					definitions: {
						numberValueOrRef: { title: "Number Value Or Ref" },
						numberParam: { title: "Number Param" }, // missing "ValueOrRef" suffix
					},
				},
			};
			const result = validateSchemaStructure(schemas);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes('"numberParam"') && e.includes('refable-value-kinds.schema.json'))).toBe(true);
		});

		test("passes when all value-kinds definitions end with 'Value'", () => {
			const schemas: SchemaSet = {
				"schema.json": validStructuredSchema,
				"value-kinds.schema.json": {
					definitions: {
						numberValue: { title: "Number Value" },
						colorValue: { title: "Color Value" },

					},
				},
				"refable-value-kinds.schema.json": {
					definitions: {
						numberValueOrRef: { title: "Number Value Or Ref" },
					},
				},
			};
			const result = validateSchemaStructure(schemas);
			expect(result.valid).toBe(true);
		});

		describe("array value kinds naming convention", () => {
			test("fails when a kind has an array type but does not end with 'Array'", () => {
				const schemas: SchemaSet = {
					"schema.json": validStructuredSchema,
					"value-kinds.schema.json": {
						definitions: {
							numberValue: { title: "Number Value", type: "object", properties: { v: { type: "number" } } },
							numberCollectionValue: { // kind "numberCollection" (array type) but doesn't end with "Array"
								title: "Number Collection Value",
								type: "object",
								properties: {
									v: {
										type: "array",
										items: { type: "number" },
									},
								},
							},
						},
					},
					"refable-value-kinds.schema.json": {
						definitions: {
							numberValueOrRef: { title: "Number Value Or Ref" },
							numberCollectionValueOrRef: { title: "Number Collection Value Or Ref" },
						},
					},
				};
				const result = validateSchemaStructure(schemas);
				expect(result.valid).toBe(false);
				expect(result.errors.some((e) =>
					e.includes('"numberCollectionValue"') && e.includes("does not end with \"Array\"")
				)).toBe(true);
			});

			test("fails when a kind ends with 'Array' but is not an array type", () => {
				const schemas: SchemaSet = {
					"schema.json": validStructuredSchema,
					"value-kinds.schema.json": {
						definitions: {
							numberValue: { title: "Number Value", type: "object", properties: { v: { type: "number" } } },
							colorArrayValue: { // kind "colorArray" ends with "Array" but isn't an array type
								title: "Color Array Value",
								type: "object",
								properties: {
									v: {
										type: "object",
										properties: { r: { type: "number" } },
									},
								},
							},
						},
					},
					"refable-value-kinds.schema.json": {
						definitions: {
							numberValueOrRef: { title: "Number Value Or Ref" },
							colorArrayValueOrRef: { title: "Color Array Value Or Ref" },
						},
					},
				};
				const result = validateSchemaStructure(schemas);
				expect(result.valid).toBe(false);
				expect(result.errors.some((e) =>
					e.includes('"colorArrayValue"') && e.includes("kind ends with \"Array\" but does not have an array type")
				)).toBe(true);
			});

			test("passes when array kinds end with 'Array' and non-array kinds do not", () => {
				const schemas: SchemaSet = {
					"schema.json": validStructuredSchema,
					"value-kinds.schema.json": {
						definitions: {
							numberValue: {
								title: "Number Value",
								type: "object",
								properties: { v: { type: "number" } },
							},
							numberArrayValue: {
								title: "Number Array Value",
								type: "object",
								properties: {
									v: {
										type: "array",
										items: { type: "number" },
									},
								},
							},
							colorValue: {
								title: "Color Value",
								type: "object",
								properties: {
									v: {
										type: "object",
										properties: { r: { type: "number" }, g: { type: "number" } },
									},
								},
							},
							colorPointArrayValue: {
								title: "Color Point Array Value",
								type: "object",
								properties: {
									v: {
										type: "array",
										items: {
											$ref: "#/definitions/colorValue",
										},
									},
								},
							},
						},
					},
					"refable-value-kinds.schema.json": {
						definitions: {
							numberValueOrRef: { title: "Number Value Or Ref" },
							numberArrayValueOrRef: { title: "Number Array Value Or Ref" },
							colorValueOrRef: { title: "Color Value Or Ref" },
							colorPointArrayValueOrRef: { title: "Color Point Array Value Or Ref" },
						},
					},
				};
				const result = validateSchemaStructure(schemas);
				expect(result.valid).toBe(true);
			});
		});
	});

	describe("x-outputs completeness", () => {
		test("fails when a node is missing x-outputs", () => {
			const schemas: SchemaSet = {
				"schema.json": {
					definitions: {
						controlNode: {
							oneOf: [
								{ title: "Slider Control Node", params: { properties: {} } }, // no x-outputs
							],
						},
						computeNode: { oneOf: [{ title: "Tick Compute Node", "x-outputs": [], params: { properties: {} } }] },
						renderNode: { oneOf: [{ title: "Circle Render Node", "x-outputs": [], params: { properties: {} } }] },
					},
				},
				"value-kinds.schema.json": {
					definitions: {
						numberValue: { title: "Number Value" },
					},
				},
				"refable-value-kinds.schema.json": {
					definitions: {
						numberValueOrRef: { title: "Number Value Or Ref" },
					},
				},
			};
			const result = validateSchemaStructure(schemas);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes("controlNode.oneOf[0]") && e.includes("x-outputs"))).toBe(true);
		});

		test("fails when an x-outputs entry has an unrecognised valueType", () => {
			const schemas: SchemaSet = {
				"schema.json": {
					definitions: {
						controlNode: {
							oneOf: [
								{
									title: "Slider Control Node",
									"x-outputs": [{ name: "value", valueType: "bogusValue" }],
									params: { properties: {} },
								},
							],
						},
						computeNode: { oneOf: [{ title: "Tick Compute Node", "x-outputs": [], params: { properties: {} } }] },
						renderNode: { oneOf: [{ title: "Circle Render Node", "x-outputs": [], params: { properties: {} } }] },
					},
				},
				"value-kinds.schema.json": {
					definitions: {
						numberValue: { title: "Number Value" },
					},
				},
				"refable-value-kinds.schema.json": {
					definitions: {
						numberValueOrRef: { title: "Number Value Or Ref" },
					},
				},
			};
			const result = validateSchemaStructure(schemas);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes('"bogusValue"') && e.includes('value-kinds.schema.json'))).toBe(true);
		});
	});

	describe("param origin by layer", () => {
		test("fails when a control node param refs into refable-value-kinds.schema.json", () => {
			const schemas: SchemaSet = {
				"schema.json": {
					definitions: {
						controlNode: {
							oneOf: [
								{
									title: "Slider Control Node",
									"x-outputs": [],
									params: {
										properties: {
											value: { "$ref": "refable-value-kinds.schema.json#/definitions/numberValueOrRef" },
										},
									},
								},
							],
						},
						computeNode: { oneOf: [{ title: "Tick Compute Node", "x-outputs": [], params: { properties: {} } }] },
						renderNode: { oneOf: [{ title: "Circle Render Node", "x-outputs": [], params: { properties: {} } }] },
					},
				},
				"value-kinds.schema.json": { definitions: { numberValue: {} } },
				"refable-value-kinds.schema.json": { definitions: { numberValueOrRef: {} } },
			};
			const result = validateSchemaStructure(schemas);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes("controlNode") && e.includes("value-kinds.schema.json"))).toBe(true);
		});

		test("fails when a compute node param refs into value-kinds.schema.json", () => {
			const schemas: SchemaSet = {
				"schema.json": {
					definitions: {
						controlNode: {
							oneOf: [
								{
									title: "Slider Control Node",
									"x-outputs": [],
									params: { properties: {} },
								},
							],
						},
						computeNode: {
							oneOf: [
								{
									title: "Wave Compute Node",
									"x-outputs": [],
									params: {
										properties: {
											time: { "$ref": "value-kinds.schema.json#/definitions/numberValue" },
										},
									},
								},
							],
						},
						renderNode: { oneOf: [{ title: "Circle Render Node", "x-outputs": [], params: { properties: {} } }] },
					},
				},
				"value-kinds.schema.json": { definitions: { numberValue: {} } },
				"refable-value-kinds.schema.json": { definitions: { numberValueOrRef: {} } },
			};
			const result = validateSchemaStructure(schemas);
			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes("computeNode") && e.includes("refable-value-kinds.schema.json"))).toBe(true);
		});

		test("passes when compute node params use refable-value-kinds.schema.json", () => {
			const schemas: SchemaSet = {
				"schema.json": {
					definitions: {
						controlNode: {
							oneOf: [
								{
									title: "Slider Control Node",
									"x-outputs": [{ name: "value", valueType: "numberValue" }],
									params: { properties: {} },
								},
							],
						},
						computeNode: {
							oneOf: [
								{
									title: "Wave Compute Node",
									"x-outputs": [{ name: "value", valueType: "numberValue" }],
									params: {
										properties: {
											time: { "$ref": "refable-value-kinds.schema.json#/definitions/numberValueOrRef" },
										},
									},
								},
							],
						},
						renderNode: { oneOf: [{ title: "Circle Render Node", "x-outputs": [], params: { properties: {} } }] },
					},
				},
				"value-kinds.schema.json": { definitions: { numberValue: {} } },
				"refable-value-kinds.schema.json": { definitions: { numberValueOrRef: {} } },
			};
			const result = validateSchemaStructure(schemas);
			expect(result.valid).toBe(true);
		});
	});

	describe("module structure", () => {
		describe("valid module structure", () => {
			test("module params use refable values (like compute/render nodes)", () => {
				// Module node params reference refable-value-kinds.schema.json, allowing
				// both static values and references to other node outputs in algorithm declarations.
				// Example: a module param can be { v: 0.5 } or { ref: "slider.value" }
				const schemas: SchemaSet = {
					"schema.json": {
						definitions: {
							controlNode: {
								oneOf: [{ title: "Slider Control Node", "x-outputs": [{ name: "value", valueType: "numberValue" }], params: { properties: {} } }],
							},
							computeNode: { oneOf: [{ title: "Tick Compute Node", "x-outputs": [{ name: "time", valueType: "numberValue" }], params: { properties: {} } }] },
							renderNode: { oneOf: [{ title: "Circle Render Node", "x-outputs": [], params: { properties: {} } }] },
							moduleNode: {
								oneOf: [
									{
										title: "Custom Module Node",
										"x-outputs": [{ name: "result", valueType: "numberValue" }],
										required: ["id", "type", "params"],
										properties: {
											id: { type: "string" },
											type: { enum: ["custom-module"] },
											params: {
												type: "object",
												properties: {
													amplitude: { "$ref": "refable-value-kinds.schema.json#/definitions/numberValueOrRef" },
													frequency: { "$ref": "refable-value-kinds.schema.json#/definitions/numberValueOrRef" },
												},
											},
										},
									},
								],
							},
						},
					},
					"value-kinds.schema.json": {
						definitions: {
							numberValue: { title: "Number Value" },
						},
					},
					"refable-value-kinds.schema.json": {
						definitions: {
							numberValueOrRef: { title: "Number Value Or Ref" },
						},
					},
				};
				const result = validateSchemaStructure(schemas);
				expect(result.valid).toBe(true);
			});
		});

		describe("invalid module structure", () => {
			test("fails when module controls property has non-boolean type", () => {
				const schemas: SchemaSet = {
					"schema.json": {
						definitions: {
							controlNode: {
								oneOf: [{ title: "Slider Control Node", "x-outputs": [{ name: "value", valueType: "numberValue" }], params: { properties: {} } }],
							},
							computeNode: { oneOf: [{ title: "Tick Compute Node", "x-outputs": [{ name: "time", valueType: "numberValue" }], params: { properties: {} } }] },
							renderNode: { oneOf: [{ title: "Circle Render Node", "x-outputs": [], params: { properties: {} } }] },
							moduleNode: {
								oneOf: [
									{
										title: "Bad Module Node",
										"x-outputs": [{ name: "value", valueType: "numberValue" }],
										required: ["id", "type", "params"],
										properties: {
											id: { type: "string" },
											type: { enum: ["bad-module"] },
											params: { type: "object", properties: {} },
											controls: {
												type: "object",
												additionalProperties: false,
												properties: {
													speed: { type: "number" }, // Invalid: should be boolean
												},
											},
										},
									},
								],
							},
						},
					},
					"value-kinds.schema.json": {
						definitions: {
							numberValue: { title: "Number Value" },
						},
					},
					"refable-value-kinds.schema.json": {
						definitions: {
							numberValueOrRef: { title: "Number Value Or Ref" },
						},
					},
				};
				const result = validateSchemaStructure(schemas);
				expect(result.valid).toBe(false);
				expect(result.errors.some((e) => e.includes("controls") && e.includes("speed") && e.includes("boolean"))).toBe(true);
			});

			test("fails when module render property has non-boolean type in nested layer", () => {
				const schemas: SchemaSet = {
					"schema.json": {
						definitions: {
							controlNode: {
								oneOf: [{ title: "Slider Control Node", "x-outputs": [{ name: "value", valueType: "numberValue" }], params: { properties: {} } }],
							},
							computeNode: { oneOf: [{ title: "Tick Compute Node", "x-outputs": [{ name: "time", valueType: "numberValue" }], params: { properties: {} } }] },
							renderNode: { oneOf: [{ title: "Circle Render Node", "x-outputs": [], params: { properties: {} } }] },
							moduleNode: {
								oneOf: [
									{
										title: "Bad Render Module Node",
										"x-outputs": [{ name: "value", valueType: "numberValue" }],
										required: ["id", "type", "params"],
										properties: {
											id: { type: "string" },
											type: { enum: ["bad-module"] },
											params: { type: "object", properties: {} },
											render: {
												type: "object",
												additionalProperties: false,
												properties: {
													live: {
														type: "object",
														additionalProperties: false,
														properties: {
															trail: { type: "string" }, // Invalid: should be boolean
														},
													},
												},
											},
										},
									},
								],
							},
						},
					},
					"value-kinds.schema.json": {
						definitions: {
							numberValue: { title: "Number Value" },
						},
					},
					"refable-value-kinds.schema.json": {
						definitions: {
							numberValueOrRef: { title: "Number Value Or Ref" },
						},
					},
				};
				const result = validateSchemaStructure(schemas);
				expect(result.valid).toBe(false);
				expect(result.errors.some((e) => e.includes("render") && e.includes("live") && e.includes("trail") && e.includes("boolean"))).toBe(true);
			});
		});

	});
});
