import { describe, expect, it } from "vitest";
import { createImportNoRestrictedPathsZones } from "./configureImportRules";

describe(createImportNoRestrictedPathsZones, () => {
	it("behaves correctly", () => {
		const result = createImportNoRestrictedPathsZones(
			{
				foo: "./foo",
				bar: "./bar",
				biz: "./biz",
			},
			{
				bar: {
					allowedZones: ["foo"],
				},
				foo: {
					allowedZones: [],
				},
				biz: {
					allowedZones: [],
				},
			},
		);

		const expectedResults = [
			{
				target: "./foo",
				from: "./bar",
			},
			{
				target: "./foo",
				from: "./biz",
			},
			{
				target: "./bar",
				from: "./biz",
			},
			{
				target: "./biz",
				from: "./foo",
			},
			{
				target: "./biz",
				from: "./bar",
			},
		];

		expectedResults.forEach((v) => {
			expect(result).toContainEqual(expect.objectContaining(v));
		});

		const unexpectedResults = [
			{
				target: "./foo",
				from: "./foo",
			},
			{
				target: "./bar",
				from: "./foo",
			},
		];

		unexpectedResults.forEach((v) => {
			expect(result).not.toContainEqual(expect.objectContaining(v));
		});

		expect(result).toHaveLength(5);
	});
});
