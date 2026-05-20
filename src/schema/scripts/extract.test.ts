import { describe, it, expect } from "bun:test";
import { extractDerviedSchema } from "./generate-derived-schema";
import {
	buildNodeInputs,
	generateOutputs,
	jsonSchemaValueKindsToTypeScript,
} from "./generate-derived-types";

//🧽 Find a nice way of typing Json Schema objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const minimalValueKindsSchema: any = {
	$schema: "https://json-schema.org/draft/2019-09/schema",
	title: "Test Value Kinds",
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
					items: { $ref: "#/definitions/numberValue" },
				},
			},
		},
		stringValue: {
			title: "String Value",
			type: "object",
			properties: { v: { type: "string" } },
		},
		nullableColorValue: {
			title: "Nullable Color Value",
			type: "object",
			properties: {
				v: {
					type: "object",
					properties: {
						r: { type: ["number", "null"] },
					},
				},
			},
		},
	},
};
//🧽 Find a nice way of typing Json Schema objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const minimalNodeSchema: any = {
	$schema: "https://json-schema.org/draft/2019-09/schema",
	definitions: {
		controlNode: {
			oneOf: [
				{
					properties: {
						type: { enum: ["slider"] },
						params: {
							properties: {
								value: {
									$ref: "refable-value-kinds.schema.json#/definitions/numberValueOrRef",
								},
							},
						},
					},
				},
			],
		},
		computeNode: {
			oneOf: [
				{
					properties: {
						type: { enum: ["add"] },
						params: {
							properties: {
								a: {
									$ref: "refable-value-kinds.schema.json#/definitions/numberValueOrRef",
								},
								b: {
									$ref: "refable-value-kinds.schema.json#/definitions/numberValueOrRef",
								},
							},
						},
					},
					"x-outputs": [{ name: "sum", valueType: "numberValue" }],
				},
			],
		},
		renderNode: {
			oneOf: [
				{
					properties: {
						type: { enum: ["circle"] },
						params: {
							properties: {
								radius: {
									$ref: "refable-value-kinds.schema.json#/definitions/numberValueOrRef",
								},
							},
						},
					},
					"x-outputs": [{ name: "drawn", valueType: "numberValue" }],
				},
			],
		},
	},
};

describe("extract-derived-schema", () => {
	it("generates refable-value-kinds schema", () => {
		const result = extractDerviedSchema(minimalValueKindsSchema);
		expect(result).toMatchInlineSnapshot(`
		  {
		    "$schema": "https://json-schema.org/draft/2019-09/schema",
		    "definitions": {
		      "nullableColorValueOrRef": {
		        "oneOf": [
		          {
		            "$ref": "value-kinds.schema.json#/definitions/nullableColorValue",
		          },
		          {
		            "$ref": "schema.json#/definitions/refParam",
		          },
		        ],
		        "title": "Nullable Color Value Or Ref",
		      },
		      "numberArrayValueOrRef": {
		        "oneOf": [
		          {
		            "properties": {
		              "v": {
		                "items": {
		                  "oneOf": [
		                    {
		                      "$ref": "value-kinds.schema.json#/definitions/numberValue",
		                    },
		                    {
		                      "$ref": "schema.json#/definitions/refParam",
		                    },
		                  ],
		                },
		                "type": "array",
		              },
		            },
		            "title": "Number Array Value",
		            "type": "object",
		          },
		          {
		            "$ref": "schema.json#/definitions/refParam",
		          },
		        ],
		        "title": "Number Array Value Or Ref",
		      },
		      "numberValueOrRef": {
		        "oneOf": [
		          {
		            "$ref": "value-kinds.schema.json#/definitions/numberValue",
		          },
		          {
		            "$ref": "schema.json#/definitions/refParam",
		          },
		        ],
		        "title": "Number Value Or Ref",
		      },
		      "stringValueOrRef": {
		        "oneOf": [
		          {
		            "$ref": "value-kinds.schema.json#/definitions/stringValue",
		          },
		          {
		            "$ref": "schema.json#/definitions/refParam",
		          },
		        ],
		        "title": "String Value Or Ref",
		      },
		    },
		    "description": "Param-level definitions: each value kind as either a static value or a ref to another node's output",
		    "title": "GeoArt Refable Value Kinds",
		  }
		`);
	});
});

describe("extract-node-inputs", () => {
	it("generates node inputs metadata", () => {
		const result = buildNodeInputs(minimalNodeSchema);
		expect(result).toMatchInlineSnapshot(`
		  "export const nodeInputs = {
		    "slider": {
		      "value": {
		        "valueType": "numberValue"
		      } as const
		    },
		    "add": {
		      "a": {
		        "valueType": "numberValue"
		      } as const,
		      "b": {
		        "valueType": "numberValue"
		      } as const
		    },
		    "circle": {
		      "radius": {
		        "valueType": "numberValue"
		      } as const
		    }
		  };
		  "
		`);
	});
});

describe("extract-node-outputs", () => {
	it("generates node outputs metadata", () => {
		const result = generateOutputs(minimalNodeSchema);
		expect(result).toMatchInlineSnapshot(`
		  "// generated — do not edit
		  export const nodeOutputMeta = {
		    "slider": [] as const,
		    "add": [{"name":"sum","valueType":"numberValue"}] as const,
		    "circle": [{"name":"drawn","valueType":"numberValue"}] as const,
		  } as const;
		  "
		`);
	});
});

describe("extract-value-types", () => {
	it("generates TypeScript types from value kinds schema", () => {
		const result = jsonSchemaValueKindsToTypeScript(minimalValueKindsSchema);
		expect(result).toMatchInlineSnapshot(`
		  "export type V_numberValue = { kind: 'number'; v: number };
		  export type V_numberArrayValue = { kind: 'numberArray'; v: Array<number> };
		  export type V_stringValue = { kind: 'string'; v: string };
		  export type V_nullableColorValue = { kind: 'nullableColor'; v: { r: number | null } };

		  export type ValueTypes = V_numberValue | V_numberArrayValue | V_stringValue | V_nullableColorValue;"
		`);
	});
});
