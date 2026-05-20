import type React from "react";
import type { Value } from "../../schema/types";
import type { ValueTypes } from "../../schema/_generated/value-kinds-2";
import type { ControlNode } from "../../schema/_generated/schema-types";
import type {
	ControlNodeKinds,
	NodeInputsResolved,
} from "../../schema/typeHelpers";
import type { nodeOutputMeta } from "../../schema/_generated/node-outputs-2";

// @legacy - this should have the possible value types derived from the schema
export type LegacyControlNodePortDef = {
	name: string;
	type: "number" | "string" | "boolean" | "color" | "point";
};

export type ResolvedParams = Record<string, { v: unknown }>;

type OutputPortNames<K extends keyof typeof nodeOutputMeta> =
	(typeof nodeOutputMeta)[K][number]["name"];

type OutputValueForPort<
	K extends keyof typeof nodeOutputMeta,
	PortName extends string,
> =
	Extract<(typeof nodeOutputMeta)[K][number], { name: PortName }> extends {
		valueType: `${infer Kind}Value`;
	}
		? Omit<Extract<ValueTypes, { kind: Kind }>, "kind">
		: never;

export type ControlSetter<K extends keyof typeof nodeOutputMeta> = <
	PortName extends OutputPortNames<K>,
>(
	paramKey: PortName,
	value: OutputValueForPort<K, PortName>,
) => void;

// Legacy format — used internally by the registry and graph layer
// We want to get rid of this
export type LegacyControlNodeDef = {
	type: string;
	outputs: LegacyControlNodePortDef[];
	evaluate(params: ResolvedParams): Value[];
	renderControl(
		node: Extract<ControlNode, { type: string }>,
		set: ControlSetter<keyof typeof nodeOutputMeta>,
	): React.ReactNode;
};

export type NodeWithDefaults<K extends ControlNodeKinds> = Omit<
	Extract<ControlNode, { type: K }>,
	"params"
> & {
	params: Required<Extract<ControlNode, { type: K }>["params"]>;
};

export type ControlNodeDef<K extends ControlNodeKinds> = {
	nodeKind: K;
	defaultValues: NodeInputsResolved<K>;
	renderControl: (
		node: NodeWithDefaults<K>,
		set: ControlSetter<K>,
	) => React.ReactNode;
};
