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

  it("records chained calls on all four creators", () => {
    const ctx = createFakeContext();

    const linear = ctx.createLinearGradient(0, 0, 100, 0);
    linear.addColorStop(0, 'red');

    const radial = ctx.createRadialGradient(50, 50, 5, 50, 50, 50);
    radial.addColorStop(1, 'blue');

    const conic = ctx.createConicGradient(0, 50, 50);
    conic.addColorStop(0.5, 'green');


    // nb.those typings don't exist in this context
    const pattern = ctx.createPattern({} as CanvasImageSource, 'repeat')!;
    pattern.setTransform({} as DOMMatrix2DInit);

    const calls = ctx.getCalls();
    expect(calls).toContainEqual({ kind: 'method', name: 'gradient.addColorStop', args: [0, 'red'] });
    expect(calls).toContainEqual({ kind: 'method', name: 'gradient.addColorStop', args: [1, 'blue'] });
    expect(calls).toContainEqual({ kind: 'method', name: 'gradient.addColorStop', args: [0.5, 'green'] });
    expect(calls).toContainEqual({ kind: 'method', name: 'pattern.setTransform', args: [{}] });

    expect(ctx.getCalls()).toMatchInlineSnapshot(`
      [
        {
          "args": [
            0,
            0,
            100,
            0,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "red",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            50,
            50,
            5,
            50,
            50,
            50,
          ],
          "kind": "method",
          "name": "createRadialGradient",
        },
        {
          "args": [
            1,
            "blue",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            0,
            50,
            50,
          ],
          "kind": "method",
          "name": "createConicGradient",
        },
        {
          "args": [
            0.5,
            "green",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            {},
            "repeat",
          ],
          "kind": "method",
          "name": "createPattern",
        },
        {
          "args": [
            {},
          ],
          "kind": "method",
          "name": "pattern.setTransform",
        },
      ]
    `)
  })

  it("serialized property assignments", () => {
    const ctx = createFakeContext();


    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    ctx.moveTo(0, 0);
    ctx.beginPath();
    ctx.lineTo(100, 100);
    ctx.stroke();

    const calls = ctx.getCalls();
    expect(calls).toContainEqual({ kind: 'property', name: 'strokeStyle', value: 'red' });
    expect(calls).toContainEqual({ kind: 'property', name: 'lineWidth', value: 2 });

    expect(ctx.getCalls()).toMatchInlineSnapshot(`
      [
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": "red",
        },
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 2,
        },
        {
          "args": [
            0,
            0,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            100,
            100,
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