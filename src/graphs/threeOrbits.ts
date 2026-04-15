import type { GeoArtGraph } from '../schema/_generated/schema-types';

// Three-orbit spirograph algorithm.
//
// Orbit A circles the canvas centre.
// Orbit B circles planet A.
// Orbit C circles planet B.
// The trail of planet C accumulates the spirograph pattern.
// Speed and radius of each orbit are slider-controlled.
//
// Orbit node ports:  0=time, 1=radius, 2=speed, 3=center  →  output 0=point
// Circle ports:      0=intervalMs, 1=center, 2=radius, 3=color

export const threeOrbitsGraph: GeoArtGraph = {
	version: '0.1',
	control: {
		nodes: [
			{
				id: 'aSpeedSlider',
				type: 'slider',
				params: {
					label: { v: 'Orbit A Speed' },
					min: { v: 0 },
					max: { v: 3 },
					value: { v: 0.4 },
				},
			},
			{
				id: 'aRadiusSlider',
				type: 'slider',
				params: {
					label: { v: 'Orbit A Size' },
					min: { v: 0 },
					max: { v: 0.9 },
					value: { v: 0.5 },
				},
			},
			{
				id: 'bSpeedSlider',
				type: 'slider',
				params: {
					label: { v: 'Orbit B Speed' },
					min: { v: 0 },
					max: { v: 5 },
					value: { v: 1.2 },
				},
			},
			{
				id: 'bRadiusSlider',
				type: 'slider',
				params: {
					label: { v: 'Orbit B Size' },
					min: { v: 0 },
					max: { v: 0.5 },
					value: { v: 0.25 },
				},
			},
			{
				id: 'cSpeedSlider',
				type: 'slider',
				params: {
					label: { v: 'Orbit C Speed' },
					min: { v: 0 },
					max: { v: 8 },
					value: { v: 3.0 },
				},
			},
			{
				id: 'cRadiusSlider',
				type: 'slider',
				params: {
					label: { v: 'Orbit C Size' },
					min: { v: 0 },
					max: { v: 0.3 },
					value: { v: 0.1 },
				},
			},
		],
	},
	compute: {
		nodes: [
			{ id: 'time', type: 'time', params: {} },
			{
				id: 'orbitA',
				type: 'orbit',
				params: {},
				// time=port0, radius=port1←aRadiusSlider, speed=port2←aSpeedSlider
				// center=port3 not wired → defaults to origin
			},
			{
				id: 'orbitB',
				type: 'orbit',
				params: {},
				// time=port0, radius=port1←bRadiusSlider, speed=port2←bSpeedSlider
				// center=port3←orbitA
			},
			{
				id: 'orbitC',
				type: 'orbit',
				params: {},
				// time=port0, radius=port1←cRadiusSlider, speed=port2←cSpeedSlider
				// center=port3←orbitB
			},
		],
		edges: [
			// Time into all three orbits
			{ fromNode: 'time', fromPort: 0, toNode: 'orbitA', toPort: 0 },
			{ fromNode: 'time', fromPort: 0, toNode: 'orbitB', toPort: 0 },
			{ fromNode: 'time', fromPort: 0, toNode: 'orbitC', toPort: 0 },
			// Sliders into orbit radii
			{ fromNode: 'aRadiusSlider', fromPort: 0, toNode: 'orbitA', toPort: 1 },
			{ fromNode: 'bRadiusSlider', fromPort: 0, toNode: 'orbitB', toPort: 1 },
			{ fromNode: 'cRadiusSlider', fromPort: 0, toNode: 'orbitC', toPort: 1 },
			// Sliders into orbit speeds
			{ fromNode: 'aSpeedSlider', fromPort: 0, toNode: 'orbitA', toPort: 2 },
			{ fromNode: 'bSpeedSlider', fromPort: 0, toNode: 'orbitB', toPort: 2 },
			{ fromNode: 'cSpeedSlider', fromPort: 0, toNode: 'orbitC', toPort: 2 },
			// Chain: A's position is B's centre; B's position is C's centre
			{ fromNode: 'orbitA', fromPort: 0, toNode: 'orbitB', toPort: 3 },
			{ fromNode: 'orbitB', fromPort: 0, toNode: 'orbitC', toPort: 3 },
		],
	},
	render: {
		nodes: [

			{
				id: 'lineA',
				type: 'timedLine',
				renderConfig: { layer: 'paint' },
				params: {
					color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
					intervalMs: { v: 10 }
					// intervalMs, pointA, pointB driven by edges
				},
			},
			{
				id: 'lineB',
				type: 'timedLine',
				renderConfig: { layer: 'paint' },
				params: {
					color: { v: { r: 0.4, g: 1, b: 0.6, a: 1 } },
					intervalMs: { v: 10 }

					// intervalMs, pointA, pointB driven by edges
				},
			},
			{
				id: 'lineC',
				type: 'timedLine',
				renderConfig: { layer: 'paint' },
				params: {
					color: { v: { r: 1, g: 0.8, b: 0.3, a: 1 } },
					intervalMs: { v: 10 }

					// intervalMs, pointA, pointB driven by edges
				},
			},

			// Live position dots — redrawn each frame
			{
				id: 'drawOrbitA',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
				},
			},
			{
				id: 'drawOrbitB',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
				},
			},
			{
				id: 'drawOrbitC',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
				},
			},
			{
				id: 'dotA',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					radius: { v: 0.02 },
					color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
				},
			},
			{
				id: 'dotB',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					radius: { v: 0.016 },
					color: { v: { r: 0.4, g: 1, b: 0.6, a: 1 } },
				},
			},
			{
				id: 'dotC',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					radius: { v: 0.012 },
					color: { v: { r: 1, g: 0.8, b: 0.3, a: 1 } },
				},
			},
		],
		edges: [

			// Wire planet positions into live dots
			{ fromNode: 'orbitA', fromPort: 0, toNode: 'dotA', toPort: 1 },
			{ fromNode: 'orbitB', fromPort: 0, toNode: 'dotB', toPort: 1 },
			{ fromNode: 'orbitC', fromPort: 0, toNode: 'dotC', toPort: 1 },
			{ fromNode: 'orbitA', fromPort: 0, toNode: 'drawOrbitA', toPort: 1 },
			{ fromNode: 'orbitB', fromPort: 0, toNode: 'drawOrbitB', toPort: 1 },
			{ fromNode: 'orbitC', fromPort: 0, toNode: 'drawOrbitC', toPort: 1 },
			{ fromNode: 'aRadiusSlider', fromPort: 0, toNode: 'drawOrbitA', toPort: 2 },
			{ fromNode: 'bRadiusSlider', fromPort: 0, toNode: 'drawOrbitB', toPort: 2 },
			{ fromNode: 'cRadiusSlider', fromPort: 0, toNode: 'drawOrbitC', toPort: 2 },


			{ fromNode: 'orbitA', fromPort: 0, toNode: 'lineA', toPort: 1 },
			{ fromNode: 'orbitB', fromPort: 0, toNode: 'lineA', toPort: 2 },


			{ fromNode: 'orbitA', fromPort: 0, toNode: 'lineB', toPort: 1 },
			{ fromNode: 'orbitC', fromPort: 0, toNode: 'lineB', toPort: 2 },


			{ fromNode: 'orbitB', fromPort: 0, toNode: 'lineC', toPort: 1 },
			{ fromNode: 'orbitC', fromPort: 0, toNode: 'lineC', toPort: 2 },

		],
	},
};
