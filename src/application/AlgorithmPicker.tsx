import { useState } from "react";
import type { GRAPHS } from "../algorithms/index";

type GraphEntry = (typeof GRAPHS)[number];

type Props = {
	graphs: readonly GraphEntry[];
	defaultId: string;
	onChange: (id: string) => void;
};

export function AlgorithmPicker({ graphs, defaultId, onChange }: Props) {
	const [selectedId, setSelectedId] = useState(defaultId);
	const currentName =
		graphs.find((g) => g.id === selectedId)?.name ?? selectedId;

	function handleChange(id: string) {
		setSelectedId(id);
		onChange(id);
	}

	return (
		<>
			<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
				<label htmlFor="graph-select" style={{ fontSize: 13, color: "#aaa" }}>
					Graph
				</label>
				<select
					id="graph-select"
					value={selectedId}
					onChange={(e) => handleChange(e.target.value)}
					style={{
						background: "#1a1a26",
						color: "#eee",
						border: "1px solid #333",
						borderRadius: 4,
						padding: "4px 8px",
						fontSize: 14,
						cursor: "pointer",
					}}
				>
					{graphs.map((entry) => (
						<option key={entry.id} value={entry.id}>
							{entry.name}
						</option>
					))}
				</select>
			</div>

			<h2 style={{ margin: 0, fontSize: 16, color: "#eee" }}>{currentName}</h2>
		</>
	);
}
