import type {
	NodeInputsResolved,
	RenderNodeKinds,
} from "../../schema/typeHelpers";
import type { Value } from "../../schema/types";

//@legacy - we are trying to get rid of this
export type LegacyRenderNodePortDef = {
	name: string;
	type:
		| "number"
		| "color"
		| "point"
		| "colorPoint"
		| "colorPointArray"
		| "trigger";
	default?: Value;
};

export type RenderEvalContext = {
	/** Pre-selected canvas for this node — chosen by the evaluator from renderConfig.layer. */
	canvas: CanvasRenderingContext2D;
	width: number;
	height: number;
	/** Read this node's persisted state. Returns undefined on first call. */
	getState?: <T>() => T | undefined;
	/** Persist state for this node; retrieved on the next tick via getState. */
	setState?: <T>(s: T) => void;
};

//@legacy
export type LegacyRenderNodeDef = {
	type: string;
	inputs: LegacyRenderNodePortDef[];
	outputs: LegacyRenderNodePortDef[];
	evaluate(inputs: Value[], ctx: RenderEvalContext): void;
};

export type RenderNodeDef<K extends RenderNodeKinds> = {
	nodeKind: K;
	defaultValues: NodeInputsResolved<K>;
	evaluate: (inputs: NodeInputsResolved<K>, ctx: RenderEvalContext) => void;
};
