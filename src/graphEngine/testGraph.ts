import type { GeoArtGraph } from '../schema/_generated/schema-types';

// Minimal frozen graph used solely as a snapshot regression fixture.
// Do not change this — any modification will invalidate existing snapshots.
// It exercises both canvas layers: live (orbit ctx) and paint (trail ctx).
export const testGraph: GeoArtGraph = {
  version: '2.0',
  control: {
    nodes: [],
  },
  compute: {
    nodes: [
      { id: 'time', type: 'time', params: {} },
      {
        id: 'orbit',
        type: 'orbit',
        params: {
          time: { ref: 'time.time' },
          radius: { v: 0.3 },
          speed: { v: 0.2 },
        },
      },
    ],
  },
  render: {
    nodes: [
      {
        id: 'liveDot',
        type: 'circle',
        renderConfig: { layer: 'live' },
        params: {
          center: { ref: 'orbit.point' },
          radius: { v: 0.02 },
          color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
        },
      },
      {
        id: 'trail',
        type: 'circle',
        renderConfig: { layer: 'paint' },
        params: {
          intervalTicks: { v: 1 },
          center: { ref: 'orbit.point' },
          radius: { v: 0.015 },
          color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 0.5 } },
        },
      },
    ],
  },
};
