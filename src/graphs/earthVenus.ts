import type { GeoArtGraph } from '../schema/_generated/schema-types';

// Earth-Venus spirograph algorithm.
//
// Two bodies orbit a common centre at different speeds. A line is drawn
// between them on each render tick, accumulating a spirograph pattern.
//
// Orbit node ports:  0=time, 1=radius, 2=speed  → output 0=point
// TimedLine ports:   0=intervalMs, 1=pointA, 2=pointB, 3=color

export const earthVenusGraph: GeoArtGraph = {
	version: '0.1',
	control: {
		nodes: [
			{
				id: 'earthSpeedSlider',
				type: 'slider',
				params: {
					label: { v: 'Earth Speed' },
					min: { v: 0 },
					max: { v: 1 },
					value: { v: 0.2 },
				},
			},
			{
				id: 'venusSpeedSlider',
				type: 'slider',
				params: {
					label: { v: 'Venus Speed' },
					min: { v: 0 },
					max: { v: 1 },
					value: { v: 0.323 },
				},
			},
		],
	},
	compute: {
		nodes: [
			{ id: 'time', type: 'time', params: {} },
			{
				id: 'earthOrbit',
				type: 'orbit',
				params: { radius: { v: 0.6 } },
				// speed driven by earthSpeedSlider via edge
			},
			{
				id: 'venusOrbit',
				type: 'orbit',
				params: { radius: { v: 0.6 } },
				// speed driven by venusSpeedSlider via edge
			},
		],
		edges: [
			// Wire time into both orbits
			{ fromNode: 'time', fromPort: 0, toNode: 'earthOrbit', toPort: 0 },
			{ fromNode: 'time', fromPort: 0, toNode: 'venusOrbit', toPort: 0 },
			// Wire sliders into orbit speeds
			{ fromNode: 'earthSpeedSlider', fromPort: 0, toNode: 'earthOrbit', toPort: 2 },
			{ fromNode: 'venusSpeedSlider', fromPort: 0, toNode: 'venusOrbit', toPort: 2 },
		],
	},
	render: {
		nodes: [
			{
				id: 'line',
				type: 'timedLine',
				params: {
					color: { v: { r: 0.8, g: 0.6, b: 1, a: 0.6 } },
					// intervalMs, pointA, pointB driven by edges
				},
			},
		],
		edges: [
			// Wire orbit positions into the line endpoints
			{ fromNode: 'earthOrbit', fromPort: 0, toNode: 'line', toPort: 1 },
			{ fromNode: 'venusOrbit', fromPort: 0, toNode: 'line', toPort: 2 },
		],
	},
};
