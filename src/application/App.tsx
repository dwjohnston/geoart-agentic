import { useEffect, useRef, useState } from "react";
import { GRAPHS, DEFAULT_GRAPH_ID, getGraph } from "../algorithms/index";
import { createGraphEngine } from "../graphEngine/graphEngine/graphEngine";
import type {
	GraphEngine,
	GraphLoadPayload,
} from "../graphEngine/graphEngine/graphEngine";
import { Canvas } from "./Canvas";
import { SidePanel } from "./SidePanel";
import { AlgorithmPicker } from "./AlgorithmPicker";
import { Controls } from "./Controls";
import { SpeedControl } from "./SpeedControl";
import { RenderToggles } from "./RenderToggles";
import { NeverShouldHappenError } from "../common-tooling/errors/NeverShouldHappenError";

const CANVAS_SIZE = 800;

export function App() {
	const orbitCanvasRef = useRef<HTMLCanvasElement>(null);
	const trailCanvasRef = useRef<HTMLCanvasElement>(null);
	const engineRef = useRef<GraphEngine | null>(null);

	const getInitialGraphId = () => {
		const params = new URLSearchParams(window.location.search);
		const paramId = params.get("algorithm");
		if (paramId && GRAPHS.some((g) => g.id === paramId)) {
			return paramId;
		}
		return DEFAULT_GRAPH_ID;
	};

	const [payload, setPayload] = useState<GraphLoadPayload>({
		renderControlNodes: () => null,
		renderingNodes: [],
	});
	const [selectedGraphId, setSelectedGraphId] = useState(getInitialGraphId);
	const [speed, setSpeed] = useState(
		() => getGraph(selectedGraphId).graph.speed ?? 1.0,
	);

	useEffect(() => {
		const orbitCtx = orbitCanvasRef.current!.getContext("2d")!;
		const trailCtx = trailCanvasRef.current!.getContext("2d")!;

		const engine = createGraphEngine(orbitCtx, trailCtx, CANVAS_SIZE);
		engineRef.current = engine;

		const { graph } = getGraph(selectedGraphId);
		engine.setSpeed(graph.speed ?? 1.0);
		setPayload(engine.load(graph));

		let rafId: number;
		const frame = () => {
			engine.tick();
			rafId = requestAnimationFrame(frame);
		};
		rafId = requestAnimationFrame(frame);

		return () => cancelAnimationFrame(rafId);
	}, [selectedGraphId]);

	function handleGraphChange(id: string) {
		if (!engineRef.current) {
			throw new NeverShouldHappenError();
		}
		const params = new URLSearchParams(window.location.search);
		params.set("algorithm", id);
		window.history.replaceState(null, "", `?${params.toString()}`);

		setSelectedGraphId(id);
	}

	function handleSpeedChange(value: number) {
		if (!engineRef.current) {
			throw new NeverShouldHappenError();
		}
		setSpeed(value);
		engineRef.current.setSpeed(value);
	}

	function handleRenderNodeToggle(nodeId: string) {
		if (!engineRef.current) {
			throw new NeverShouldHappenError();
		}
		engineRef.current.toggleRenderNode(nodeId);
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "flex-start",
				gap: 24,
				padding: 24,
			}}
		>
			<SidePanel>
				<RenderToggles
					renderingNodes={payload.renderingNodes}
					onToggle={handleRenderNodeToggle}
				/>
			</SidePanel>
			<Canvas
				orbitCanvasRef={orbitCanvasRef}
				trailCanvasRef={trailCanvasRef}
				size={CANVAS_SIZE}
			/>
			<SidePanel>
				<AlgorithmPicker
					graphs={GRAPHS}
					defaultId={selectedGraphId}
					onChange={handleGraphChange}
				/>
				<SpeedControl speed={speed} onChange={handleSpeedChange} />
				<Controls
					key={selectedGraphId}
					renderControlNodes={payload.renderControlNodes}
				/>
			</SidePanel>
		</div>
	);
}
