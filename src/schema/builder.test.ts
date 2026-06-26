import { describe, expect, it } from "bun:test";
import { AlgorithmBuilder } from "./builder";
import { validateGeoArtGraph } from "./validateGeoArtGraph";

describe(AlgorithmBuilder, () => {


    describe("happy paths", () => {
        it("Builds a minimal graph", () => {
            const result = new AlgorithmBuilder().construct();
            expect(validateGeoArtGraph(result)).toBe(true)
        })

        it("Adds a control node - all static params", () => {
            const result = new AlgorithmBuilder()
                .addControlNode({
                    id: 'speedSlider',
                    type: 'slider',
                    params: {
                        label: { v: 'Speed' },
                        min: { v: -5 },
                        max: { v: 5 },
                        value: { v: 0.2 },
                        step: { v: 0.01 },
                    },
                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(true)
            expect(result.control.nodes).toHaveLength(1)
            expect(result.control.nodes.some(n => n.id === 'speedSlider')).toBe(true)
        })




        it("Adds a compute node - all static params", () => {
            const result = new AlgorithmBuilder()
                .addComputeNode({
                    id: 'sum',
                    type: 'add',
                    params: {
                        a: { v: 1 },
                        b: { v: 2 },
                    },
                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(true)
            expect(result.compute.nodes).toHaveLength(1)
            expect(result.compute.nodes.some(n => n.id === 'sum')).toBe(true)
        })

        it("Adds a render node - all static params", () => {
            const result = new AlgorithmBuilder()
                .addRenderNode({
                    id: 'dot',
                    type: 'circle',
                    renderConfig: { layer: 'live' },
                    params: {
                        center: { v: { x: 0, y: 0 } },
                        radius: { v: 0.02 },
                        color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
                    },
                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(true)
            expect(result.render.nodes).toHaveLength(1)
            expect(result.render.nodes.some(n => n.id === 'dot')).toBe(true)
        })

        it("Builds a graph with cross-layer refs", () => {
            const result = new AlgorithmBuilder()
                .addControlNode({
                    id: 'radius',
                    type: 'slider',
                    params: {
                        label: { v: 'Radius' },
                        min: { v: 0 },
                        max: { v: 0.5 },
                        step: { v: 0.01 },
                        value: { v: 0.1 },
                    },
                })
                .addComputeNode({
                    id: 'time',
                    type: 'time',
                    params: {},
                })
                .addComputeNode({
                    id: 'earthOrbit',
                    type: 'orbit',
                    params: {
                        time: { ref: 'time.time' },
                        radius: { ref: 'radius.value' },
                        speed: { v: 1 },
                    },
                })
                .addRenderNode({
                    id: 'dot',
                    type: 'circle',
                    renderConfig: { layer: 'live' },
                    params: {
                        radius: { ref: 'radius.value' },
                        centerPoints: { ref: 'earthOrbit.points' },
                    },
                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(true)
            expect(result.control.nodes.some(n => n.id === 'radius')).toBe(true)
            expect(result.compute.nodes.some(n => n.id === 'time')).toBe(true)
            expect(result.compute.nodes.some(n => n.id === 'earthOrbit')).toBe(true)
            expect(result.render.nodes.some(n => n.id === 'dot')).toBe(true)
        })

        it("Includes title, author, and description", () => {
            const result = new AlgorithmBuilder({
                title: 'My Algorithm',
                author: 'Test Author',
                description: 'A test description',
            }).construct();

            expect(validateGeoArtGraph(result)).toBe(true)
            expect(result.title).toBe('My Algorithm')
            expect(result.author).toBe('Test Author')
            expect(result.description).toBe('A test description')
        })

        describe("module nodes", () => {
            it("Module referring to control node", () => {
                const result = new AlgorithmBuilder()
                    .addControlNode({
                        id: 'speed',
                        type: 'slider',
                        params: {
                            label: { v: 'Speed' },
                            min: { v: 0 },
                            max: { v: 5 },
                            value: { v: 1 },
                        },
                    })
                    .addModuleNode({
                        id: 'myModule',
                        type: 'orbit-module',
                        params: {
                            time: { v: 0 },
                            speed: { ref: 'speed.value' },
                            radius: { v: 0.1 },
                            numPoints: { v: 50 },
                        },
                    })
                    .construct();

                expect(validateGeoArtGraph(result)).toBe(true)
                expect(result.module?.nodes).toHaveLength(1)
                expect(result.module?.nodes.some(n => n.id === 'myModule')).toBe(true)
            })

            it("Module referring to module node", () => {
                const result = new AlgorithmBuilder()
                    .addModuleNode({
                        id: 'innerOrbit',
                        type: 'orbit-module',
                        params: {
                            time: { v: 0 },
                            speed: { v: 1 },
                            radius: { v: 0.1 },
                            numPoints: { v: 50 },
                        },
                    })
                    .addModuleNode({
                        id: 'outerOrbit',
                        type: 'orbit-module',
                        params: {
                            time: { v: 0 },
                            speed: { v: 0.5 },
                            radius: { v: 0.2 },
                            numPoints: { v: 30 },
                            centerPoints: { ref: 'innerOrbit.points' },
                        },
                    })
                    .construct();

                expect(validateGeoArtGraph(result)).toBe(true)
                expect(result.module?.nodes).toHaveLength(2)
                expect(result.module?.nodes.some(n => n.id === 'innerOrbit')).toBe(true)
                expect(result.module?.nodes.some(n => n.id === 'outerOrbit')).toBe(true)
            })

            it("Compute node referring to module node", () => {
                const result = new AlgorithmBuilder()
                    .addModuleNode({
                        id: 'myModule',
                        type: 'orbit-module',
                        params: {
                            time: { v: 0 },
                            speed: { v: 1 },
                            radius: { v: 0.1 },
                            numPoints: { v: 50 },
                        },
                    })
                    .addComputeNode({
                        id: 'derived',
                        type: 'orbit',
                        params: {
                            time: { v: 0 },
                            radius: { v: 0.15 },
                            speed: { v: 2 },
                            centerPoints: { ref: 'myModule.points' },
                        },
                    })
                    .construct();

                expect(validateGeoArtGraph(result)).toBe(true)
                expect(result.module?.nodes).toHaveLength(1)
                expect(result.compute.nodes).toHaveLength(1)
                expect(result.compute.nodes.some(n => n.id === 'derived')).toBe(true)
            })

            it("Render node referring to module node", () => {
                const result = new AlgorithmBuilder()
                    .addModuleNode({
                        id: 'myModule',
                        type: 'orbit-module',
                        params: {
                            time: { v: 0 },
                            speed: { v: 1 },
                            radius: { v: 0.1 },
                            numPoints: { v: 50 },
                        },
                    })
                    .addRenderNode({
                        id: 'rendered',
                        type: 'circle',
                        renderConfig: { layer: 'live' },
                        params: {
                            radius: { v: 0.02 },
                            centerPoints: { ref: 'myModule.points' },
                            color: { v: { r: 0.5, g: 0.5, b: 0.5, a: 1 } },
                        },
                    })
                    .construct();

                expect(validateGeoArtGraph(result)).toBe(true)
                expect(result.module?.nodes).toHaveLength(1)
                expect(result.render.nodes).toHaveLength(1)
                expect(result.render.nodes.some(n => n.id === 'rendered')).toBe(true)
            })
        })
    })

    describe("type errors - node type names and param names", () => {
        it("Adds a control node - invalid node type ", () => {
            const result = new AlgorithmBuilder()
                .addControlNode({
                    id: 'speedSlider',
                    //@ts-expect-error - 'abc' is not a valid node type
                    type: 'abc',
                    params: {
                        label: { v: 'Speed' },
                        min: { v: -5 },
                        max: { v: 5 },
                        value: { v: 0.2 },
                        step: { v: 0.01 },
                    },
                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(false)
        })

        it("Adds a control node - invalid node type - mismatching params", () => {
            const result = new AlgorithmBuilder()
                .addControlNode({
                    id: 'speedSlider',
                    type: 'slider',
                    params: {
                        // @ts-expect-error - mismatching params
                        labasdael: { v: 'Speed' },

                    },
                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(false)
        })

        it("Adds a compute node - invalid node type ", () => {
            const result = new AlgorithmBuilder()
                .addComputeNode({
                    id: 'addNode',
                    //@ts-expect-error - 'abc' is not a valid node type
                    type: 'abc',
                    params: {
                        a: { v: 1 },
                        b: { v: 2 },
                    },
                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(false)
        })

        it("Adds a render node - invalid node type", () => {
            const result = new AlgorithmBuilder()
                .addRenderNode({
                    id: 'dot',
                    //@ts-expect-error - 'abc' is not a valid node type
                    type: 'abc',
                    renderConfig: { layer: 'live' },
                    params: {
                        center: { v: { x: 0, y: 0 } },
                        radius: { v: 0.02 },
                        color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
                    },
                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(false)
        })

        it("Adds a render node - mismatching params", () => {
            const result = new AlgorithmBuilder()
                .addRenderNode({
                    id: 'dot',
                    type: 'circle',
                    renderConfig: { layer: 'live' },
                    params: {
                        //@ts-expect-error - 'aaaa' is not a valid param for circle node
                        aaaa: { v: 0 },
                    },
                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(false)
        })

        it("Adds a compute node - mismatching params ", () => {
            const result = new AlgorithmBuilder()
                .addComputeNode({
                    id: 'addNode',
                    type: 'add',
                    params: {
                        //@ts-expect-error -- 'aaaa' is not a valid param for add node
                        aaaa: { v: 1 },
                        b: { v: 2 },
                    },
                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(false)
        })

        it("Adds a module node - invalid node type", () => {
            const result = new AlgorithmBuilder()
                .addModuleNode({
                    id: 'myModule',
                    //@ts-expect-error - 'invalid-module' is not a valid module node type
                    type: 'invalid-module',
                    params: {
                        phase: { v: 0 },
                    },
                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(false)
        })

        it("Adds a module node - invalid param name", () => {
            const result = new AlgorithmBuilder()
                .addModuleNode({
                    id: 'myModule',
                    type: 'orbit-module',
                    params: {
                        time: { v: 0 },
                        speed: { v: 1 },
                        radius: { v: 0.1 },
                        numPoints: { v: 50 },
                        //@ts-expect-error - 'invalidParam' is not a valid param for orbit-module
                        invalidParam: { v: 99 },
                    },
                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(false)
        })
    });


    describe("type errors - references", () => {
        it("Builds a graph with cross-layer refs", () => {
            const result = new AlgorithmBuilder()
                .addControlNode({
                    id: 'radius',
                    type: 'slider',
                    params: {

                    },
                })

                // valid 
                .addComputeNode({
                    id: 'earthOrbit1',
                    type: 'orbit',
                    params: {
                        radius: { ref: 'radius.value' },
                        speed: { v: 1 },
                    },
                })
                .addComputeNode({
                    id: 'earthOrbit2',
                    type: 'orbit',
                    params: {
                        //@ts-expect-error xyz is not a valid previous node name
                        radius: { ref: 'xyz.value' },
                        speed: { v: 1 },
                    },
                })
                .addComputeNode({
                    id: 'earthOrbit3',
                    type: 'orbit',
                    params: {
                        //@ts-expect-error zzz is not a valid param value
                        radius: { ref: 'radius.zzz' },
                        speed: { v: 1 },
                    },
                })
                .addComputeNode({
                    id: 'earthOrbit4',
                    type: 'orbit',
                    params: {
                        // This is valid!
                        centerPoints: { ref: "earthOrbit1.points" },


                        // @ts-expect-error - mismatched types
                        radius: { ref: "earthOrbit1.points" },

                        speed: { v: 1 },
                    },
                })
                .addComputeNode({
                    id: 'earthOrbit5',
                    type: 'orbit',
                    params: {


                        // Typings are failing here 
                        centerPoints: {
                            v: [
                                {
                                    "ref": "earthOrbit1.point"
                                }
                            ]
                        },




                        speed: { v: 1 },
                    },
                })


                .construct();


            // Note it's still a valid graph - this is because the AJV json schema validation is 
            // looser than what typescript is giving us
            // This graph _would_ fail compile time validation
            expect(validateGeoArtGraph(result)).toBe(true)

        })

        it("Static array of value references works", () => {
            const result = new AlgorithmBuilder()
                .addControlNode({
                    id: 'radius',
                    type: 'slider',
                    params: {

                    },
                })

                .addComputeNode({
                    "id": "cp1",
                    "type": "colorPointCompute",
                    params: {},
                })
                .addComputeNode({
                    "id": "cp2",
                    "type": "colorPointCompute",
                    params: {},
                })
                // Static array of static values
                .addComputeNode({
                    id: 'earthOrbit1',
                    type: 'orbit',
                    params: {
                        centerPoints: {
                            v: [
                                {
                                    v: {
                                        "r": 1,
                                        'g': 1,
                                        'b': 1,
                                        'a': 1,
                                        'dx': 0,
                                        'dy': 0,
                                        'x': 0,
                                        y: 0
                                    }
                                }
                            ]
                        },
                        speed: { v: 1 },
                    },
                })


                .addRenderNode({
                    id: 'circle',
                    type: 'circle',
                    renderConfig: { layer: 'live' },
                    params: {
                        center: {
                            // valid here 
                            ref: "earthOrbit1.point"
                        },
                        centerPoints: {
                            v: [
                                {
                                    v: { x: 0.2, y: 0.2, dx: 0, dy: 0, r: 1, g: 0, b: 0, a: 1 },
                                },
                                {
                                    // should also be valid here 
                                    ref: 'earthOrbit1.point',
                                },
                                {
                                    //@ts-expect-error - garbage shouldn't be valid
                                    ref: 'asdsad.point',
                                },
                                {
                                    //@ts-expect-error - garbage shouldn't be valid
                                    ref: 'earthOrbit1.asdasd',
                                },
                                {
                                    v: { x: 0.8, y: 0.2, dx: 0, dy: 0, r: 0, g: 0, b: 1, a: 1 },
                                },
                            ],
                        },
                        radius: { v: 0.02 },
                    },
                },)


                .construct();


            // Note it's still a valid graph - this is because the AJV json schema validation is
            // looser than what typescript is giving us
            // This graph _would_ fail compile time validation
            expect(validateGeoArtGraph(result)).toBe(true)

        })

        it("Module node with invalid ref to control node", () => {
            const result = new AlgorithmBuilder()
                .addControlNode({
                    id: 'speed',
                    type: 'slider',
                    params: {
                        label: { v: 'Speed' },
                        min: { v: 0 },
                        max: { v: 5 },
                        value: { v: 1 },
                    },
                })
                .addModuleNode({
                    id: 'myModule',
                    type: 'orbit-module',
                    params: {
                        time: { v: 0 },
                        //@ts-expect-error - 'unknownControl.value' is not a valid ref
                        speed: { ref: 'unknownControl.value' },
                        radius: { v: 0.1 },
                        numPoints: { v: 50 },
                    },
                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(true)
        })

        it("Module node with invalid ref to module output port", () => {
            const result = new AlgorithmBuilder()
                .addModuleNode({
                    id: 'innerModule',
                    type: 'orbit-module',
                    params: {
                        time: { v: 0 },
                        speed: { v: 1 },
                        radius: { v: 0.1 },
                        numPoints: { v: 50 },
                    },
                })
                .addModuleNode({
                    id: 'outerModule',
                    type: 'orbit-module',
                    params: {
                        time: { v: 0 },
                        speed: { v: 1 },
                        radius: { v: 0.1 },
                        numPoints: { v: 50 },
                        //@ts-expect-error - 'innerModule.invalidPort' is not a valid port
                        centerPoints: { ref: 'innerModule.invalidPort' },
                    },
                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(true)
        })

        it("Compute node with type-mismatched ref from module node", () => {
            const result = new AlgorithmBuilder()
                .addModuleNode({
                    id: 'myModule',
                    type: 'orbit-module',
                    params: {
                        time: { v: 0 },
                        speed: { v: 1 },
                        radius: { v: 0.1 },
                        numPoints: { v: 50 },
                    },
                })
                .addComputeNode({
                    id: 'derived',
                    type: 'orbit',
                    params: {
                        time: { v: 0 },
                        speed: { v: 2 },
                        //@ts-expect-error - myModule.points outputs colorPointArrayValue, not numberValue
                        radius: { ref: 'myModule.points' },
                    },
                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(true)
        })

    });


    describe("ordering tests", () => {

        it("correct order is control, compute, render", () => {
            const result = new AlgorithmBuilder()


                .addControlNode({
                    id: 'speedSlider',
                    type: 'slider',
                    params: {

                    },
                })
                .addComputeNode({
                    id: 'add',
                    type: 'add',
                    params: {

                    },
                })
                .addRenderNode({
                    id: "dot",
                    "type": "circle",
                    params: {},
                    renderConfig: { layer: 'live' },

                })
                .construct();

            expect(validateGeoArtGraph(result)).toBe(true)

        })

        it("Adding compute node before control node shows a type error", () => {
            const result = new AlgorithmBuilder()
                .addComputeNode({
                    id: 'add',
                    type: 'add',
                    params: {

                    },
                })

                //@ts-expect-error - out of order 
                .addControlNode({
                    id: 'speedSlider',
                    type: 'slider',
                    params: {

                    },
                })
                .addRenderNode({
                    id: "dot",
                    "type": "circle",
                    params: {},
                    renderConfig: { layer: 'live' },

                })
                .addRenderNode({
                    id: "dot",
                    "type": "circle",
                    params: {},
                    renderConfig: { layer: 'live' },

                })
                .construct();


            //however, graph is still valid
            // But note that we've lost typings at this point
            expect(validateGeoArtGraph(result)).toBe(true)



        })

        it("Adding render node before compute node shows a type error", () => {
            const result = new AlgorithmBuilder()

                .addRenderNode({
                    id: "dot",
                    "type": "circle",
                    params: {},
                    renderConfig: { layer: 'live' },

                })
                //@ts-expect-error - out of order
                .addComputeNode({
                    id: 'add',
                    type: 'add',
                    params: {

                    },
                })

                .addControlNode({
                    id: 'speedSlider',
                    type: 'slider',
                    params: {

                    },
                })
                .construct();

            //however, graph is still valid
            // But note that we've lost typings at this point
            expect(validateGeoArtGraph(result)).toBe(true)
        })

        it("Adding module and control nodes after compute shows a type error", () => {
            const result = new AlgorithmBuilder()
                .addComputeNode({
                    id: 'add',
                    type: 'add',
                    params: {},
                })
                .addModuleNode({
                    id: 'myModule',
                    type: 'orbit-module',
                    params: {
                        time: { v: 0 },
                        speed: { v: 1 },
                        radius: { v: 0.1 },
                        numPoints: { v: 50 },
                    },
                })
                //@ts-expect-error - out of order
                .addControlNode({
                    id: 'speedSlider',
                    type: 'slider',
                    params: {},
                })
                .construct();

            // graph is still valid despite type errors
            // But we've lost typings at this point
            expect(validateGeoArtGraph(result)).toBe(true)
        })
    })


});
