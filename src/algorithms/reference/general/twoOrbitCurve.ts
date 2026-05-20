import type { GeoArtGraph } from "../../../schema/_generated/schema-types";

// Two-orbit curve algorithm.
//
// Orbit 1: small inner orbit (3 points) whose radius is driven by a wave
// oscillator. All oscillator parameters are exposed as sliders.
//
// Orbit 2: larger outer orbit (20 points) whose curve is modulated by a
// second wave oscillator.
//
// Render nodes draw links from Orbit 1's 3 points to the first 3
// corresponding points on the modulated Orbit 2 curve, accumulating on
// the paint layer.

const graph: GeoArtGraph = {
	version: "2.0",
	title: "Two Orbit Curve",
	control: {
		nodes: [
			// --- Orbit 1 controls ---
			{
				id: "orbit1SpeedSlider",
				type: "slider",
				params: {
					label: { v: "Orbit 1 Speed" },
					min: { v: -5 },
					max: { v: 5 },
					step: { v: 0.01 },
					value: { v: 0.15 },
				},
			},
			// Oscillator controls for Orbit 1 radius modulation
			{
				id: "oscFrequencySlider",
				type: "slider",
				params: {
					label: { v: "Oscillator Frequency" },
					min: { v: 0.001 },
					max: { v: 1 },
					step: { v: 0.001 },
					value: { v: 0.5 },
				},
			},
			{
				id: "oscAmplitudeSlider",
				type: "slider",
				params: {
					label: { v: "Oscillator Amplitude" },
					min: { v: 0 },
					max: { v: 0.2 },
					step: { v: 0.005 },
					value: { v: 0 },
				},
			},
			{
				id: "oscOffsetSlider",
				type: "slider",
				params: {
					label: { v: "Oscillator Offset" },
					min: { v: -0.5 },
					max: { v: 0.5 },
					step: { v: 0.005 },
					value: { v: 0 },
				},
			},
			{
				id: "oscPhaseSlider",
				type: "slider",
				params: {
					label: { v: "Oscillator Phase" },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0 },
				},
			},
			// --- Orbit 2 controls ---
			{
				id: "orbit2SpeedSlider",
				type: "slider",
				params: {
					label: { v: "Orbit 2 Speed" },
					min: { v: -5 },
					max: { v: 5 },
					step: { v: 0.01 },
					value: { v: -0.05 },
				},
			},
			// Curve modulator oscillator controls
			{
				id: "modFrequencySlider",
				type: "slider",
				params: {
					label: { v: "Modulator Frequency" },
					min: { v: 0.001 },
					max: { v: 1 },
					step: { v: 0.001 },
					value: { v: 0.25 },
				},
			},
			{
				id: "modAmplitudeSlider",
				type: "slider",
				params: {
					label: { v: "Modulator Amplitude" },
					min: { v: 0 },
					max: { v: 0.2 },
					step: { v: 0.005 },
					value: { v: 0 },
				},
			},

			// Curve modulator oscillator controls
			{
				id: "modFrequencySlider2",
				type: "slider",
				params: {
					label: { v: "Modulator Frequency" },
					min: { v: 0.001 },
					max: { v: 1 },
					step: { v: 0.001 },
					value: { v: 0.25 },
				},
			},
			{
				id: "modAmplitudeSlider2",
				type: "slider",
				params: {
					label: { v: "Modulator Amplitude" },
					min: { v: 0 },
					max: { v: 0.2 },
					step: { v: 0.005 },
					value: { v: 0 },
				},
			},
			// --- Shared controls ---
			{
				id: "linkRate",
				type: "slider",
				params: {
					label: { v: "Link Rate" },
					min: { v: 1 },
					max: { v: 120 },
					step: { v: 1 },
					value: { v: 10 },
				},
			},
		],
	},
	compute: {
		nodes: [
			{ id: "time", type: "time", params: {} },

			// --- Orbit 1: small orbit, 3 points, radius driven by oscillator ---
			{
				id: "radiusOscillator",
				type: "wave",
				params: {
					time: { ref: "time.time" },
					frequency: { ref: "oscFrequencySlider.value" },
					amplitude: { ref: "oscAmplitudeSlider.value" },
					phase: { ref: "oscPhaseSlider.value" },
					waveType: { v: "sine" },
				},
			},
			// Add base radius (0.125) and oscillator offset, then add wave value
			{
				id: "radiusWithOffset",
				type: "add",
				params: {
					a: { v: 0.125 },
					b: { ref: "oscOffsetSlider.value" },
				},
			},
			{
				id: "orbit1Radius",
				type: "add",
				params: {
					a: { ref: "radiusWithOffset.sum" },
					b: { ref: "radiusOscillator.value" },
				},
			},
			{
				id: "orbit1",
				type: "orbit",
				params: {
					time: { ref: "time.time" },
					speed: { ref: "orbit1SpeedSlider.value" },
					radius: { ref: "orbit1Radius.sum" },
					numPoints: { v: 1 },
					phase: { v: 0 },
				},
			},

			// --- Orbit 2: larger orbit, 20 points, modulated by a curve modulator ---
			{
				id: "orbit2",
				type: "orbit",
				params: {
					time: { ref: "time.time" },
					speed: { ref: "orbit2SpeedSlider.value" },
					radius: { v: 0.4 },
					numPoints: { v: 20 },
					phase: { v: 0 },
				},
			},
			// Wave oscillator for the curve modulator
			{
				id: "curveWave",
				type: "wave",
				params: {
					time: { ref: "time.time" },
					frequency: { ref: "modFrequencySlider.value" },
					amplitude: { ref: "modAmplitudeSlider.value" },
					waveType: { v: "sine" },
				},
			},
			{
				id: "curveWave2",
				type: "wave",
				params: {
					time: { ref: "time.time" },
					frequency: { ref: "modFrequencySlider2.value" },
					amplitude: { ref: "modAmplitudeSlider2.value" },
					waveType: { v: "sine" },
				},
			},
			// Curve modulator displaces Orbit 2's points perpendicular to their tangents
			{
				id: "orbit2Modulated",
				type: "curveModulator",
				params: {
					curve: { ref: "orbit2.points" },
					modulator: { ref: "curveWave.sampler" },
					cycleLengthMode: { v: "linearOne" },
				},
			},

			// Curve modulator displaces Orbit 2's points perpendicular to their tangents
			{
				id: "orbit2Modulated2",
				type: "curveModulator",
				params: {
					curve: { ref: "orbit2Modulated.points" },
					modulator: { ref: "curveWave2.sampler" },
					cycleLengthMode: { v: "linearOne" },
				},
			},
		],
	},
	render: {
		nodes: [
			// --- Orbit 1 display ---
			// Grey ring showing orbit 1 path
			{
				id: "orbit1Ring",
				type: "circle",
				renderConfig: { layer: "live" },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: "orbit1Radius.sum" },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
				},
			},
			// Current positions of Orbit 1's 3 points
			{
				id: "orbit1Dots",
				type: "circle",
				renderConfig: { layer: "live" },
				params: {
					centerPoints: { ref: "orbit1.points" },
					radius: { v: 0.015 },
				},
			},

			{
				id: "orbit2Dots",
				type: "circle",
				renderConfig: { layer: "live" },
				params: {
					centerPoints: { ref: "orbit2Modulated2.points" },
					radius: { v: 0.015 },
				},
			},

			// Modulated Orbit 2 curve drawn live (connect-the-dots)
			{
				id: "orbit2CurveLive",
				type: "connect-dots",
				renderConfig: { layer: "live" },
				params: {
					colorPointsArray: { ref: "orbit2Modulated2.points" },
					lineWidth: { v: 1 },
					mode: { v: "catmull-rom" },
				},
			},

			// --- Links: Orbit 1 points to modulated Orbit 2 points (paint layer) ---
			// timedLineArray zips by index — links Orbit 1's 3 points to the first
			// 3 points of the modulated Orbit 2 curve.
			{
				id: "linksOrbit1ToOrbit2",
				type: "timedLineArray",
				renderConfig: { layer: "paint" },
				params: {
					intervalTicks: { ref: "linkRate.value" },
					colorPointsA: { ref: "orbit1.points" },
					colorPointsB: { ref: "orbit2Modulated2.points" },
				},
			},
		],
	},
};

export default graph;
