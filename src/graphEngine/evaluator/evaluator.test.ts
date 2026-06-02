import { describe, expect, test, mock, it } from 'bun:test';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import { compile } from '../compiler/compiler';
import { tick } from './evaluator';
import type { EvalContext } from './EvalContext';

// I think what we're saying is that this import is ok for the purpose of the test.
// or you could create fake version of it for tests. 
// eslint-disable-next-line import/no-restricted-paths
import { realNodeRegistry, convertRenderNodeImplementationToLegacy, convertComputeNodeImplementationToLegacy, convertControlNodeImplementationToLegacy, implementComputeNode, implementControlNode, implementRenderNode, createGraphEngine } from '../exports';
// eslint-disable-next-line import/no-restricted-paths
import type { LegacyNodeRegistry } from '../exports';
import type { NodeInputsDeclared, NodeInputsResolved } from '../../schema/typeHelpers';
import { fColorPoint } from '../../constants';
import type { ControlSetter } from '../externalInterfaces/ControlNodeImplementation';
import { createFakeContext } from '../../common-tooling/test-tooling/fakeContext';
import { AlgorithmBuilder } from '../../schema/builder';
import { implementModule } from '../../nodes/module/implementModule';
import type { ModuleControlSetter, ModuleExpansionResult } from '../externalInterfaces/ModuleImplementation';
import { createInternalId } from '../../nodes/module/moduleUtils';
import { createInputMarkerParams, type RenderControlFn } from '../../nodes/module/nodes/orbit';



// ---------------------------------------------------------------------------
// Canvas mock factory
// ---------------------------------------------------------------------------

function makeGradientMock() {
  return { addColorStop: mock() };
}

