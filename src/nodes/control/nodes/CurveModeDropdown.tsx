import { implementControlNode } from "../implementControlNode";
import { DropdownControl } from "../ui/DropdownControl";

const CURVE_MODES = ["straight", "catmull-rom"] as const;

export default implementControlNode("curveModeSelector", {
	defaults: {
		label: "",
		value: "straight",
	},
	renderControl(node, set) {
		return (
			<DropdownControl
				id={node.id}
				label={node.params.label.v}
				options={CURVE_MODES}
				initialValue={node.params.value.v}
				onChange={(v) => set("value", { v })}
			/>
		);
	},
});
