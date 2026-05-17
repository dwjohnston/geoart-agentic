import { describe, expect, it } from 'bun:test';
import { createFakeContext } from "../../../common-tooling/test-tooling/fakeContext"
import { timedLineArrayNodeDef } from "./timedLineArray.node";

function createCtxWithState(fakeContext: ReturnType<typeof createFakeContext>) {
  let state: unknown;
  return {
    canvas: fakeContext,
    width: 100,
    height: 100,
    getState: <T>() => state as T | undefined,
    setState: <T>(s: T) => { state = s; },
  };
}

describe("timedLineArrayNodeDef", () => {

  it("mode: 'all-to-all' draws all A×B links", () => {

    const fakeContext = createFakeContext();

    timedLineArrayNodeDef.evaluate({
      intervalTicks: 6,
      mode: 'all-to-all',
      intervalMode: 'all',
      colorPointsA: [
        { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 },
        { x: -0.5, y: -0.5, r: 0, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
      ],
      colorPointsB: [
        { x: 0.5, y: 0.5, r: 0, g: 0, b: 1, a: 1, dx: 0, dy: 0 },
        { x: 0.5, y: -0.5, r: 1, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
      ],
    } as any, {
      canvas: fakeContext,
      height: 100,
      width: 100,
    })

    expect(fakeContext.getCalls()).toMatchInlineSnapshot(`
      [
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 1,
        },
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
            "rgba(0, 0, 255, 1)",
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
        {
          "args": [
            50,
            50,
            75,
            75,
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
            "rgba(255, 255, 0, 1)",
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
            75,
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
          "args": [
            25,
            75,
            75,
            25,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(0, 255, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(0, 0, 255, 1)",
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
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            25,
            75,
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
        {
          "args": [
            25,
            75,
            75,
            75,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(0, 255, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(255, 255, 0, 1)",
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
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            25,
            75,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            75,
            75,
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

  it("mode: 'interleave' connects A[i] to B[i % B.length]", () => {

    const fakeContext = createFakeContext();

    // A[0]→B[0], A[1]→B[1]
    timedLineArrayNodeDef.evaluate({
      intervalTicks: 6,
      mode: 'interleave',
      intervalMode: 'all',
      colorPointsA: [
        { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 },
        { x: -0.5, y: -0.5, r: 0, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
      ],
      colorPointsB: [
        { x: 0.5, y: 0.5, r: 0, g: 0, b: 1, a: 1, dx: 0, dy: 0 },
        { x: 0.5, y: -0.5, r: 1, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
      ],
    } as any, {
      canvas: fakeContext,
      height: 100,
      width: 100,
    })

    // Link 0: A[0](50,50) → B[0](75,25)
    // Link 1: A[1](25,75) → B[1](75,75)
    expect(fakeContext.getCalls()).toMatchInlineSnapshot(`
      [
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 1,
        },
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
            "rgba(0, 0, 255, 1)",
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
        {
          "args": [
            25,
            75,
            75,
            75,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(0, 255, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(255, 255, 0, 1)",
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
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            25,
            75,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            75,
            75,
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

  it("mode: 'distribute' maps 4 A's to 2 B's", () => {

    const fakeContext = createFakeContext();

    // floor(0*2/4)=0, floor(1*2/4)=0, floor(2*2/4)=1, floor(3*2/4)=1
    // A[0](-0.75,0)→B[0](0,0.5), A[1](-0.25,0)→B[0](0,0.5)
    // A[2](0.25,0)→B[1](0,-0.5), A[3](0.75,0)→B[1](0,-0.5)
    timedLineArrayNodeDef.evaluate({
      intervalTicks: 6,
      mode: 'distribute',
      intervalMode: 'all',
      colorPointsA: [
        { x: -0.75, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 },
        { x: -0.25, y: 0, r: 0, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
        { x: 0.25, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 0, dy: 0 },
        { x: 0.75, y: 0, r: 1, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
      ],
      colorPointsB: [
        { x: 0, y: 0.5, r: 1, g: 0, b: 1, a: 1, dx: 0, dy: 0 },
        { x: 0, y: -0.5, r: 0, g: 1, b: 1, a: 1, dx: 0, dy: 0 },
      ],
    } as any, {
      canvas: fakeContext,
      height: 100,
      width: 100,
    })

    // Pixel coords:
    // A[0]: x=-0.75 → -0.75*50+50=12.5, y=0 → 50
    // A[1]: x=-0.25 → -0.25*50+50=37.5, y=0 → 50
    // A[2]: x=0.25  → 0.25*50+50=62.5,  y=0 → 50
    // A[3]: x=0.75  → 0.75*50+50=87.5,  y=0 → 50
    // B[0]: x=0 → 50, y=0.5 → 50-0.5*50=25
    // B[1]: x=0 → 50, y=-0.5 → 50+0.5*50=75
    expect(fakeContext.getCalls()).toMatchInlineSnapshot(`
      [
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 1,
        },
        {
          "args": [
            12.5,
            50,
            50,
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
            "rgba(255, 0, 255, 1)",
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
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            12.5,
            50,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            50,
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
        {
          "args": [
            37.5,
            50,
            50,
            25,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(0, 255, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(255, 0, 255, 1)",
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
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            37.5,
            50,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            50,
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
        {
          "args": [
            62.5,
            50,
            50,
            75,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(0, 0, 255, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(0, 255, 255, 1)",
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
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            62.5,
            50,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            50,
            75,
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
          "args": [
            87.5,
            50,
            50,
            75,
          ],
          "kind": "method",
          "name": "createLinearGradient",
        },
        {
          "args": [
            0,
            "rgba(255, 255, 0, 1)",
          ],
          "kind": "method",
          "name": "gradient.addColorStop",
        },
        {
          "args": [
            1,
            "rgba(0, 255, 255, 1)",
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
          "args": [],
          "kind": "method",
          "name": "beginPath",
        },
        {
          "args": [
            87.5,
            50,
          ],
          "kind": "method",
          "name": "moveTo",
        },
        {
          "args": [
            50,
            75,
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

  it("intervalMode: 'cycle' draws one link per tick cycling through all links", () => {

    const fakeContext1 = createFakeContext();
    const fakeContext2 = createFakeContext();

    const sharedInputs = {
      intervalTicks: 1,
      mode: 'all-to-all',
      intervalMode: 'cycle',
      colorPointsA: [
        { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 },
      ],
      colorPointsB: [
        { x: 0.5, y: 0.5, r: 0, g: 0, b: 1, a: 1, dx: 0, dy: 0 },
        { x: -0.5, y: -0.5, r: 0, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
      ],
    } as any;

    // Two separate evaluations with independent state — first call draws link 0, second draws link 0 again (no shared state)
    const ctx1 = createCtxWithState(fakeContext1);
    const ctx2 = createCtxWithState(fakeContext2);

    timedLineArrayNodeDef.evaluate(sharedInputs, ctx1);
    timedLineArrayNodeDef.evaluate(sharedInputs, ctx1);

    // Call 1: counter=0 → link[0]: A[0](50,50)→B[0](75,25)
    // Call 2: counter=1 → link[1]: A[0](50,50)→B[1](25,75)
    expect(fakeContext1.getCalls()).toMatchInlineSnapshot(`
      [
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 1,
        },
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
            "rgba(0, 0, 255, 1)",
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
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 1,
        },
        {
          "args": [
            50,
            50,
            25,
            75,
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
            25,
            75,
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

    // Independent second context gets fresh state — draws link 0 only
    timedLineArrayNodeDef.evaluate(sharedInputs, ctx2);
    expect(fakeContext2.getCalls()).toMatchInlineSnapshot(`
      [
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 1,
        },
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
            "rgba(0, 0, 255, 1)",
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

  it("intervalMode: 'back-and-forth' ping-pongs through links", () => {

    const fakeContext = createFakeContext();
    const ctx = createCtxWithState(fakeContext);

    // 3 links: n=3, cycle=4, sequence: 0,1,2,1,0,1,2,...
    const inputs = {
      intervalTicks: 1,
      mode: 'all-to-all',
      intervalMode: 'back-and-forth',
      colorPointsA: [
        { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 },
      ],
      colorPointsB: [
        { x: -0.5, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 0, dy: 0 },
        { x: 0, y: 0.5, r: 0, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
        { x: 0.5, y: 0, r: 1, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
      ],
    } as any;

    // Call 1: counter=0 → getPingPong(0,3)=0 → link[0]: A[0](50,50)→B[0](25,50)
    // Call 2: counter=1 → getPingPong(1,3)=1 → link[1]: A[0](50,50)→B[1](50,25)
    // Call 3: counter=2 → getPingPong(2,3)=2 → link[2]: A[0](50,50)→B[2](75,50)
    // Call 4: counter=3 → getPingPong(3,3)=1 → link[1]: A[0](50,50)→B[1](50,25)
    timedLineArrayNodeDef.evaluate(inputs, ctx);
    timedLineArrayNodeDef.evaluate(inputs, ctx);
    timedLineArrayNodeDef.evaluate(inputs, ctx);
    timedLineArrayNodeDef.evaluate(inputs, ctx);

    expect(fakeContext.getCalls()).toMatchInlineSnapshot(`
      [
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 1,
        },
        {
          "args": [
            50,
            50,
            25,
            50,
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
            "rgba(0, 0, 255, 1)",
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
            25,
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
          "name": "lineWidth",
          "value": 1,
        },
        {
          "args": [
            50,
            50,
            50,
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
            50,
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
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 1,
        },
        {
          "args": [
            50,
            50,
            75,
            50,
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
            "rgba(255, 255, 0, 1)",
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
          "name": "lineWidth",
          "value": 1,
        },
        {
          "args": [
            50,
            50,
            50,
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
            50,
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

  it("intervalMode: 'inside-out' draws symmetrically from center outward", () => {

    const fakeContext = createFakeContext();
    const ctx = createCtxWithState(fakeContext);

    // 4 links: centerLeft=floor(3/2)=1, centerRight=ceil(3/2)=2
    // totalSteps=ceil(4/2)=2
    // step0 (counter=0): leftIdx=1, rightIdx=2 → links[1] and links[2]
    // step1 (counter=1): leftIdx=0, rightIdx=3 → links[0] and links[3]
    // step0 again (counter=2 % 2=0): links[1] and links[2]
    const inputs = {
      intervalTicks: 1,
      mode: 'all-to-all',
      intervalMode: 'inside-out',
      colorPointsA: [
        { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 },
      ],
      colorPointsB: [
        { x: -0.75, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 0, dy: 0 },
        { x: -0.25, y: 0, r: 0, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
        { x: 0.25, y: 0, r: 1, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
        { x: 0.75, y: 0, r: 0, g: 1, b: 1, a: 1, dx: 0, dy: 0 },
      ],
    } as any;

    // B pixel x coords: -0.75→12.5, -0.25→37.5, 0.25→62.5, 0.75→87.5; y=0→50
    // A: (50,50)
    timedLineArrayNodeDef.evaluate(inputs, ctx); // step0 → links[1,2]
    timedLineArrayNodeDef.evaluate(inputs, ctx); // step1 → links[0,3]
    timedLineArrayNodeDef.evaluate(inputs, ctx); // step0 again → links[1,2]

    expect(fakeContext.getCalls()).toMatchInlineSnapshot(`
      [
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 1,
        },
        {
          "args": [
            50,
            50,
            37.5,
            50,
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
            37.5,
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
          "args": [
            50,
            50,
            62.5,
            50,
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
            "rgba(255, 255, 0, 1)",
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
            62.5,
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
          "name": "lineWidth",
          "value": 1,
        },
        {
          "args": [
            50,
            50,
            12.5,
            50,
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
            "rgba(0, 0, 255, 1)",
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
            12.5,
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
          "args": [
            50,
            50,
            87.5,
            50,
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
            "rgba(0, 255, 255, 1)",
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
            87.5,
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
          "name": "lineWidth",
          "value": 1,
        },
        {
          "args": [
            50,
            50,
            37.5,
            50,
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
            37.5,
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
          "args": [
            50,
            50,
            62.5,
            50,
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
            "rgba(255, 255, 0, 1)",
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
            62.5,
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

  it("intervalMode: 'inside-out-and-forth' ping-pongs through inside-out steps", () => {

    const fakeContext = createFakeContext();
    const ctx = createCtxWithState(fakeContext);

    // 4 links: totalSteps=2
    // getPingPong(0,2)=0 → links[1,2]
    // getPingPong(1,2)=1 → links[0,3]
    // getPingPong(2,2)=0 → links[1,2]
    const inputs = {
      intervalTicks: 1,
      mode: 'all-to-all',
      intervalMode: 'inside-out-and-forth',
      colorPointsA: [
        { x: 0, y: 0, r: 1, g: 0, b: 0, a: 1, dx: 0, dy: 0 },
      ],
      colorPointsB: [
        { x: -0.75, y: 0, r: 0, g: 0, b: 1, a: 1, dx: 0, dy: 0 },
        { x: -0.25, y: 0, r: 0, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
        { x: 0.25, y: 0, r: 1, g: 1, b: 0, a: 1, dx: 0, dy: 0 },
        { x: 0.75, y: 0, r: 0, g: 1, b: 1, a: 1, dx: 0, dy: 0 },
      ],
    } as any;

    timedLineArrayNodeDef.evaluate(inputs, ctx); // step0 → links[1,2]
    timedLineArrayNodeDef.evaluate(inputs, ctx); // step1 → links[0,3]
    timedLineArrayNodeDef.evaluate(inputs, ctx); // getPingPong(2,2)=0 → links[1,2]

    expect(fakeContext.getCalls()).toMatchInlineSnapshot(`
      [
        {
          "kind": "property",
          "name": "lineWidth",
          "value": 1,
        },
        {
          "args": [
            50,
            50,
            37.5,
            50,
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
            37.5,
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
          "args": [
            50,
            50,
            62.5,
            50,
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
            "rgba(255, 255, 0, 1)",
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
            62.5,
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
          "name": "lineWidth",
          "value": 1,
        },
        {
          "args": [
            50,
            50,
            12.5,
            50,
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
            "rgba(0, 0, 255, 1)",
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
            12.5,
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
          "args": [
            50,
            50,
            87.5,
            50,
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
            "rgba(0, 255, 255, 1)",
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
            87.5,
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
          "name": "lineWidth",
          "value": 1,
        },
        {
          "args": [
            50,
            50,
            37.5,
            50,
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
            37.5,
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
          "args": [
            50,
            50,
            62.5,
            50,
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
            "rgba(255, 255, 0, 1)",
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
            62.5,
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
