import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

// Rainbow Double Modulated Link
//
// Seven evenly-spaced colour points run along the line from (-1, 0) to
// (1, 0), one per colour of the rainbow (red, orange, yellow, green,
// blue, indigo, violet). They are declared explicitly via a
// `colorPointArrayCompute` node so each point keeps its own colour
// (a `pointsOnALine` node would blend the endpoint colours instead).
//
// A primary `wave` -> `curveModulator` pair displaces those points up
// and down. Every meaningful input of the primary wave is wired to a
// live control (amplitude, frequency, phase, sampler temporal impact,
// and wave shape via a `waveSelector`), plus a link-rate slider.
//
// A secondary `wave` -> `curveModulator` pair takes the *output* of the
// primary modulator as its curve and modulates it again, producing a
// second displaced curve. The secondary wave has its own full set of
// live controls, matching the primary wave.
//
// An `orbit` node centred at (0, 0) circles the canvas. Its base colour
// is transparent black (r:0 g:0 b:0 a:0) so the colour shift fully
// governs the resulting colour. The orbit has full live controls
// (radius, speed, numPoints, phase).
//
// A `colorShift` node pulls the secondary modulated curve's points'
// colours towards the orbit point(s). The colour-shifted curve is the
// final rendered result; its points are linked back to the primary
// modulated curve so the links between the two curves keep working.

