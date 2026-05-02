import { describe, expect, it } from "vitest";
import { createFakeContext } from "../../../graphEngine/fakeContext";
import { circleNodeDef } from "./circle.node";

describe("circleNodeDef", () => {

    it("draws on context properly", () => {

        const fakeContext = createFakeContext();


        // THIS SUCKS
        // The array is really awful, no names on them. 
        circleNodeDef.evaluate([
            {
                "kind": "number",
                "v": 1,
            },
            {
                "kind": "point",
                "v": {
                    x: 0, y: 0
                }
            },
            {
                "kind": "number",
                "v": 1
            },
            {
                "kind": "color",
                "v": {
                    a: 1,
                    r: 1,
                    g: 1,
                    b: 1,
                }
            },

        ], {
            "canvas": fakeContext,
            "height": 100,
            width: 100
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
                0,
                0,
                50,
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