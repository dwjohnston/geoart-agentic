import { expect, test } from 'vitest'

test('earth venus example algorithm is defined', () => {
  // Minimal example graph object; future tests can validate against the schema.
  const earthVenus = {
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

  expect(earthVenus).toBeDefined()
})

