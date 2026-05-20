import { describe, expect, test } from "bun:test";
import { GRAPHS } from "./index";
import { compile } from "../graphEngine/compiler/compiler";

import type { LegacyNodeRegistry } from "../graphEngine/externalInterfaces/AllNodeDefinitions";
import { computeRegistry } from "../nodes/compute/registry";
import { renderRegistry } from "../nodes/render/registry";
import { controlRegistry } from "../nodes/control/registry";

const realNodeRegistry: LegacyNodeRegistry = {
	computeRegistry: computeRegistry,
	renderRegistry: renderRegistry,
	controlRegistry: controlRegistry,
};

describe("all graphs compile without error", () => {
	for (const entry of GRAPHS) {
		test(entry.id, () => {
			expect(() => compile(entry.graph, realNodeRegistry)).not.toThrow();
		});
	}
});