function makeCanvasMock(): CanvasRenderingContext2D {
  return {
    beginPath: mock(),
    moveTo: mock(),
    lineTo: mock(),
    stroke: mock(),
    arc: mock(),
    fill: mock(),
    createLinearGradient: mock(() => makeGradientMock()),
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
}

function makeCtx(tickCount: number): EvalContext {
  const stateStore = new Map<string, unknown>();
  return {
    tickCount,
    canvas: {
      orbit: makeCanvasMock(),
      trail: makeCanvasMock(),
      width: 800,
      height: 600,
    },
    getState<T>(): T {
      return stateStore.get('__root__') as T;
    },
    setState<T>(s: T): void {
      stateStore.set('__root__', s);
    },
  };
}

// ---------------------------------------------------------------------------
// Earth-Venus graph fixture
// ---------------------------------------------------------------------------

const earthVenus: GeoArtGraph = {
  version: '2.0',
  control: {
    nodes: [
      {
        id: 'earthSpeedSlider',
        type: 'slider',
        params: {
          label: { v: 'Earth Speed' },
          min: { v: 0 },
          max: { v: 1 },
          value: { v: 0.2 },
        },
      },
      {
        id: 'venusSpeedSlider',
        type: 'slider',
        params: {
          label: { v: 'Venus Speed' },
          min: { v: 0 },
          max: { v: 1 },
          value: { v: 0.33 },
        },
      },
    ],
  },
  compute: {
    nodes: [
      { id: 'time', type: 'time', params: {} },
      {
        id: 'earthOrbit',
        type: 'orbit',
        params: {
          time: { ref: 'time.time' },
          radius: { v: 0.6 },
          speed: { ref: 'earthSpeedSlider.value' },
        },
      },
      {
        id: 'venusOrbit',
        type: 'orbit',
        params: {
          time: { ref: 'time.time' },
          radius: { v: 0.3 },
          speed: { ref: 'venusSpeedSlider.value' },
        },
      },
      {
        id: 'earthColorPoint',
        type: 'colorPointCompute',
        params: {
          point: { ref: 'earthOrbit.point' },
          color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
        },
      },
      {
        id: 'venusColorPoint',
        type: 'colorPointCompute',
        params: {
          point: { ref: 'venusOrbit.point' },
          color: { v: { r: 1, g: 0.8, b: 0.2, a: 1 } },
        },
      },
    ],
  },
  render: {
    nodes: [
      {
        id: 'line',
        type: 'timedLine',
        renderConfig: { layer: 'paint' },
        params: {
          intervalTicks: { v: 1 },
          colorPointA: { ref: 'earthColorPoint.colorPoint' },
          colorPointB: { ref: 'venusColorPoint.colorPoint' },
        },
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('graph compiler and evaluator — Earth-Venus integration', () => {
  test('compile() does not throw', () => {
    expect(() => compile(earthVenus, realNodeRegistry)).not.toThrow();
  });

  test('sortedNodes contains all node IDs', () => {
    const compiled = compile(earthVenus, realNodeRegistry);
    const allIds = [
      'earthSpeedSlider',
      'venusSpeedSlider',
      'time',
      'earthOrbit',
      'venusOrbit',
      'earthColorPoint',
      'venusColorPoint',
      'line',
    ];
    expect(compiled.sortedNodes).toHaveLength(allIds.length);
    for (const id of allIds) {
      expect(compiled.sortedNodes).toContain(id);
    }
  });

  test('sortedNodes respects topological order (sources before sinks)', () => {
    const compiled = compile(earthVenus, realNodeRegistry);
    const idx = (id: string) => compiled.sortedNodes.indexOf(id);

    // time must come before earthOrbit and venusOrbit.
    expect(idx('time')).toBeLessThan(idx('earthOrbit'));
    expect(idx('time')).toBeLessThan(idx('venusOrbit'));

    // sliders must come before the orbits they drive.
    expect(idx('earthSpeedSlider')).toBeLessThan(idx('earthOrbit'));
    expect(idx('venusSpeedSlider')).toBeLessThan(idx('venusOrbit'));

    // Orbits must come before the line render node.
    expect(idx('earthOrbit')).toBeLessThan(idx('line'));
    expect(idx('venusOrbit')).toBeLessThan(idx('line'));
  });

  test('tick() at t=0 does not throw', () => {
    const compiled = compile(earthVenus, realNodeRegistry);
    expect(() => tick(compiled, 0, makeCtx(0))).not.toThrow();
  });

  test('tick() at t=500 does not throw', () => {
    const compiled = compile(earthVenus, realNodeRegistry);
    tick(compiled, 0, makeCtx(0));
    expect(() => tick(compiled, 500, makeCtx(500))).not.toThrow();
  });

  test('time node outputs the tick count', () => {
    const compiled = compile(earthVenus, realNodeRegistry);
    const ctx = makeCtx(42);
    tick(compiled, 42, ctx);
    const timeOutput = compiled.states.get('time')!.lastOutput;
    expect(timeOutput).toHaveLength(1);
    expect(timeOutput[0].kind).toBe('number');
    expect((timeOutput[0] as { kind: 'number'; v: number }).v).toBe(42);
  });

  test('compile() throws for unknown node type', () => {
    const badGraph: GeoArtGraph = {
      ...earthVenus,
      compute: {
        ...earthVenus.compute,
        nodes: [
          // @ts-expect-error — deliberately unknown type for the test
          { id: 'bogus', type: 'bogusNodeType', params: {} },
        ],
      },
    };
    expect(() => compile(badGraph, realNodeRegistry)).toThrow(/Unknown compute node type/);
  });

  test('compile() throws for ref to unknown node', () => {
    const badGraph: GeoArtGraph = {
      version: '2.0',
      control: { nodes: [] },
      compute: {
        nodes: [
          { id: 'time', type: 'time', params: {} },
          {
            id: 'orbit1',
            type: 'orbit',
            params: {
              time: { ref: 'nonexistent.time' },
            },
          },
        ],
      },
      render: { nodes: [] },
    };
    expect(() => compile(badGraph, realNodeRegistry)).toThrow(/unknown source node/i);
  });

  test('compile() throws for ref to unknown port', () => {
    const badGraph: GeoArtGraph = {
      version: '2.0',
      control: { nodes: [] },
      compute: {
        nodes: [
          { id: 'time', type: 'time', params: {} },
          {
            id: 'orbit1',
            type: 'orbit',
            params: {
              time: { ref: 'time.badPortName' },
            },
          },
        ],
      },
      render: { nodes: [] },
    };
    expect(() => compile(badGraph, realNodeRegistry)).toThrow(/no output port named/i);
  });






  describe("positional normalising does not occur within the graph compilation and evaluation", () => {



    // The orbit node will initially have a position of 1,0.5
    const computeNodes = [
      {
        id: 'time',
        type: 'time',
        params: {},
      },
      {
        id: 'orbitNode',
        type: 'orbit',
        params: {
          time: { ref: 'time.time' },
          center: { v: { x: 0.5, y: 0.5 } },
          radius: { v: 0.5 },
          speed: { v: 0.5 },
        },
      },
    ] satisfies GeoArtGraph['compute']['nodes'];



    test.each<{
      scenarioName: string,
      computeNodes: GeoArtGraph['compute']['nodes']
      inputs: NodeInputsDeclared<"circle">,
      assertion: (resolvedInputs: NodeInputsResolved<"circle">) => void;
    }>([
      {
        scenarioName: "(legacy) - center static value",
        computeNodes: [],
        inputs: {
          center: { v: { x: 0.5, y: 0.5 } },

        },
        assertion: (resolvedInputs) => {
          expect(resolvedInputs.center.x).toBe(0.5);
          expect(resolvedInputs.center.y).toBe(0.5);
        }
      },
      {
        scenarioName: "centerPoints static value",
        computeNodes: [],
        inputs: {
          centerPoints: {
            v: [
              { v: fColorPoint({ x: 0.5, y: 0.5 }) }
            ]
          },

        },
        assertion: (resolvedInputs) => {
          expect(resolvedInputs.centerPoints[0].x).toBe(0.5);
          expect(resolvedInputs.centerPoints[0].y).toBe(0.5);
        }
      },
      {
        scenarioName: "(legacy) - center referenced value",
        computeNodes: computeNodes,
        inputs: {
          center: { ref: "orbitNode.point" },

        },
        assertion: (resolvedInputs) => {
          expect(resolvedInputs.center.x).toBe(1);
          expect(resolvedInputs.center.y).toBe(0.5);
        }
      },
      {
        scenarioName: "centerPoints referenced value",
        computeNodes: computeNodes,
        inputs: {
          centerPoints: { ref: "orbitNode.points" },
        },
        assertion: (resolvedInputs) => {
          expect(resolvedInputs.centerPoints[0].x).toBe(1);
          expect(resolvedInputs.centerPoints[0].y).toBe(0.5);
        }
      },

    ])('$scenarioName', (testInputs) => {
      const mockFn = mock();

      // Create a custom circle node implementation with the mock
      const mockCircleDef = implementRenderNode("circle", {
        "defaults": {
          center: { x: 0, y: 0 },
          color: { r: 0, g: 0, b: 0, a: 0 },
          "intervalTicks": 1,
          "radius": 0.5,
          "centerPoints": [],
          eccentricity: 0,
          tilt: 0
        },
        evaluate: (inputs) => {
          mockFn(inputs)
        }




      });

      const legacyCircleDef = convertRenderNodeImplementationToLegacy(mockCircleDef)

      // Create a custom registry with the mocked circle node
      const customRegistry: LegacyNodeRegistry = {
        computeRegistry: realNodeRegistry.computeRegistry,
        renderRegistry: new Map([['circle', legacyCircleDef]]),
        controlRegistry: realNodeRegistry.controlRegistry,
        moduleRegistry: realNodeRegistry.moduleRegistry,
      };


      const graphWithCircle: GeoArtGraph = {
        version: '2.0',
        control: { nodes: [] },
        compute: { nodes: testInputs.computeNodes },
        render: {
          nodes: [
            {
              id: 'testCircle',
              type: 'circle',
              renderConfig: { layer: 'paint' },
              params: {
                intervalTicks: { v: 1 },
                radius: { v: 0.02 },
                color: { v: { r: 1, g: 1, b: 1, a: 1 } },
                ...testInputs.inputs
              },
            },
          ],
        },
      };

      // Compile the graph with the custom registry
      const compiled = compile(graphWithCircle, customRegistry);

      // Create a context and evaluate one tick
      const ctx = makeCtx(0);
      tick(compiled, 0, ctx);

      // Assert that the mock was called with the correct center position (not normalized)
      expect(mockFn).toHaveBeenCalledTimes(1)
      const callArgs = mockFn.mock.calls[0];
      const inputs = callArgs[0];
      testInputs.assertion(inputs)
    })




    test("numberValueArray also behaves", () => {

      const mockFn = mock();

      const mockLinesThroughPoint = implementRenderNode("linesThroughPoint", {
        "defaults": {
          "degrees": [],
          "lineLength": 1,
          "points": []

        },
        evaluate: (inputs) => {
          mockFn(inputs)
        }




      });

      const legacyCircleDef = convertRenderNodeImplementationToLegacy(mockLinesThroughPoint)

      // Create a custom registry with the mocked circle node
      const customRegistry: LegacyNodeRegistry = {
        computeRegistry: realNodeRegistry.computeRegistry,
        renderRegistry: new Map([['linesThroughPoint', legacyCircleDef]]),
        controlRegistry: realNodeRegistry.controlRegistry,
        moduleRegistry: realNodeRegistry.moduleRegistry,
      };


      const graphWithLinesThroughAPoint: GeoArtGraph = {
        version: '2.0',
        control: { nodes: [] },
        compute: { nodes: [] },
        render: {
          nodes: [
            {
              id: 'linesThroughPoint',
              type: 'linesThroughPoint',
              renderConfig: { layer: 'paint' },
              params: {
                degrees: { v: [{ v: 9 }, { v: 2 }] }
              },
            },
          ],
        },
      };

      // Compile the graph with the custom registry
      const compiled = compile(graphWithLinesThroughAPoint, customRegistry);

      // Create a context and evaluate one tick
      const ctx = makeCtx(0);
      tick(compiled, 0, ctx);

      // Assert that the mock was called with the correct center position (not normalized)
      expect(mockFn).toHaveBeenCalledTimes(1)
      const callArgs = mockFn.mock.calls[0];
      const inputs = callArgs[0] as NodeInputsResolved<"linesThroughPoint">;
      expect(inputs.degrees).toEqual([9, 2]);
    })


  })



  describe("regular control nodes update their downstream correctly", () => {




    function prepareGraphEngine() {
      const captureControlSet = { fn: null } as {
        fn: ControlSetter<"slider"> | null
      }

      const captureModuleSet = { fn: null } as {
        fn: ModuleControlSetter<"orbit-module"> | null
      }


      const controlFn = mock();
      const computeFn = mock();
      const renderFn = mock();



      // Note that we are mutating the module export here, so these changes _will_ carry over to other tests
      realNodeRegistry.controlRegistry.set('slider', convertControlNodeImplementationToLegacy(implementControlNode("slider", {
        defaults: {
          label: '',
          min: 0,
          max: 1,
          value: 0,
          step: 0.01,
        },
        renderControl: (node, set) => {


          controlFn(node);
          captureControlSet.fn = set;
        }


      })))

      realNodeRegistry.computeRegistry.set("add", convertComputeNodeImplementationToLegacy(implementComputeNode("add", {
        defaults: {
          a: 0,
          b: 0,
        },
        evaluate: (inputs) => {

          computeFn(inputs)
          return { sum: inputs.a + inputs.b }
        }
      })))


      realNodeRegistry.renderRegistry.set("circle", convertRenderNodeImplementationToLegacy(implementRenderNode("circle", {
        "defaults": {
          intervalTicks: 0,
          center: { x: 0, y: 0 },
          radius: 0.02,
          eccentricity: 0,
          tilt: 0,
          color: { r: 1, g: 1, b: 1, a: 1 },
          centerPoints: []
        },

        evaluate: (inputs, _ctx) => {
          renderFn(inputs);
        }
      })))


      /**
       * This is obviously not great. 
       * I think it probably demonstrates that a lot of this logic can be captured in the 'implementModule' function. 
       * 
       * But I think this test will serve its purpose as we do the refactor
       */
      realNodeRegistry.moduleRegistry.set("orbit", implementModule({
        "_kind": "orbit-module",
        defaultValues: {
          speed: 0.3,

          "centerPoints": [fColorPoint()],
          "eccentricity": 0,
          "tilt": 0,
          "phase": 0,
          numPoints: 1,
          time: 0,
          "radius": 0.5,


        },
        provideNodes: (params, moduleId, defaultValues) => {
          const controlNodes: ModuleExpansionResult<"orbit-module">['controlNodes'] = [];
          const computeNodes: ModuleExpansionResult<"orbit-module">['computeNodes'] = [];
          const renderNodes: ModuleExpansionResult<"orbit-module">['renderNodes'] = [];

          const inputMarkerId = createInternalId(moduleId, 'input-marker')
          const result: ModuleExpansionResult<"orbit-module"> = {
            controlNodes,
            computeNodes,
            renderNodes,
            inputMarkerNode: {
              id: inputMarkerId,
              type: "module-input-marker",
              params: createInputMarkerParams(params, defaultValues),
              renderControl: (params, set) => {
                captureModuleSet.fn = set;
              },
            },
            defaultValues,
            outputMarkerNode: {
              id: moduleId,
              type: 'module-output-marker',
              params: {},
              outputRefs: {
                points: {
                  "ref": `${inputMarkerId}.centerPoints`
                }
              },
              nodeSource: {
                sourceType: 'module',
                sourceId: moduleId,
              },
            },
          };

          return result;


        }
      }))

      const paintContext = createFakeContext();
      const liveContext = createFakeContext();

      const graphEngine = createGraphEngine(liveContext, paintContext, 100, realNodeRegistry)

      return {
        captureControlSet, captureModuleSet, controlFn, computeFn, renderFn, graphEngine
      }

    }




    it("Scenario 1 - slider->add->render(live)", () => {

      const { captureControlSet: captureSet, controlFn, computeFn, renderFn, graphEngine
      } = prepareGraphEngine()

      const result = graphEngine.load(new AlgorithmBuilder().addControlNode({
        "type": "slider",
        id: "my-slider",
        params: {
          "value": {
            v: 1
          }
        }
      }).addComputeNode({
        type: "add",
        id: "my-add",
        params: {
          a: {
            ref: "my-slider.value",

          },
          b: {
            v: 1
          }
        }
      }).addRenderNode({
        "id": "my-circle",
        type: "circle",
        params: {
          "radius": {
            ref: "my-add.sum"
          }
        },
        "renderConfig": {
          "layer": "live"
        }
      }).construct()

      )


      expect(captureSet.fn).toBeNull()

      expect(controlFn).not.toHaveBeenCalled()
      result.renderControlNodes();

      expect(captureSet.fn).not.toBeNull()

      expect(controlFn).toHaveBeenCalledTimes(1)
      expect(controlFn).toHaveBeenLastCalledWith(expect.objectContaining({
        params: expect.objectContaining({

          //ew 🗑️
          min: 0,
          value: expect.objectContaining({
            v: 1,
          })
        })
      }))
      expect(computeFn).not.toHaveBeenCalled();
      expect(renderFn).not.toHaveBeenCalled();

      graphEngine.tick();

      expect(controlFn).toHaveBeenCalledTimes(1)
      expect(computeFn).toHaveBeenCalledTimes(1);
      expect(computeFn).toHaveBeenLastCalledWith(expect.objectContaining({
        // This is much better looking
        a: 1,
        b: 1
      }))
      expect(renderFn).toHaveBeenCalledTimes(1);
      expect(renderFn).toHaveBeenLastCalledWith(expect.objectContaining({
        radius: 2,
      }))
      graphEngine.tick();

      // In this scenario the compute  node isn't recalled because it's not attached to anything changing  
      expect(controlFn).toHaveBeenCalledTimes(1)
      expect(computeFn).toHaveBeenCalledTimes(1);

      // The render node does, because it's attached to the live layer
      expect(renderFn).toHaveBeenCalledTimes(2);

      captureSet.fn!("value", { "v": 2 })

      graphEngine.tick()

      // Compute node fires because its inputs have changed
      expect(controlFn).toHaveBeenCalledTimes(1)
      expect(computeFn).toHaveBeenLastCalledWith(expect.objectContaining({
        a: 2,
        b: 1
      }))
      expect(computeFn).toHaveBeenCalledTimes(2);
      expect(renderFn).toHaveBeenCalledTimes(3);
      expect(renderFn).toHaveBeenLastCalledWith(expect.objectContaining({
        radius: 3,
      }))
    });


    it("Scenario 2 - slider+time->add->render(live)", () => {

      const { captureControlSet: captureSet, controlFn, computeFn, renderFn, graphEngine
      } = prepareGraphEngine()

      const result = graphEngine.load(new AlgorithmBuilder().addControlNode({
        "type": "slider",
        id: "my-slider",
        params: {
          "value": {
            v: 1
          }
        }
      })
        .addComputeNode({
          type: "time",
          id: "time",
          params: {}
        })
        .addComputeNode({
          type: "add",
          id: "my-add",
          params: {
            a: {
              ref: "my-slider.value",

            },
            b: {
              ref: "time.time"
            }
          }
        })
        .addRenderNode({
          "id": "my-circle",
          type: "circle",
          params: {
            "radius": {
              ref: "my-add.sum"
            }
          },
          "renderConfig": {
            "layer": "live"
          }
        }).construct()

      )


      expect(captureSet.fn).toBeNull()

      expect(controlFn).not.toHaveBeenCalled()
      result.renderControlNodes();

      expect(captureSet.fn).not.toBeNull()

      expect(controlFn).toHaveBeenCalledTimes(1)
      expect(computeFn).not.toHaveBeenCalled();
      expect(renderFn).not.toHaveBeenCalled();

      graphEngine.tick();

      expect(controlFn).toHaveBeenCalledTimes(1)
      expect(computeFn).toHaveBeenCalledTimes(1);
      expect(renderFn).toHaveBeenCalledTimes(1);

      graphEngine.tick();

      // In this scenario the compute changes because it has a time node that always changes
      expect(controlFn).toHaveBeenCalledTimes(1)
      expect(computeFn).toHaveBeenCalledTimes(2);

      expect(renderFn).toHaveBeenCalledTimes(2);

      captureSet.fn!("value", { "v": 2 })

      graphEngine.tick()

      // Compute node fires because its inputs have changed
      expect(controlFn).toHaveBeenCalledTimes(1)
      expect(computeFn).toHaveBeenCalledTimes(3);
      expect(renderFn).toHaveBeenCalledTimes(3);
    });


    it("Scenario 3 - slider->add-render(paint)", () => {

      const { captureControlSet: captureSet, controlFn, computeFn, renderFn, graphEngine
      } = prepareGraphEngine()

      const result = graphEngine.load(new AlgorithmBuilder().addControlNode({
        "type": "slider",
        id: "my-slider",
        params: {
          "value": {
            v: 1
          }
        }
      })

        .addComputeNode({
          type: "add",
          id: "my-add",
          params: {
            a: {
              ref: "my-slider.value",

            },
            b: {
              v: 1
            }
          }
        })
        .addRenderNode({
          "id": "my-circle",
          type: "circle",
          params: {
            "radius": {
              ref: "my-add.sum"
            }
          },
          "renderConfig": {
            "layer": "paint"
          }
        }).construct()

      )


      expect(captureSet.fn).toBeNull()

      expect(controlFn).not.toHaveBeenCalled()
      result.renderControlNodes();

      expect(captureSet.fn).not.toBeNull()

      expect(controlFn).toHaveBeenCalledTimes(1)
      expect(computeFn).not.toHaveBeenCalled();
      expect(renderFn).not.toHaveBeenCalled();

      graphEngine.tick();

      expect(controlFn).toHaveBeenCalledTimes(1)
      expect(computeFn).toHaveBeenCalledTimes(1);
      expect(renderFn).toHaveBeenCalledTimes(1);

      graphEngine.tick();

      // In this scenario the render node does not refire, because it's on the paint layer
      expect(controlFn).toHaveBeenCalledTimes(1)
      expect(computeFn).toHaveBeenCalledTimes(1);
      expect(renderFn).toHaveBeenCalledTimes(1);

    });


    it.only("Scenario 4 - module -> render", () => {

      const { captureControlSet, captureModuleSet, controlFn, computeFn, renderFn, graphEngine
      } = prepareGraphEngine()

      const result = graphEngine.load(new AlgorithmBuilder().addModuleNode({
        "id": "my-orbit-module",
        "params": {

        },
        "type": "orbit-module"
      }).addRenderNode({
        "id": "my-circle",
        "type": "circle",
        "renderConfig": {
          "layer": "paint"
        },
        "params": {
          "centerPoints": {
            ref: "my-orbit-module.points"
          }
        }
      }).construct()

      );

      expect(captureControlSet.fn).toBeNull()
      expect(captureModuleSet.fn).toBeNull()
      expect(captureModuleSet.fn)
      expect(controlFn).not.toHaveBeenCalled()
      result.renderControlNodes();


      expect(captureControlSet.fn).toBeNull()
      expect(captureModuleSet.fn).not.toBeNull()


    })

  });






});
