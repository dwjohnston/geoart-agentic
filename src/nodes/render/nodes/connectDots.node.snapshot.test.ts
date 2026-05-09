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

    connectDotsNodeDef.evaluate({
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

    connectDotsNodeDef.evaluate({
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
            -444.8020000000001,
            44.606,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -439.21600000000007,
            38.448,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -433.25399999999996,
            31.562,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -426.928,
            23.983999999999998,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -420.25000000000006,
            15.75,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -413.23199999999997,
            6.896000000000001,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -405.886,
            -2.5420000000000016,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -398.22399999999993,
            -12.528000000000006,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -390.2579999999999,
            -23.025999999999996,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -381.99999999999994,
            -34.000000000000014,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -373.46200000000005,
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
            -355.59399999999994,
            -69.418,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -346.28799999999995,
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
            -107.82400000000001,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -317.026,
            -121.12200000000001,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -306.864,
            -134.60799999999998,
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
            -162.00000000000006,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -275.32200000000006,
            -175.834,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -264.496,
            -189.71200000000002,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -253.534,
            -203.59799999999998,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -242.44799999999998,
            -217.45599999999996,
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
            -244.94400000000002,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -208.56599999999997,
            -258.502,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -197.10399999999996,
            -271.88800000000003,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -185.57799999999997,
            -285.06600000000003,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -174.00000000000003,
            -297.99999999999994,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -162.38200000000003,
            -310.654,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -150.73600000000002,
            -322.99199999999996,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -139.07399999999993,
            -334.97800000000007,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -127.40799999999996,
            -346.576,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -115.75000000000003,
            -357.75000000000006,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -104.11200000000005,
            -368.464,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -92.50599999999997,
            -378.6820000000001,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -80.94400000000005,
            -388.368,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -69.43799999999996,
            -397.48600000000005,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -57.99999999999996,
            -406.0000000000001,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -46.64200000000007,
            -413.87399999999985,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -35.376000000000005,
            -421.07199999999995,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -24.21400000000004,
            -427.558,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -13.167999999999978,
            -433.2959999999999,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            -2.2499999999999503,
            -438.25,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            8.528000000000048,
            -442.3840000000001,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            19.15399999999994,
            -445.6619999999999,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            29.615999999999953,
            -448.048,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            39.902000000000015,
            -449.50599999999986,
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
            -449.50600000000003,
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
            91.47200000000001,
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
            124.21400000000001,
            -427.558,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            135.376,
            -421.07199999999995,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            146.642,
            -413.87399999999997,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            158,
            -405.99999999999994,
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
            -378.6820000000001,
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
            215.75000000000003,
            -357.74999999999994,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            227.40800000000002,
            -346.576,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            239.07400000000004,
            -334.978,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            250.736,
            -322.99199999999996,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            262.38200000000006,
            -310.65400000000005,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            274,
            -297.99999999999994,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            285.578,
            -285.06600000000003,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            297.10400000000004,
            -271.888,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            308.56600000000003,
            -258.502,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            319.952,
            -244.94400000000002,
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
            -217.45599999999996,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            353.534,
            -203.59799999999996,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            364.49600000000004,
            -189.71200000000002,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            375.322,
            -175.83399999999995,
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
            396.51800000000003,
            -148.24599999999995,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            406.86400000000003,
            -134.608,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            417.026,
            -121.12199999999999,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            426.9920000000001,
            -107.82399999999996,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            436.75,
            -94.75000000000003,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            446.28799999999995,
            -81.936,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            455.59399999999994,
            -69.41800000000002,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            464.6559999999999,
            -57.23200000000004,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            473.46200000000005,
            -45.41399999999997,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            482,
            -33.9999999999999,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            490.25799999999987,
            -23.025999999999954,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            498.2240000000001,
            -12.528000000000091,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            505.8859999999999,
            -2.5420000000000442,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            513.232,
            6.895999999999972,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            520.25,
            15.749999999999886,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            526.9280000000001,
            23.984000000000005,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            533.2539999999999,
            31.56200000000009,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            539.2159999999999,
            38.44799999999999,
          ],
          "kind": "method",
          "name": "lineTo",
        },
        {
          "args": [
            544.8020000000001,
            44.60599999999992,
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
