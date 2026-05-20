import { useRef, useState } from "react";

type Props = {
	value: number;
	min: number;
	max: number;
	size: "sm" | "lg";
	label: string;
	onChange: (value: number) => void;
};

// 200 px of vertical drag covers the full range
const DRAG_TRAVEL_PX = 200;

// Indicator line rotates from -135° (min) to +135° (max)
const ROTATION_MIN = -135;
const ROTATION_MAX = 135;

function valueToRotation(value: number, min: number, max: number): number {
	const fraction = (value - min) / (max - min);
	return ROTATION_MIN + fraction * (ROTATION_MAX - ROTATION_MIN);
}

export function KnobControl({ value, min, max, size, label, onChange }: Props) {
	const diameter = size === "lg" ? 64 : 36;
	const strokeWidth = size === "lg" ? 3 : 2;
	const indicatorLength = diameter / 2 - strokeWidth - 2;

	const dragStartY = useRef<number | null>(null);
	const dragStartValue = useRef<number>(value);
	const [isDragging, setIsDragging] = useState(false);

	const rotation = valueToRotation(value, min, max);

	function handleMouseDown(e: React.MouseEvent) {
		e.preventDefault();
		dragStartY.current = e.clientY;
		dragStartValue.current = value;
		setIsDragging(true);

		function handleMouseMove(moveEvent: MouseEvent) {
			if (dragStartY.current === null) return;
			const dy = dragStartY.current - moveEvent.clientY; // dragging up increases value
			const fraction = dy / DRAG_TRAVEL_PX;
			const newValue = Math.min(
				max,
				Math.max(min, dragStartValue.current + fraction * (max - min)),
			);
			onChange(newValue);
		}

		function handleMouseUp() {
			dragStartY.current = null;
			setIsDragging(false);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		}

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	}

	const cx = diameter / 2;
	const cy = diameter / 2;
	const radius = diameter / 2 - strokeWidth;

	// Indicator line from centre towards the edge at the current rotation
	const angleRad = ((rotation - 90) * Math.PI) / 180;
	const x2 = cx + indicatorLength * Math.cos(angleRad);
	const y2 = cy + indicatorLength * Math.sin(angleRad);

	return (
		<div
			className="knob-control"
			style={{
				display: "inline-flex",
				flexDirection: "column",
				alignItems: "center",
				userSelect: "none",
			}}
		>
			<svg
				width={diameter}
				height={diameter}
				onMouseDown={handleMouseDown}
				style={{ cursor: isDragging ? "ns-resize" : "pointer" }}
				aria-label={label}
			>
				{/* Knob body */}
				<circle
					cx={cx}
					cy={cy}
					r={radius}
					fill="#2a2a2a"
					stroke="#555"
					strokeWidth={strokeWidth}
				/>
				{/* Indicator line */}
				<line
					x1={cx}
					y1={cy}
					x2={x2}
					y2={y2}
					stroke="#e0e0e0"
					strokeWidth={strokeWidth}
					strokeLinecap="round"
				/>
			</svg>
			<span
				style={{
					fontSize: size === "lg" ? "0.75rem" : "0.65rem",
					color: "#aaa",
					marginTop: 2,
				}}
			>
				{label}
			</span>
		</div>
	);
}
