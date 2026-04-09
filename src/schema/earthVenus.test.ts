import { expect, test } from 'vitest'
import type { GeoArtGraph } from './_generated/schema-types'
import { validateGeoArtGraph } from './validateGeoArtGraph'

test('earth venus example algorithm validates against schema', () => {
  // Minimal example graph object that should conform to the generated GeoArtGraph type.
  const earthVenus: GeoArtGraph = {
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
            value: { v: 0.33 },
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
          params: {
            radius: { v: 0.6 },
            // speed omitted — driven by earthSpeedSlider edge
          },
        },
        {
          id: 'venusOrbit',
          type: 'orbit',
          params: {
            radius: { v: 0.3 },
            // speed omitted — driven by venusSpeedSlider edge
          },
        },
      ],
      edges: [
        // earthSpeedSlider → earthOrbit.speed (port 2)
        { fromNode: 'earthSpeedSlider', fromPort: 0, toNode: 'earthOrbit', toPort: 2 },
        // venusSpeedSlider → venusOrbit.speed (port 2)
        { fromNode: 'venusSpeedSlider', fromPort: 0, toNode: 'venusOrbit', toPort: 2 },
      ],
    },
    render: {
      nodes: [
        {
          id: 'line',
          type: 'timedLine',
          params: {
            intervalMs: { v: 16 },
            width: { v: 1 },
            pointA: { v: { x: 0, y: 0 } },
            pointB: { v: { x: 0, y: 0 } },
            color: { v: { r: 1, g: 1, b: 1, a: 1 } },
          },
        },
      ],
      edges: [],
    },
  }

  expect(validateGeoArtGraph(earthVenus)).toBe(true)

  // Deliberately broken: schema requires `render` and `version` must be a string.
  const notMatching: unknown = {
    version: 0.1,
    control: { nodes: [] },
    compute: { nodes: [], edges: [] },
    // render is missing
  }

  expect(() => validateGeoArtGraph(notMatching)).not.toThrow()
  expect(validateGeoArtGraph(notMatching)).toBe(false)
})

