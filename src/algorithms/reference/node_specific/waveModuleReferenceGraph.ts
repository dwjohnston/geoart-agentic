import { AlgorithmBuilder } from '../../../schema/builder';

const graph = new AlgorithmBuilder({ title: 'Wave Module Reference' })
	.addControlNode({
		id: 'frequency',
		type: 'slider',
		params: { label: { v: 'Frequency' }, min: { v: 0.1 }, max: { v: 10 }, step: { v: 0.1 }, value: { v: 1 } },
	})
	.addControlNode({
		id: 'amplitude',
		type: 'slider',
		params: { label: { v: 'Amplitude' }, min: { v: 0 }, max: { v: 1 }, step: { v: 0.01 }, value: { v: 0.3 } },
	})
	.addControlNode({
		id: 'phase',
		type: 'slider',
		params: { label: { v: 'Phase' }, min: { v: 0 }, max: { v: 1 }, step: { v: 0.01 }, value: { v: 0 } },
	})
	.addControlNode({
		id: 'numPoints',
		type: 'slider',
		params: { label: { v: 'Num Points' }, min: { v: 2 }, max: { v: 200 }, step: { v: 1 }, value: { v: 40 } },
	})
	.addModuleNode({
		id: 'wave',
		type: 'wave-module',
		params: {
			frequency: { ref: 'frequency.value' },
			amplitude: { ref: 'amplitude.value' },
			phase: { ref: 'phase.value' },
		},
	})
	.addComputeNode({
		id: 'points',
		type: 'pointsOnALine',
		params: {
			numberOfPoints: { ref: 'numPoints.value' },
			pointA: { v: { x: -0.7, y: 0, r: 1, g: 1, b: 1, a: 1, dx: 0, dy: 0 } },
			pointB: { v: { x: 0.7, y: 0, r: 1, g: 1, b: 1, a: 1, dx: 0, dy: 0 } },
		},
	})
	.addComputeNode({
		id: 'modulated',
		type: 'curveModulator',
		params: {
			curve: { ref: 'points.points' },
			modulator: { ref: 'wave.sampler' },
			cycleLengthMode: { v: 'linearOne' },
		},
	})
	.addRenderNode({
		id: 'connectDots',
		type: 'connect-dots',
		renderConfig: { layer: 'live' },
		params: {
			colorPointsArray: { ref: 'modulated.points' },
			lineWidth: { v: 1 },
		},
	})
	.construct();

export default graph;
