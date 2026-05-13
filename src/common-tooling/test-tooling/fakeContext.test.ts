import { describe, expect, it } from 'bun:test';
import { createFakeContext } from "./fakeContext";

describe(createFakeContext, () => {
    it("serializes things nicely - simple", () => {
        const ctx = createFakeContext();

        const gradient = ctx.createLinearGradient(1, 2, 3, 4)
        gradient.addColorStop(1, 'rgba(1,2,3,4)')

        // ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(1, 2);
        ctx.lineTo(2, 1);
        ctx.stroke()

        expect(ctx.getCalls()).toMatchInlineSnapshot(`
          [
            {
              "args": [
                1,
                2,
                3,
                4,
              ],
              "kind": "method",
              "name": "createLinearGradient",
            },
            {
              "args": [
                1,
                "rgba(1,2,3,4)",
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
                1,
                2,
              ],
              "kind": "method",
              "name": "moveTo",
            },
            {
              "args": [
                2,
                1,
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
        `)


    })

    it("serializes things nicely - setting a strokeStyle with gradient", () => {
        const ctx = createFakeContext();

        const gradient = ctx.createLinearGradient(1, 2, 3, 4)
        gradient.addColorStop(1, 'rgba(1,2,3,4)')

        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(1, 2);
        ctx.lineTo(2, 1);
        ctx.stroke()

        expect(ctx.getCalls()).toMatchInlineSnapshot(`
          [
            {
              "args": [
                1,
                2,
                3,
                4,
              ],
              "kind": "method",
              "name": "createLinearGradient",
            },
            {
              "args": [
                1,
                "rgba(1,2,3,4)",
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
                1,
                2,
              ],
              "kind": "method",
              "name": "moveTo",
            },
            {
              "args": [
                2,
                1,
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
        `)


    })
})