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
			min: { v: -1 },
			max: { v: 1 },
			value: { v: 0 },
			step: { v: 0.01 },
		},
	})


	.addComputeNode({
		id: 'orbitPoints',
		type: 'orbit',
		params: {
			speed: { v: 0.5 },
			radius: { v: 0.45 },
			numPoints: { v: 8 },
			centerPoints: { v: [] },
			phase: { v: 0 },
			eccentricity: { v: 0.5 },
			tilt: { v: 0 },
			center: { v: { x: 0, y: 0 } },
		},
	})
	.addComputeNode({
		id: 'modulated',
		type: 'curveModulator',
		params: {
			curve: { ref: 'orbitPoints.points' },
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
