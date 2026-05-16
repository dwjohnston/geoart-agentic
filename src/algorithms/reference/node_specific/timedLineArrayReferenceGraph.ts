/**
 * CANONICAL STATUS: 👑 - 2026-05-17
 */

import type { GeoArtGraph } from '../../../schema/_generated/schema-types';

export const timedLineArrayGraph: GeoArtGraph = {
	version: '2.0',
	control: {
		nodes: [
			{
				id: 'modeSelector',
				type: 'timedLineArrayModeSelector',
				params: {
					label: { v: 'Mode' },
					value: { v: 'all-to-all' },
				},
			},
			{
				id: 'linkRate',
				type: 'slider',
				params: {
					label: { v: 'Link Rate' },
					min: { v: 1 },
					max: { v: 60 },
					value: { v: 10 },
					step: { v: 1 },
				},
			},
			{
				id: 'intervalModeSelector',
				type: 'timedLineArrayIntervalModeSelector',
				params: {
					label: { v: 'Interval Mode' },
					value: { v: 'all' },
				},
			},
		],
	},
	compute: {
		nodes: [
			{
				id: 'time',
				type: 'time',
				params: {},
			},
			{
				id: 'orbitTopLeft',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { v: 0.07 },
					speed: { v: 0.5 },
					numPoints: { v: 1 },
					phase: { v: 0 },
					centerPoints: {
						v: [{ v: { x: -0.35, y: -0.35, r: 0.9, g: 0.2, b: 0.2, a: 1 } }],
					},
				},
			},
			{
				id: 'orbitTopRight',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { v: 0.07 },
					speed: { v: 0.3 },
					numPoints: { v: 1 },
					phase: { v: 0 },
					centerPoints: {
						v: [{ v: { x: 0.35, y: -0.35, r: 0.2, g: 0.4, b: 0.9, a: 1 } }],
					},
				},
			},
			{
				id: 'orbitBottomLeft',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { v: 0.07 },
					speed: { v: 0.4 },
					numPoints: { v: 1 },
					phase: { v: 0 },
					centerPoints: {
						v: [{ v: { x: -0.35, y: 0.35, r: 0.2, g: 0.8, b: 0.3, a: 1 } }],
					},
				},
			},
			{
				id: 'orbitBottomRight',
				type: 'orbit',
				params: {
					time: { ref: 'time.time' },
					radius: { v: 0.07 },
					speed: { v: 0.35 },
					numPoints: { v: 1 },
					phase: { v: 0 },
					centerPoints: {
						v: [{ v: { x: 0.35, y: 0.35, r: 0.9, g: 0.6, b: 0.1, a: 1 } }],
					},
				},
			},
			// Wrap each orbit's point output into a colorPoint for use as line endpoints
			{
				id: 'cpTopLeft',
				type: 'colorPointCompute',
				params: {
					point: { ref: 'orbitTopLeft.point' },
					color: { v: { r: 0.9, g: 0.2, b: 0.2, a: 1 } },
				},
			},
			{
				id: 'cpTopRight',
				type: 'colorPointCompute',
				params: {
					point: { ref: 'orbitTopRight.point' },
					color: { v: { r: 0.2, g: 0.4, b: 0.9, a: 1 } },
				},
			},
			{
				id: 'cpBottomLeft',
				type: 'colorPointCompute',
				params: {
					point: { ref: 'orbitBottomLeft.point' },
					color: { v: { r: 0.2, g: 0.8, b: 0.3, a: 1 } },
				},
			},
			{
				id: 'cpBottomRight',
				type: 'colorPointCompute',
				params: {
					point: { ref: 'orbitBottomRight.point' },
					color: { v: { r: 0.9, g: 0.6, b: 0.1, a: 1 } },
				},
			},
			// 8 evenly-spaced points along the top edge between the two top orbits
			{
				id: 'topLine',
				type: 'pointsOnALine',
				params: {
					pointA: { ref: 'cpTopLeft.colorPoint' },
					pointB: { ref: 'cpTopRight.colorPoint' },
					numberOfPoints: { v: 8 },
				},
			},
			// 4 evenly-spaced points along the bottom edge between the two bottom orbits
			{
				id: 'bottomLine',
				type: 'pointsOnALine',
				params: {
					pointA: { ref: 'cpBottomLeft.colorPoint' },
					pointB: { ref: 'cpBottomRight.colorPoint' },
					numberOfPoints: { v: 4 },
				},
			},
		],
	},
	render: {
		nodes: [
			{
				id: 'timedLineArray',
				type: 'timedLineArray',
				renderConfig: {
					layer: 'paint',
				},
				params: {
					colorPointsA: { ref: 'topLine.points' },
					colorPointsB: { ref: 'bottomLine.points' },
					intervalTicks: { ref: 'linkRate.value' },
					mode: { ref: 'modeSelector.value' },
					intervalMode: { ref: 'intervalModeSelector.value' },
				},
			},
			{
				id: 'markersTopLine',
				type: 'circle',
				renderConfig: {
					layer: 'live',
				},
				params: {
					centerPoints: { ref: 'topLine.points' },
					radius: { v: 0.008 },
				},
			},
			{
				id: 'markersBottomLine',
				type: 'circle',
				renderConfig: {
					layer: 'live',
				},
				params: {
					centerPoints: { ref: 'bottomLine.points' },
					radius: { v: 0.008 },
				},
			},
		],
	},
};