const graph: GeoArtGraph = {
	version: '2.0',
	title: 'Rainbow Double Modulated Link',

	control: {
		nodes: [
			{
				id: 'linkRate',
				type: 'slider',
				params: {
					label: { v: 'Link Rate' },
					min: { v: 1 },
					max: { v: 120 },
					step: { v: 1 },
					value: { v: 10 },
				},
			},

			// ---- Primary wave controls ----
			{
				id: 'primaryAmplitude',
				type: 'slider',
				params: {
					label: { v: 'Primary Amplitude' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.005 },
					value: { v: 0.12 },
				},
			},
			{
				id: 'primaryFrequency',
				type: 'slider',
				params: {
					label: { v: 'Primary Frequency' },
					min: { v: 0.001 },
					max: { v: 1 },
					step: { v: 0.001 },
					value: { v: 0.4 },
				},
			},
			{
				id: 'primaryPhase',
				type: 'slider',
				params: {
					label: { v: 'Primary Phase' },
					min: { v: 0 },
					max: { v: 6.2831853 },
					step: { v: 0.01 },
					value: { v: 0 },
				},
			},
			{
				id: 'primaryTemporalImpact',
				type: 'slider',
				params: {
					label: { v: 'Primary Temporal Impact' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 1 },
				},
			},
			{
				id: 'primaryWaveShape',
				type: 'waveSelector',
				params: {
					label: { v: 'Primary Wave Shape' },
					value: { v: 'sine' },
				},
			},

			// ---- Secondary wave controls ----
			{
				id: 'secondaryAmplitude',
				type: 'slider',
				params: {
					label: { v: 'Secondary Amplitude' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.005 },
					value: { v: 0.06 },
				},
			},
			{
				id: 'secondaryFrequency',
				type: 'slider',
				params: {
					label: { v: 'Secondary Frequency' },
					min: { v: 0.001 },
					max: { v: 1 },
					step: { v: 0.001 },
					value: { v: 0.9 },
				},
			},
			{
				id: 'secondaryPhase',
				type: 'slider',
				params: {
					label: { v: 'Secondary Phase' },
					min: { v: 0 },
					max: { v: 6.2831853 },
					step: { v: 0.01 },
					value: { v: 1.5707963 },
				},
			},
			{
				id: 'secondaryTemporalImpact',
				type: 'slider',
				params: {
					label: { v: 'Secondary Temporal Impact' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 1 },
				},
			},
			{
				id: 'secondaryWaveShape',
				type: 'waveSelector',
				params: {
					label: { v: 'Secondary Wave Shape' },
					value: { v: 'triangle' },
				},
			},

			// ---- Orbit controls ----
			{
				id: 'orbitRadius',
				type: 'slider',
				params: {
					label: { v: 'Orbit Radius' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.01 },
					value: { v: 0.55 },
				},
			},
			{
				id: 'orbitSpeed',
				type: 'slider',
				params: {
					label: { v: 'Orbit Speed' },
					min: { v: -5 },
					max: { v: 5 },
					step: { v: 0.01 },
					value: { v: 0.3 },
				},
			},
			{
				id: 'orbitPhase',
				type: 'slider',
				params: {
					label: { v: 'Orbit Phase' },
					min: { v: 0 },
					max: { v: 6.2831853 },
					step: { v: 0.01 },
					value: { v: 0 },
				},
			},
			{
				id: 'orbitNumPoints',
				type: 'slider',
				params: {
					label: { v: 'Orbit Points' },
					min: { v: 1 },
					max: { v: 12 },
					step: { v: 1 },
					value: { v: 3 },
				},
			},

			// ---- Colour shift controls ----
			{
				id: 'shiftFalloff',
				type: 'slider',
				params: {
					label: { v: 'Shift Falloff' },
					min: { v: 0 },
					max: { v: 5 },
					step: { v: 0.1 },
					value: { v: 3 },
				},
			},
			{
				id: 'shiftStrength',
				type: 'slider',
				params: {
					label: { v: 'Shift Strength' },
					min: { v: 0 },
					max: { v: 1 },
					step: { v: 0.05 },
					value: { v: 1 },
				},
			},

			// ---- Lines-through-point controls ----
			{
				id: 'spokeLength',
				type: 'slider',
				params: {
					label: { v: 'Spoke Length' },
					min: { v: 0 },
					max: { v: 0.5 },
					step: { v: 0.005 },
					value: { v: 0.08 },
				},
			},

			// ---- Timed line array mode controls ----
			{
				id: 'linkMode',
				type: 'timedLineArrayModeSelector',
				params: {
					label: { v: 'Link Mode' },
					value: { v: 'all-to-all' },
				},
			},
			{
				id: 'linkIntervalMode',
				type: 'timedLineArrayIntervalModeSelector',
				params: {
					label: { v: 'Link Interval Mode' },
					value: { v: 'all' },
				},
			},
		],
	},

	compute: {
		nodes: [
			{ id: 'time', type: 'time', params: {} },

			// Seven rainbow colour points along the line (-1,0) -> (1,0).
			{
				id: 'rainbowPoints',
				type: 'colorPointArrayCompute',
				params: {
					points: {
						v: [
							// Red
							{ v: { x: -1, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 1, dy: 0 } },
							// Orange
							{ v: { x: -0.6666667, y: 0, r: 1, g: 0.5, b: 0, a: 1, dx: 1, dy: 0 } },
							// Yellow
							{ v: { x: -0.3333333, y: 0, r: 1, g: 1, b: 0, a: 1, dx: 1, dy: 0 } },
							// Green
							{ v: { x: 0, y: 0, r: 0, g: 1, b: 0, a: 1, dx: 1, dy: 0 } },
							// Blue
							{ v: { x: 0.3333333, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 1, dy: 0 } },
							// Indigo
							{ v: { x: 0.6666667, y: 0, r: 0.29, g: 0, b: 0.51, a: 1, dx: 1, dy: 0 } },
							// Violet
							{ v: { x: 1, y: 0, r: 0.56, g: 0, b: 1, a: 1, dx: 1, dy: 0 } },
						],
					},
				},
			},

			// Primary wave — every input wired to a live control.
			{
				id: 'primaryWave',
				type: 'wave',
				params: {
					time: { ref: 'time.time' },
					waveType: { ref: 'primaryWaveShape.value' },
					frequency: { ref: 'primaryFrequency.value' },
					amplitude: { ref: 'primaryAmplitude.value' },
					phase: { ref: 'primaryPhase.value' },
					samplerTemporalImpact: { ref: 'primaryTemporalImpact.value' },
				},
			},

			// Primary modulator — displaces the rainbow points up and down.
			{
				id: 'primaryModulated',
				type: 'curveModulator',
				params: {
					curve: { ref: 'rainbowPoints.points' },
					modulator: { ref: 'primaryWave.sampler' },
					cycleLengthMode: { v: 'linearOne' },
				},
			},

			// Secondary wave — every input wired to its own live control.
			{
				id: 'secondaryWave',
				type: 'wave',
				params: {
					time: { ref: 'time.time' },
					waveType: { ref: 'secondaryWaveShape.value' },
					frequency: { ref: 'secondaryFrequency.value' },
					amplitude: { ref: 'secondaryAmplitude.value' },
					phase: { ref: 'secondaryPhase.value' },
					samplerTemporalImpact: { ref: 'secondaryTemporalImpact.value' },
				},
			},

			// Secondary modulator — modulates the *output* of the primary
			// modulator, producing a second displaced curve.
			{
				id: 'secondaryModulated',
				type: 'curveModulator',
				params: {
					curve: { ref: 'primaryModulated.points' },
					modulator: { ref: 'secondaryWave.sampler' },
					cycleLengthMode: { v: 'linearOne' },
				},
			},

			// Orbit centre: single point at (0,0), transparent black so the
			// colour shift fully governs the resulting orbit colour.
			{
				id: 'orbitCenter',
				type: 'colorPointArrayCompute',
				params: {
					points: {
						v: [{ v: { x: 0, y: 0, r: 0, g: 0, b: 0, a: 0 } }],
					},
				},
			},

			// Orbit at the canvas centre — full live controls.
			{
				id: 'orbit',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { ref: 'orbitRadius.value' },
					speed: { ref: 'orbitSpeed.value' },
					numPoints: { ref: 'orbitNumPoints.value' },
					phase: { ref: 'orbitPhase.value' },
					centerPoints: { ref: 'orbitCenter.points' },
				},
			},

			// Pull the secondary modulated curve's point colours towards
			// the orbit point(s).
			{
				id: 'shift',
				type: 'colorShift',
				params: {
					inputPoints: { ref: 'secondaryModulated.points' },
					targetPoints: { ref: 'orbit.points' },
					falloff: { ref: 'shiftFalloff.value' },
					strength: { ref: 'shiftStrength.value' },
				},
			},

			{
				id: 'shift2',
				type: 'colorShift',
				params: {
					inputPoints: { ref: 'primaryModulated.points' },
					targetPoints: { ref: 'orbit.points' },
					falloff: { ref: 'shiftFalloff.value' },
					strength: { ref: 'shiftStrength.value' },
				},
			},
		],
	},

	render: {
		nodes: [
			// Links between corresponding points of the primary modulated
			// curve and the colour-shifted secondary curve.
			{
				id: 'curveLinks',
				type: 'timedLineArray',
				renderConfig: { layer: 'paint' },
				params: {
					intervalTicks: { ref: 'linkRate.value' },
					colorPointsA: { ref: 'shift2.points' },
					colorPointsB: { ref: 'shift.points' },
					mode: { ref: 'linkMode.value' },
					intervalMode: { ref: 'linkIntervalMode.value' },
				},
			},

			// ---- Live structure (cleared each frame) ----
			// Grey orbit path centred at origin.
			{
				id: 'orbitPath',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { ref: 'orbitRadius.value' },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.4 } },
				},
			},
			// Grey orbit-centre marker.
			{
				id: 'orbitCenterMarker',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					center: { v: { x: 0, y: 0 } },
					radius: { v: 0.02 },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
				},
			},
			// Orbiting entity markers (grey — base colour is transparent).
			{
				id: 'orbitMarkers',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'orbit.points' },
					radius: { v: 0.022 },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.6 } },
				},
			},

			// Live trace of the primary modulated curve.
			{
				id: 'primaryCurve',
				type: 'connect-dots',
				renderConfig: { layer: 'live' },
				params: {
					colorPointsArray: { ref: 'primaryModulated.points' },
					lineWidth: { v: 1 },
				},
			},
			// Live trace of the colour-shifted secondary modulated curve.
			{
				id: 'shiftedCurve',
				type: 'connect-dots',
				renderConfig: { layer: 'live' },
				params: {
					colorPointsArray: { ref: 'shift.points' },
					lineWidth: { v: 1 },
				},
			},
			// Markers on the primary modulated points.
			{
				id: 'primaryMarkers',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'primaryModulated.points' },
					radius: { v: 0.018 },
				},
			},

			{
				id: 'originalMarkers',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'rainbowPoints.points' },
					radius: { v: 0.018 },
				},
			},

			{
				id: 'secondaryMarkers',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'secondaryModulated.points' },
					radius: { v: 0.018 },
				},
			},


			// Markers on the colour-shifted secondary points.
			{
				id: 'shiftedMarkers',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'shift.points' },
					radius: { v: 0.018 },
				},
			},
			{
				id: 'shiftedMarkers2',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					centerPoints: { ref: 'shift2.points' },
					radius: { v: 0.018 },
				},
			},

			// Spokes through every point of the colour-shifted secondary
			// curve — four lines per point (0°, 45°, 90°, 135°).
			{
				id: 'spokes',
				type: 'linesThroughPoint',
				renderConfig: { layer: 'live' },
				params: {
					points: { ref: 'shift.points' },
					degrees: { v: [{ v: 0 }, { v: 90 },] },
					lineLength: { ref: 'spokeLength.value' },
				},
			},

			// Spokes through every original (unmodulated) rainbow point.
			{
				id: 'originalSpokes',
				type: 'linesThroughPoint',
				renderConfig: { layer: 'live' },
				params: {
					points: { ref: 'rainbowPoints.points' },
					degrees: { v: [{ v: 0 }, { v: 90 },] },
					lineLength: { ref: 'spokeLength.value' },
				},
			},

			// Spokes through every primary-modulated curve point.
			{
				id: 'primarySpokes',
				type: 'linesThroughPoint',
				renderConfig: { layer: 'live' },
				params: {
					points: { ref: 'primaryModulated.points' },
					degrees: { v: [{ v: 0 }, { v: 90 },] },
					lineLength: { ref: 'spokeLength.value' },
				},
			},

			// Spokes through every secondary-modulated curve point.
			{
				id: 'secondarySpokes',
				type: 'linesThroughPoint',
				renderConfig: { layer: 'live' },
				params: {
					points: { ref: 'secondaryModulated.points' },
					degrees: { v: [{ v: 0 }, { v: 90 },] },
					lineLength: { ref: 'spokeLength.value' },
				},
			},
		],
	},
};

export default graph;
