import { describe, expect, it } from "vitest";
import { createFakeContext } from "../../../common-tooling/test-tooling/fakeContext"
import { timedLineArrayNodeDef } from "./timedLineArray.node";

describe("timedLineArrayNodeDef", () => {

  it("draws lines between corresponding points in arrays", () => {

    const fakeContext = createFakeContext();

    timedLineArrayNodeDef.evaluate({
      intervalTicks: 6,
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

  it("draws only matching pairs when arrays differ in length", () => {

    const fakeContext = createFakeContext();

    timedLineArrayNodeDef.evaluate({
      intervalTicks: 6,
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
      ],
    }, {
      canvas: fakeContext,
      height: 100,
      width: 100,
    })

    expect(fakeContext.getCalls()).toMatchInlineSnapshot(`
      [
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
      ]
    `);
  })

})
