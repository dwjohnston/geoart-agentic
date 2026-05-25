import { describe, expect, it } from 'bun:test';
import { createFakeContext } from "../../../common-tooling/test-tooling/fakeContext"
import connectDotsNodeImplementation from "./connectDots";

describe("connectDotsNodeImplementation", () => {

  it("draws lines between consecutive points", () => {

    const fakeContext = createFakeContext();

    connectDotsNodeImplementation.evaluate({
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
      mode: 'straight',
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
          "value": 2,
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": "rgba(0, 255, 0, 1)",
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
          "kind": "property",
          "name": "strokeStyle",
          "value": "rgba(0, 0, 255, 1)",
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

    connectDotsNodeImplementation.evaluate({
      colorPointsArray: [
        {
          x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0,
          dy: 0,
        },
      ],
      lineWidth: 2,
      mode: 'straight',
    }, {
      canvas: fakeContext,
      height: 100,
      width: 100,
    })

    expect(fakeContext.getCalls()).toMatchInlineSnapshot(`[]`);
  })

  it("draws catmull-rom curves through points", () => {
    const fakeContext = createFakeContext();

    connectDotsNodeImplementation.evaluate({
      colorPointsArray: [
        {
          x: -10, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0,
          dy: 0,
        },
        {
          x: 0, y: 10, r: 0, g: 1, b: 0, a: 1, dx: 0,
          dy: 0,
        },
        {
          x: 10, y: 0, r: 0, g: 0, b: 1, a: 1,
          dx: 0,
          dy: 0,
        },
      ],
      lineWidth: 2,
      mode: 'catmull-rom',
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
          "value": 2,
        },
        {
          "kind": "property",
          "name": "strokeStyle",
          "value": "rgba(0, 255, 0, 1)",
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            -450,
            50,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            -444.802,
            44.606,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -439.216,
            38.448,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -433.254,
            31.562,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -426.928,
            23.984,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -420.25,
            15.75,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -413.232,
            6.896,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -405.886,
            -2.542,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -398.224,
            -12.528,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -390.258,
            -23.026,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -382,
            -34,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -373.462,
            -45.414,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -364.656,
            -57.232,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -355.594,
            -69.418,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -346.288,
            -81.936,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -336.75,
            -94.75,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -326.992,
            -107.824,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -317.026,
            -121.122,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -306.864,
            -134.608,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -296.518,
            -148.246,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -286,
            -162,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -275.322,
            -175.834,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -264.496,
            -189.712,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -253.534,
            -203.598,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -242.448,
            -217.456,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -231.25,
            -231.25,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -219.952,
            -244.944,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -208.566,
            -258.502,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -197.104,
            -271.888,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -185.578,
            -285.066,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -174,
            -298,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -162.382,
            -310.654,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -150.736,
            -322.992,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -139.074,
            -334.978,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -127.408,
            -346.576,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -115.75,
            -357.75,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -104.112,
            -368.464,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -92.506,
            -378.682,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -80.944,
            -388.368,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -69.438,
            -397.486,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -58,
            -406,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -46.642,
            -413.874,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -35.376,
            -421.072,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -24.214,
            -427.558,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -13.168,
            -433.296,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -2.25,
            -438.25,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            8.528,
            -442.384,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            19.154,
            -445.662,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            29.616,
            -448.048,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            39.902,
            -449.506,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            50,
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
          "kind": "property",
          "name": "strokeStyle",
          "value": "rgba(0, 0, 255, 1)",
        },
        {
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            50,
            -450,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            60.098,
            -449.506,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            70.384,
            -448.048,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            80.846,
            -445.662,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            91.472,
            -442.384,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            102.25,
            -438.25,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            113.168,
            -433.296,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            124.214,
            -427.558,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            135.376,
            -421.072,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            146.642,
            -413.874,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            158,
            -406,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            169.438,
            -397.486,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            180.944,
            -388.368,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            192.506,
            -378.682,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            204.112,
            -368.464,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            215.75,
            -357.75,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            227.408,
            -346.576,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            239.074,
            -334.978,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            250.736,
            -322.992,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            262.382,
            -310.654,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            274,
            -298,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            285.578,
            -285.066,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            297.104,
            -271.888,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            308.566,
            -258.502,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            319.952,
            -244.944,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            331.25,
            -231.25,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            342.448,
            -217.456,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            353.534,
            -203.598,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            364.496,
            -189.712,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            375.322,
            -175.834,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            386,
            -162,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            396.518,
            -148.246,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            406.864,
            -134.608,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            417.026,
            -121.122,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            426.992,
            -107.824,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            436.75,
            -94.75,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            446.288,
            -81.936,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            455.594,
            -69.418,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            464.656,
            -57.232,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            473.462,
            -45.414,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            482,
            -34,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            490.258,
            -23.026,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            498.224,
            -12.528,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            505.886,
            -2.542,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            513.232,
            6.896,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            520.25,
            15.75,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            526.928,
            23.984,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            533.254,
            31.562,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            539.216,
            38.448,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            544.802,
            44.606,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            550,
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

})
