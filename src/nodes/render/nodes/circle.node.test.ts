import { describe, expect, it } from "vitest";
import { createFakeContext } from "../../../common-tooling/test-tooling/fakeContext"
import { circleNodeDef } from "./circle.node";

describe("circleNodeDef", () => {

  it("draws on context properly", () => {

    const fakeContext = createFakeContext();

    circleNodeDef.evaluate({
      intervalTicks: 0,
      center: { x: 0.5, y: 0.5 },
      radius: 0.5,
      color: { r: 1, g: 1, b: 1, a: 1 },
      centerPoints: []
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
            75,
            25,
            25,
            0,
            6.283185307179586,
          ],
          "kind": "method",
          "name": "arc",
        },
        {
          "args": [],
          "kind": "method",
          "name": "stroke",
        },
      ]
    `)
  })

})
