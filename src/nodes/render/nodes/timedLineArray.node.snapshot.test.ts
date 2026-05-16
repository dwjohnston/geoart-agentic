import { describe, expect, it } from 'bun:test';
import { createFakeContext } from "../../../common-tooling/test-tooling/fakeContext"
import { timedLineArrayNodeDef } from "./timedLineArray.node";

const pointA0 = { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 };
const pointA1 = { x: 0.5, y: 0, r: 0, g: 1, b: 0, a: 1, dx: 0, dy: 0 };
const pointA2 = { x: 0, y: -0.5, r: 0, g: 0, b: 1, a: 1, dx: 0, dy: 0 };
const pointA3 = { x: 0.5, y: -0.5, r: 1, g: 1, b: 0, a: 1, dx: 0, dy: 0 };

const pointB0 = { x: -0.5, y: 0, r: 1, g: 0, b: 1, a: 1, dx: 0, dy: 0 };
const pointB1 = { x: -0.5, y: 0.5, r: 0, g: 1, b: 1, a: 1, dx: 0, dy: 0 };

describe("timedLineArrayNodeDef", () => {

  it("all-to-all: draws every A to every B", () => {

    const fakeContext = createFakeContext();

    timedLineArrayNodeDef.evaluate({
      intervalTicks: 6,
      mode: 'all-to-all',
      colorPointsA: [
        {
          x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0,
          dy: 0,
        },
        {
          x: -0.5, y: -0.5, r: 0, g: 1, b: 0, a: 1, dx: 0,
          dy: 0,
        },
      ],
      colorPointsB: [
        {
          x: 0.5, y: 0.5, r: 0, g: 0, b: 1, a: 1, dx: 0,
          dy: 0,
        },
        {
          x: 0.5, y: -0.5, r: 1, g: 1, b: 0, a: 1, dx: 0,
          dy: 0,
        },
      ],
    }, {
      canvas: fakeContext,
      height: 100,
      width: 100,
    })

    expect(fakeContext.getCalls()).toMatchInlineSnapshot(`
      [
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 1,
        },
        {
          "args": [
            50,
            50,
            75,
            25,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(255, 0, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(0, 0, 255, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": ,
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            50,
            50,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            75,
            25,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [],
          "kind": "method",
          "name": "stroke",
        },
        {
          "args": [
            50,
            50,
            75,
            75,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(255, 0, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(255, 255, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": ,
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            50,
            50,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            75,
            75,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [],
          "kind": "method",
          "name": "stroke",
        },
        {
          "args": [
            25,
            75,
            75,
            25,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(0, 255, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(0, 0, 255, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": ,
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            25,
            75,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            75,
            25,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [],
          "kind": "method",
          "name": "stroke",
        },
        {
          "args": [
            25,
            75,
            75,
            75,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(0, 255, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(255, 255, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": ,
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            25,
            75,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            75,
            75,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [],
          "kind": "method",
          "name": "stroke",
        },
      ]
    `);
  })

  it("distribute: divides A proportionally across B", () => {
    // A: [a0, a1, a2, a3], B: [b0, b1]
    // i=0 → bIndex=floor(0*2/4)=0 → a0→b0
    // i=1 → bIndex=floor(0.5)=0   → a1→b0
    // i=2 → bIndex=floor(1)=1     → a2→b1
    // i=3 → bIndex=floor(1.5)=1   → a3→b1

    const fakeContext = createFakeContext();

    timedLineArrayNodeDef.evaluate({
      intervalTicks: 6,
      mode: 'distribute',
      colorPointsA: [pointA0, pointA1, pointA2, pointA3],
      colorPointsB: [pointB0, pointB1],
    }, {
      canvas: fakeContext,
      height: 100,
      width: 100,
    });

    // pixel coords (canvas 100x100, formula: x*50+50, 50-y*50):
    // a0=(0,0)→(50,50)  a1=(0.5,0)→(75,50)  a2=(0,-0.5)→(50,75)  a3=(0.5,-0.5)→(75,75)
    // b0=(-0.5,0)→(25,50)  b1=(-0.5,0.5)→(25,25)
    expect(fakeContext.getCalls()).toMatchInlineSnapshot(`
      [
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 1,
        },
        {
          "args": [
            50,
            50,
            25,
            50,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(255, 0, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(255, 0, 255, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": ,
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            50,
            50,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            25,
            50,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [],
          "kind": "method",
          "name": "stroke",
        },
        {
          "args": [
            75,
            50,
            25,
            50,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(0, 255, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(255, 0, 255, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": ,
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            75,
            50,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            25,
            50,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [],
          "kind": "method",
          "name": "stroke",
        },
        {
          "args": [
            50,
            75,
            25,
            25,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(0, 0, 255, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(0, 255, 255, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": ,
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            50,
            75,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            25,
            25,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [],
          "kind": "method",
          "name": "stroke",
        },
        {
          "args": [
            75,
            75,
            25,
            25,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(255, 255, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(0, 255, 255, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": ,
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            75,
            75,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            25,
            25,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [],
          "kind": "method",
          "name": "stroke",
        },
      ]
    `);
  });

  it("interleave: cycles through B for each A", () => {
    // A: [a0, a1, a2, a3], B: [b0, b1]
    // i=0 → bIndex=0%2=0 → a0→b0
    // i=1 → bIndex=1%2=1 → a1→b1
    // i=2 → bIndex=2%2=0 → a2→b0
    // i=3 → bIndex=3%2=1 → a3→b1

    const fakeContext = createFakeContext();

    timedLineArrayNodeDef.evaluate({
      intervalTicks: 6,
      mode: 'interleave',
      colorPointsA: [pointA0, pointA1, pointA2, pointA3],
      colorPointsB: [pointB0, pointB1],
    }, {
      canvas: fakeContext,
      height: 100,
      width: 100,
    });

    // pixel coords (canvas 100x100):
    // a0=(0,0)→(50,50)  a1=(0.5,0)→(75,50)  a2=(0,-0.5)→(50,75)  a3=(0.5,-0.5)→(75,75)
    // b0=(-0.5,0)→(25,50)  b1=(-0.5,0.5)→(25,25)
    expect(fakeContext.getCalls()).toMatchInlineSnapshot(`
      [
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 1,
        },
        {
          "args": [
            50,
            50,
            25,
            50,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(255, 0, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(255, 0, 255, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": ,
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            50,
            50,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            25,
            50,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [],
          "kind": "method",
          "name": "stroke",
        },
        {
          "args": [
            75,
            50,
            25,
            25,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(0, 255, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(0, 255, 255, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": ,
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            75,
            50,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            25,
            25,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [],
          "kind": "method",
          "name": "stroke",
        },
        {
          "args": [
            50,
            75,
            25,
            50,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(0, 0, 255, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(255, 0, 255, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": ,
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            50,
            75,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            25,
            50,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [],
          "kind": "method",
          "name": "stroke",
        },
        {
          "args": [
            75,
            75,
            25,
            25,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(255, 255, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(0, 255, 255, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": ,
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            75,
            75,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            25,
            25,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [],
          "kind": "method",
          "name": "stroke",
        },
      ]
    `);
  });

})
