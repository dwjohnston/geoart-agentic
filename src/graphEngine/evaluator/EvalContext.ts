/**
 * Context object passed to every node's evaluate call.
 * The graph layer injects the correct scope for getState/setState —
 * nodes do not need to pass their own ID.
 */
export type EvalContext = {
	/** Tick count since graph start. */
	tickCount: number;
	canvas: {
		orbit: CanvasRenderingContext2D;
		trail: CanvasRenderingContext2D;
		width: number;
		height: number;
	};
	/**
	 * Read this node's persisted state. Returns undefined if no state has been
	 * set yet — callers should supply a sensible default.
	 */
	getState<T>(): T;
	/** Persist state for this node; retrieved on the next frame via getState. */
	setState<T>(s: T): void;
	/** Set of enabled render node IDs. */
	enabledRenderNodes?: Set<string>;
};
