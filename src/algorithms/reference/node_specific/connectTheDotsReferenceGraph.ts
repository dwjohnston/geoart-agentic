import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

export const connectTheDotsGraph: GeoArtGraph = {
	version: '2.0',
	control: {
		nodes: [],
	},
	compute: {
		nodes: [
			// Create color points for the start and end positions
			{
				id: 'startPoint',
				type: 'colorPointCompute',
				params: {
					point: { v: { x: -0.5, y: 0 } },
					color: { v: { r: 1, g: 0, b: 0, a: 1 } },
				},
			},
			{
				id: 'endPoint',
				type: 'colorPointCompute',
				params: {
					point: { v: { x: 0.5, y: 0 } },
					color: { v: { r: 0, b: 1, g: 0, a: 1 } },
				},
			},
			// Generate 30 points connecting the two endpoints
			{
				id: 'thirtyPoints',
				type: 'pointsOnALine',
				params: {
					pointA: { ref: 'startPoint.colorPoint' },
					pointB: { ref: 'endPoint.colorPoint' },
					numberOfPoints: { v: 10 },
				},
			},
			// Generate 400 points connecting the same two endpoints
			{
				id: 'fourHundredPoints',
				type: 'pointsOnALine',
				params: {
					pointA: { ref: 'startPoint.colorPoint' },
					pointB: { ref: 'endPoint.colorPoint' },
					numberOfPoints: { v: 400 },
				},
			},
			// Time source for wave nodes
			{
				id: 'time',
				type: 'time',
				params: {},
			},
			// Wave modulator for 30-point line
			{
				id: 'wave30',
				type: 'wave',
				params: {
					time: { ref: 'time.time' },
					waveType: { v: 'sine' },
					frequency: { v: 2 },
					amplitude: { v: 1 },
					phase: { v: 0 },
					samplerTemporalImpact: { v: 0 },
				},
			},
			// Wave modulator for 400-point line
			{
				id: 'wave400',
				type: 'wave',
				params: {
					time: { ref: 'time.time' },
					waveType: { v: 'sine' },
					frequency: { v: 2 },
					amplitude: { v: 1 },
					phase: { v: 0 },
					samplerTemporalImpact: { v: 0 },
				},
			},
			// Curve modulator for 30-point line
			{
				id: 'modulatedThirtyPoints',
				type: 'curveModulator',
				params: {
					curve: { ref: 'thirtyPoints.points' },
					modulator: { ref: 'wave30.sampler' },
					cycleLengthMode: { v: 'arrayLength' },
				},
			},
			// Curve modulator for 400-point line
			{
				id: 'modulatedFourHundredPoints',
				type: 'curveModulator',
				params: {
					curve: { ref: 'fourHundredPoints.points' },
					modulator: { ref: 'wave400.sampler' },
					cycleLengthMode: { v: 'arrayLength' },
				},
			},
		],
	},
	render: {
		nodes: [
			// Render modulated 30 points with catmull-rom interpolation (smooth curves)
			{
				id: 'smoothLine',
				type: 'connect-dots',
				renderConfig: {
					layer: 'live',
				},
				params: {
					colorPointsArray: { ref: 'modulatedThirtyPoints.points' },
					lineWidth: { v: 2 },
					mode: { v: 'catmull-rom' },
				},
			},
			// Render modulated 400 points with straight interpolation (linear segments)
			{
				id: 'straightLine',
				type: 'connect-dots',
				renderConfig: {
					layer: 'live',
				},
				params: {
					colorPointsArray: { ref: 'modulatedFourHundredPoints.points' },
					lineWidth: { v: 1 },
					mode: { v: 'straight' },
				},
			},
		],
	},
};
