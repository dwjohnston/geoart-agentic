import type { GeoArtGraph } from '../schema/_generated/schema-types';

// Earth-Venus spirograph algorithm.
//
// Two bodies orbit a common centre at different speeds. A line is drawn
// between them on each render tick, accumulating a spirograph pattern.
// Grey trails accumulate on the paint layer to show each planet's orbital
// path. Coloured dots on the live layer show each planet's current position.
//
// Orbit node ports:  0=time, 1=radius, 2=speed  → output 0=point
// TimedLine ports:   0=intervalMs, 1=pointA, 2=pointB, 3=color
// Circle ports:      0=intervalMs, 1=center, 2=radius, 3=color

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
				id: 'earthDistanceSlider',
				type: 'slider',
				params: {
					label: { v: 'Earth Distance' },
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
			{
				id: 'venusDistanceSlider',
				type: 'slider',
				params: {
					label: { v: 'Venus Distance' },
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
			{ fromNode: 'earthDistanceSlider', fromPort: 0, toNode: 'earthOrbit', toPort: 1 },
			{ fromNode: 'venusDistanceSlider', fromPort: 0, toNode: 'venusOrbit', toPort: 1 },
		],
	},
	render: {
		nodes: [
			// Spirograph lines between the two planets
			{
				id: 'line',
				type: 'timedLine',
				renderConfig: { layer: 'paint' },
				params: {
					color: { v: { r: 0.8, g: 0.6, b: 1, a: 0.6 } },
					// intervalMs, pointA, pointB driven by edges
				},
			},
			// Grey orbital trails — accumulate on the paint layer
			{
				id: 'earthTrail',
				type: 'circle',
				renderConfig: { layer: 'paint' },
				params: {
					intervalMs: { v: 16 },
					radius: { v: 0.015 },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
				},
			},
			{
				id: 'venusTrail',
				type: 'circle',
				renderConfig: { layer: 'paint' },
				params: {
					intervalMs: { v: 16 },
					radius: { v: 0.015 },
					color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
				},
			},
			// Current-position dots — redrawn each frame on the live layer
			{
				id: 'earthDot',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					radius: { v: 0.02 },
					color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
					// intervalMs defaults to 0 (every frame)
				},
			},
			{
				id: 'venusDot',
				type: 'circle',
				renderConfig: { layer: 'live' },
				params: {
					radius: { v: 0.02 },
					color: { v: { r: 1, g: 0.8, b: 0.2, a: 1 } },
					// intervalMs defaults to 0 (every frame)
				},
			},
		],
		edges: [
			// Wire orbit positions into the spirograph line endpoints
			{ fromNode: 'earthOrbit', fromPort: 0, toNode: 'line', toPort: 1 },
			{ fromNode: 'venusOrbit', fromPort: 0, toNode: 'line', toPort: 2 },
			// Wire orbit positions into the trail dots
			{ fromNode: 'earthOrbit', fromPort: 0, toNode: 'earthTrail', toPort: 1 },
			{ fromNode: 'venusOrbit', fromPort: 0, toNode: 'venusTrail', toPort: 1 },
			// Wire orbit positions into the current-position dots
			{ fromNode: 'earthOrbit', fromPort: 0, toNode: 'earthDot', toPort: 1 },
			{ fromNode: 'venusOrbit', fromPort: 0, toNode: 'venusDot', toPort: 1 },
		],
	},
};
