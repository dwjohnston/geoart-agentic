import type { LegacyComputeNodeDef } from "./ComputeNodeDefinition";
import type { LegacyControlNodeDef } from "./ControlNodeDefinition";
import type { LegacyRenderNodeDef } from "./RenderNodeDefinition";

export type LegacyNodeRegistry = {
	renderRegistry: Map<string, LegacyRenderNodeDef>;
	computeRegistry: Map<string, LegacyComputeNodeDef>;
	controlRegistry: Map<string, LegacyControlNodeDef>;
};
