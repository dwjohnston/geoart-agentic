import { describe, expect, it } from 'bun:test';
import { createFakeContext } from "../../../common-tooling/test-tooling/fakeContext"
import { timedLineNodeDef } from "./timedLine.node";

describe("timedLineNodeDef", () => {

  it("draws line with gradient between two color points", () => {

    const fakeContext = createFakeContext();

    timedLineNodeDef.evaluate({
      intervalTicks: 6,
      colorPointA: {
        x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0,
        dy: 0,
      },
      colorPointB: {
        x: 0.5, y: 0.5, r: 0, g: 1, b: 0, a: 1, dx: 0,
        dy: 0,
      },
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
            "rgba(0, 255, 0, 1)",
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
          "kind": "property",
          "name": "lineWidth",
          "value": 1,
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
