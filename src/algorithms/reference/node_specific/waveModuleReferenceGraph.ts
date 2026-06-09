import { AlgorithmBuilder } from '../../../schema/builder';

const graph = new AlgorithmBuilder({ title: 'Wave Module Reference' })

	.addControlNode({
		id: 'numPoints',
		type: 'slider',
		params: { label: { v: 'Num Points' }, min: { v: 2 }, max: { v: 200 }, step: { v: 1 }, value: { v: 40 } },
	})
	.addModuleNode({
		id: 'wave',
		type: 'wave-module',
		params: {

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
