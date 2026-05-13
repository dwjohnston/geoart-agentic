import { describe, expect, it } from 'bun:test';
import { createFakeContext } from "../../../common-tooling/test-tooling/fakeContext"
import { connectDotsNodeDef } from "./connectDots.node";

describe("connectDotsNodeDef", () => {

  it("draws lines between consecutive points", () => {

    const fakeContext = createFakeContext();

    connectDotsNodeDef.evaluate({
      colorPointsArray: [
        {
          x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0,
          dy: 0,
        },
        {
          x: 10, y: 10, r: 0, g: 1, b: 0, a: 1, dx: 0,
          dy: 0,
        },
        {
          x: 20, y: 0, r: 0, g: 0, b: 1, a: 1,
          dx: 0,
          dy: 0,

        },
      ],
      lineWidth: 2,
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
            550,
            -450,
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
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            550,
            -450,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            1050,
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
      ]
    `);
  })

  it("does nothing with less than 2 points", () => {
    const fakeContext = createFakeContext();

    connectDotsNodeDef.evaluate({
      colorPointsArray: [
        {
          x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0,
          dy: 0,
        },
      ],
      lineWidth: 2,
    }, {
      canvas: fakeContext,
      height: 100,
      width: 100,
    })

    expect(fakeContext.getCalls()).toMatchInlineSnapshot(`[]`);
  })

})
