import type { LegacyComputeNodeImplementation } from "./ComputeNodeImplementation";
import type { LegacyControlNodeImplementation } from "./ControlNodeImplementation";
import type { LegacyRenderNodeImplementation } from "./RenderNodeImplementation"

export type LegacyNodeRegistry = {
    renderRegistry: Map<string, LegacyRenderNodeImplementation>;
    computeRegistry: Map<string, LegacyComputeNodeImplementation>;
    controlRegistry: Map<string, LegacyControlNodeImplementation>;
}