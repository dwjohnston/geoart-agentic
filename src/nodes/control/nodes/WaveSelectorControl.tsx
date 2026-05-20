import { implementControlNode } from "../implementControlNode";
import { DropdownControl } from "../ui/DropdownControl";

const WAVE_TYPES = [
	"sine",
	"square",
	"triangle",
	"saw",
	"reverse-saw",
] as const;

const waveSelectorNodeDef = implementControlNode("waveSelector", {
	defaults: {
		label: "",
		value: "sine",
	},
	renderControl(node, set) {
		return (
			<DropdownControl
				id={node.id}
				label={node.params.label.v}
				options={WAVE_TYPES}
				initialValue={node.params.value.v}
				onChange={(v) => set("value", { v })}
			/>
		);
	},
});

export default waveSelectorNodeDef;
