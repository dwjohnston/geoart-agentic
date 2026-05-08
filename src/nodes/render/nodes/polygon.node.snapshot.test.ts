import { describe, expect, it } from "vitest";
import { createFakeContext } from "../../../common-tooling/test-tooling/fakeContext"
import { polygonNodeDef } from "./polygon.node";

describe("polygonNodeDef", () => {

  it("draws polygon from points", () => {

    const fakeContext = createFakeContext();

    polygonNodeDef.evaluate({
      points: [
        {
          x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0,
          dy: 0,
        },
        {
          x: 0.5, y: 0.5, r: 0, g: 1, b: 0, a: 1, dx: 0,
          dy: 0,
        },
        {
          x: -0.5, y: 0.5, r: 0, g: 0, b: 1, a: 1,
          dx: 0,
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
          "name": "closePath",
        },
        {
          "args": [],
          "kind": "method",
          "name": "fill",
        },
      ]
    `);
  })

  it("does nothing with less than 3 points", () => {
    const fakeContext = createFakeContext();

    polygonNodeDef.evaluate({
      points: [
        {
          x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0,
          dy: 0,
        },
        {
          x: 0.5, y: 0.5, r: 0, g: 1, b: 0, a: 1, dx: 0,
          dy: 0,
        },
      ],
    }, {
      canvas: fakeContext,
      height: 100,
      width: 100,
    })

    expect(fakeContext.getCalls()).toMatchInlineSnapshot(`[]`);
  })

})
