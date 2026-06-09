import { AlgorithmBuilder } from '../../../schema/builder';

const graph = new AlgorithmBuilder({ title: 'Wave Modulator' })
	.addControlNode({
		id: 'modFrequency',
		type: 'slider',
		params: { label: { v: 'Mod Frequency' }, min: { v: 0.1 }, max: { v: 10 }, step: { v: 0.1 }, value: { v: 8 } },
	})
	.addControlNode({
		id: 'modAmplitude',
		type: 'slider',
		params: { label: { v: 'Mod Amplitude' }, min: { v: 0 }, max: { v: 50 }, step: { v: 0.01 }, value: { v: 2 } },
	})

	.addControlNode({
		id: 'modSamplerTemporalImpact',
		type: 'slider',
		params: { label: { v: 'Mod Sampler Temporal Impact' }, min: { v: 0 }, max: { v: 1 }, step: { v: 0.01 }, value: { v: 0 } },
	})
	.addControlNode({
		id: 'primaryFrequency',
		type: 'slider',
		params: { label: { v: 'Primary Frequency' }, min: { v: 0.1 }, max: { v: 10 }, step: { v: 0.1 }, value: { v: 2 } },
	})
	.addControlNode({
		id: 'primaryAmplitude',
		type: 'slider',
		params: { label: { v: 'Primary Amplitude' }, min: { v: 0 }, max: { v: 1 }, step: { v: 0.01 }, value: { v: 0.3 } },
	})

	.addControlNode({
		id: 'primarySamplerTemporalImpact',
		type: 'slider',
		params: { label: { v: 'Primary Sampler Temporal Impact' }, min: { v: 0 }, max: { v: 1 }, step: { v: 0.01 }, value: { v: 0 } },
	})
	.addControlNode({
		id: 'numPoints',
		type: 'slider',
		params: { label: { v: 'Num Points' }, min: { v: 2 }, max: { v: 800 }, step: { v: 1 }, value: { v: 40 } },
	})
	.addComputeNode({
		id: 'time',
		type: 'time',
		params: {},
	})
	.addComputeNode({
		id: 'points',
		type: 'pointsOnALine',
		params: {
			numberOfPoints: { ref: 'numPoints.value' },
			pointA: { v: { x: -1, y: 0, r: 1, g: 1, b: 1, a: 1, dx: 0, dy: 0 } },
			pointB: { v: { x: 1, y: 0, r: 1, g: 1, b: 1, a: 1, dx: 0, dy: 0 } },
		},
	})
	.addComputeNode({
		id: 'modulatorWave',
		type: 'wave',
		params: {
			time: { ref: 'time.time' },
			waveType: { v: 'sine' },
			frequency: { ref: 'modFrequency.value' },
			amplitude: { ref: 'modAmplitude.value' },
			samplerTemporalImpact: { ref: 'modSamplerTemporalImpact.value' },
		},
	})
	.addComputeNode({
		id: 'primaryWave',
		type: 'wave',
		params: {
			time: { ref: 'time.time' },
			waveType: { v: 'sine' },
			frequency: { ref: 'primaryFrequency.value' },
			amplitude: { ref: 'primaryAmplitude.value' },
			samplerTemporalImpact: { ref: 'primarySamplerTemporalImpact.value' },
			frequencyModulator: { ref: 'modulatorWave.sampler' },
		},
	})
	.addComputeNode({
		id: 'modulated',
		type: 'curveModulator',
		params: {
			curve: { ref: 'points.points' },
			modulator: { ref: 'primaryWave.sampler' },
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
