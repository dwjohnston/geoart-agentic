import { expect, test } from 'vitest'
import type { GeoArtGraph } from './_generated/schema-types'
import { validateGeoArtGraph } from './validateGeoArtGraph'

test('earth venus example algorithm validates against schema', () => {
  // Minimal example graph object that should conform to the generated GeoArtGraph type.
  const earthVenus: GeoArtGraph = {
    version: '0.1',
    control: {
      nodes: [],
    },
    compute: {
      nodes: [
        { id: 'time', type: 'time', params: {} },
        {
          id: 'earthOrbit',
          type: 'orbit',
          params: {
            radius: { v: 0.6 },
            speed: { v: 0.2 },
          },
        },
        {
          id: 'venusOrbit',
          type: 'orbit',
          params: {
            radius: { v: 0.3 },
            speed: { v: 0.33 },
          },
        },
      ],
      edges: [],
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

