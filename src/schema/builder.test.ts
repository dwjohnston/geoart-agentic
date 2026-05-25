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
    })

    describe("type errors", () => {
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




    })


});
