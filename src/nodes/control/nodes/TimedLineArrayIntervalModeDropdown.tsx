import { implementControlNode } from "../implementControlNode";
import { DropdownControl } from "../ui/DropdownControl";

const TIMED_LINE_ARRAY_INTERVAL_MODES = [
	"all",
	"cycle",
	"back-and-forth",
	"inside-out",
	"inside-out-and-forth",
] as const;

export default implementControlNode("timedLineArrayIntervalModeSelector", {
	defaults: {
		label: "",
		value: "all",
	},
	renderControl(node, set) {
		return (
			<DropdownControl
				id={node.id}
				label={node.params.label.v}
				options={TIMED_LINE_ARRAY_INTERVAL_MODES}
				initialValue={node.params.value.v}
				onChange={(v) => set("value", { v })}
			/>
		);
	},
});
