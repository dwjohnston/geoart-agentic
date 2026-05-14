import { describe, expect, it } from 'bun:test';
import { createFakeContext } from "../../../common-tooling/test-tooling/fakeContext"
import { linesThroughPointNodeDef } from "./linesThroughPoint";

describe("linesThroughPointNodeDef", () => {

  it("draws lines through points at specified degrees", () => {

    const fakeContext = createFakeContext();

    linesThroughPointNodeDef.evaluate({
      points: [
        {
          x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 1,
          dy: 0,
        },
      ],
      degrees: [0, 90],
      lineLength: 0.2,
    }, {
      canvas: fakeContext,
      height: 100,
      width: 100,
    })

    expect(fakeContext.getCalls()).toMatchInlineSnapshot(`
      [
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": "rgba(255, 0, 0, 1)",
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": "rgba(255, 255, 255, 1)",
        },
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 2,
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            40,
            50,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            60,
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
          "kind": "property",
          "name": "strokeStyle",
          "value": "rgba(255, 0, 0, 1)",
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": "rgba(255, 255, 255, 1)",
        },
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 2,
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            50,
            40,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            50,
            60,
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

  it("skips points with zero gradient", () => {

    const fakeContext = createFakeContext();

    linesThroughPointNodeDef.evaluate({
      points: [
        {
          x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0,
          dy: 0,
        },
      ],
      degrees: [0, 90],
      lineLength: 0.2,
    }, {
      canvas: fakeContext,
      height: 100,
      width: 100,
    })

    expect(fakeContext.getCalls()).toMatchInlineSnapshot(`[]`);
  })

})
