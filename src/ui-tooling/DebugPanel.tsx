import { useState } from "react";

interface DebugPanelProps {
	value: unknown;
	label?: string;
}

export function DebugPanel({ value, label = "Debug" }: DebugPanelProps) {
	const [open, setOpen] = useState(true);

	return (
		<div
			style={{
				border: "2px solid orange",
				borderRadius: 4,
				margin: 4,
				fontFamily: "monospace",
				fontSize: 12,
			}}
		>
			<button
				onClick={() => setOpen((o) => !o)}
				style={{
					width: "100%",
					background: "orange",
					border: "none",
					cursor: "pointer",
					padding: "2px 6px",
					textAlign: "left",
					fontWeight: "bold",
				}}
			>
				{open ? "▾" : "▸"} {label}
			</button>
			{open && (
				<pre
					style={{
						margin: 0,
						padding: 6,
						overflowX: "auto",
						whiteSpace: "pre-wrap",
						wordBreak: "break-all",
					}}
				>
					{JSON.stringify(value, null, 2)}
				</pre>
			)}
		</div>
	);
}
