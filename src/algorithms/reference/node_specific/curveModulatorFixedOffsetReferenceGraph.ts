import { AlgorithmBuilder } from '../../../schema/builder';

const graph = new AlgorithmBuilder({
	title: 'Curve Modulator Fixed Offset',
})
	.addControlNode({
		id: 'modulationAngleSlider',
		type: 'slider',
		params: {
			label: { v: 'Modulation Angle' },
			min: { v: 0 },
			max: { v: 1 },
			value: { v: 0.25 },
			step: { v: 0.01 },
		},
	})
	.addControlNode({
		id: 'fixedOffsetSlider',
		type: 'slider',
		params: {
			label: { v: 'Fixed Offset' },
			min: { v: 0 },
			max: { v: 0.2 },
			value: { v: 0 },
			step: { v: 0.01 },
		},
	})

	.addComputeNode({
		id: 'time',
		type: 'time',
		params: {},
	})
	.addComputeNode({
		id: 'orbitPoints',
		type: 'orbit',
		params: {
			time: { ref: 'time.time' },
			speed: { v: 0.5 },
			radius: { v: 0.45 },
			numPoints: { v: 20 },
			centerPoints: { v: [] },
			phase: { v: 0 },
			eccentricity: { v: 0 },
			tilt: { v: 0 },
			center: { v: { x: 0, y: 0 } },
		},
	})
	.addComputeNode({
		id: 'modulator',
		type: 'wave',
		params: {
			time: { ref: 'time.time' },
			waveType: { v: 'sine' },
			frequency: { v: 0.5 },
			amplitude: { v: 0.05 },
			phase: { v: 0 },
			samplerTemporalImpact: { v: 1 },
		},
	})
	.addComputeNode({
		id: 'modulated',
		type: 'curveModulator',
		params: {
			curve: { ref: 'orbitPoints.points' },
			modulator: { ref: 'modulator.sampler' },
			cycleLengthMode: { v: 'linearOne' },
			modulationAngle: { ref: 'modulationAngleSlider.value' },
			fixedOffset: { ref: 'fixedOffsetSlider.value' },
		},
	})
	.addRenderNode({
		id: 'connectDots',
		type: 'connect-dots',
		renderConfig: {
			layer: 'live',
		},
		params: {
			colorPointsArray: { ref: 'modulated.points' },
			lineWidth: { v: 2 },
		},
	})
	.addModuleNode({
		id: "dotsOriginal",
		type: "point-render-module",
		params: {
			points: {
				ref: "orbitPoints.points"
			}
		}
	})
	.addModuleNode({
		id: "dotsModulated",
		type: "point-render-module",
		params: {
			points: {
				ref: "modulated.points"
			}
		}
	})
	.construct();

export default graph;
