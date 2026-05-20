import type { ResolvedValue } from "../../../schema/typeHelpers";
import { implementComputeNode } from "../implementComputeNode";

/**
 * Calculate the Euclidean distance between two 2D points
 */
function distance(
	p1: { x: number; y: number },
	p2: { x: number; y: number },
): number {
	const dx = p1.x - p2.x;
	const dy = p1.y - p2.y;
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate inverse-distance weight: 1 / (distance ^ falloff)
 * Special case: if distance is 0 or very close to 0, return a very large weight
 */
function inverseDistanceWeight(dist: number, falloff: number): number {
	if (dist < 1e-10) {
		return 1e10; // Very large weight for zero distance
	}
	return 1 / dist ** falloff;
}

/**
 * Blend a single color channel using inverse-distance weighted influence
 * Only considers target points that have a defined (non-null) value for this channel
 */
function blendChannel(
	inputValue: number | null,
	inputPoint: ResolvedValue<"colorPointValue">,
	targetPoints: ResolvedValue<"colorPointArrayValue">,
	falloff: number,
	strength: number,
	channel: "r" | "g" | "b" | "a",
): number | null {
	// A null input channel means 'ignore this channel' — leave it untouched.
	if (inputValue === null) {
		return null;
	}

	// Filter targets that have a defined value for this channel
	const validTargets = targetPoints.filter(
		(t) => t[channel] !== undefined && t[channel] !== null,
	);

	if (validTargets.length === 0) {
		// No valid targets for this channel, return input unchanged
		return inputValue;
	}

	// Check for exact overlap (distance = 0 or very close)
	for (const target of validTargets) {
		const dist = distance(inputPoint, target);
		if (dist < 1e-10) {
			// Snap to this target's color for this channel
			return target[channel] as number;
		}
	}

	// Calculate inverse-distance weighted blend
	let totalWeight = 0;
	let weightedSum = 0;

	for (const target of validTargets) {
		const dist = distance(inputPoint, target);
		const weight = inverseDistanceWeight(dist, falloff);
		totalWeight += weight;
		weightedSum += weight * (target[channel] as number);
	}

	const blendedValue = totalWeight > 0 ? weightedSum / totalWeight : inputValue;

	// Distance-aware influence: stronger blend closer to targets
	const influence = totalWeight / (totalWeight + 1);
	return inputValue + (blendedValue - inputValue) * influence * strength;
}

const colorShiftNodeDef = implementComputeNode("colorShift", {
	isTimeDependant: false,
	defaults: {
		inputPoints: [],
		targetPoints: [],
		falloff: 1,
		strength: 1,
	},
	evaluate: (inputs) => {
		const inputPoints = inputs.inputPoints;
		const targetPoints = inputs.targetPoints;
		const falloff = inputs.falloff;
		const strength = inputs.strength;

		// Clamp strength to [0, 1]
		const clampedStrength = Math.max(0, Math.min(1, strength));

		// Process each input point
		const points = inputPoints.map((inputPoint) => {
			return {
				...inputPoint,
				r: blendChannel(
					inputPoint.r,
					inputPoint,
					targetPoints,
					falloff,
					clampedStrength,
					"r",
				),
				g: blendChannel(
					inputPoint.g,
					inputPoint,
					targetPoints,
					falloff,
					clampedStrength,
					"g",
				),
				b: blendChannel(
					inputPoint.b,
					inputPoint,
					targetPoints,
					falloff,
					clampedStrength,
					"b",
				),
				a: blendChannel(
					inputPoint.a,
					inputPoint,
					targetPoints,
					falloff,
					clampedStrength,
					"a",
				),
			};
		});

		return {
			points,
		};
	},
});

export default colorShiftNodeDef;
