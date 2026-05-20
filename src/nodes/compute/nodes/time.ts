import type { LegacyComputeNodeDef } from "../../../graphEngine/externalInterfaces/ComputeNodeDefinition";

const timeNodeDef: LegacyComputeNodeDef = {
	type: "time",
	isTimeDependant: true,
	inputs: [],
	outputs: [
		// Exception to the -1..1 rule: tick count is unbounded.
		{ name: "time", type: "number" },
	],
	evaluate(_inputs, ctx) {
		return [{ kind: "number", v: ctx.tickCount }];
	},
};

export default timeNodeDef;
