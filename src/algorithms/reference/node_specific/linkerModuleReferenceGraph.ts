import { AlgorithmBuilder } from '../../../schema/builder';
import { fColorPoint } from '../../../constants';

const graph = new AlgorithmBuilder({ title: 'Linker Module Reference' })

	.addComputeNode({ id: 'time', type: 'time', params: {} })

	.addModuleNode({
		id: 'orbitA',
		type: 'orbit-module',
		params: {
			time: { ref: 'time.time' },
			speed: { v: 0.15 },
			radius: { v: 0.5 },
			numPoints: { v: 8 },
			centerPoints: { v: [{ v: fColorPoint({ r: 0.2, g: 0.6, b: 1, a: 1 }) }] },
		},
	})

	.addModuleNode({
		id: 'orbitB',
		type: 'orbit-module',
		params: {
			time: { ref: 'time.time' },
			speed: { v: -0.1 },
			radius: { v: 0.3 },
			numPoints: { v: 8 },
			centerPoints: { v: [{ v: fColorPoint({ r: 1, g: 0.5, b: 0.2, a: 1 }) }] },
		},
	})

	.addModuleNode({
		id: 'linker',
		type: 'linker-module',
		params: {
			pointsFrom: { ref: 'orbitA.points' },
			pointsTo: { ref: 'orbitB.points' },
		},
	})

	.construct();

export default graph;
