import { describe, expect, test, mock } from 'bun:test';
import type { GeoArtGraph } from '../../schema/_generated/schema-types';
import { createGraphEngine } from './graphEngine';
import { createFakeContext } from '../../common-tooling/test-tooling/fakeContext';
import {
    realNodeRegistry,
    implementRenderNode,
    convertRenderNodeImplementationToLegacy,
    convertComputeNodeImplementationToLegacy,
    implementComputeNode,
    convertControlNodeImplementationToLegacy,
    implementControlNode,
} from '../exports';
import type { LegacyNodeRegistry } from '../exports';


describe("graph engine - unnecessary node evaluation", () => {
    test("nodes only reevaluate if something has actually changed", () => {
        const mockChangingRender = mock();
        const mockUnchangingRender = mock();
        const mockUnchangingControl = mock();
        const mockUnchangingCompute = mock();

        const mockChangingCircleDef = implementRenderNode('circle', {
            defaults: {
                center: { x: 0, y: 0 },
                color: { r: 0, g: 0, b: 0, a: 0 },
                intervalTicks: 1,
                radius: 0.5,
                centerPoints: [],
                eccentricity: 0,
                tilt: 0
            },
            evaluate: () => {
                mockChangingRender();
            },
        });

        const mockUnchangingPolygonDef = implementRenderNode('polygon', {
            defaults: {
                points: [],
            },
            evaluate: () => {
                mockUnchangingRender();
            },
        });

        const legacyCircleDef = convertRenderNodeImplementationToLegacy(mockChangingCircleDef);
        const legacyPolygonDef = convertRenderNodeImplementationToLegacy(mockUnchangingPolygonDef);

        const renderRegistry = new Map(realNodeRegistry.renderRegistry);
        renderRegistry.set('circle', legacyCircleDef);
        renderRegistry.set('polygon', legacyPolygonDef);

        const computeRegistry = new Map(realNodeRegistry.computeRegistry);
        computeRegistry.set("add", convertComputeNodeImplementationToLegacy(implementComputeNode("add", {
            isTimeDependant: false,
            "defaults": {
                a: 0,
                b: 0,
            },
            evaluate: (inputs) => {
                mockUnchangingCompute(inputs);
                return {
                    sum: 0
                }
            }
        })))

        const controlRegistry = new Map(realNodeRegistry.controlRegistry);

        controlRegistry.set("slider", convertControlNodeImplementationToLegacy(implementControlNode("slider", {
            "defaults": {
                min: 0,
                max: 0,
                label: '',
                step: 0,
                value: 0
            },
            renderControl: (inputs) => {
                mockUnchangingControl(inputs);
                return null;
            }
        })))

        const customRegistry: LegacyNodeRegistry = {
            computeRegistry: computeRegistry,
            renderRegistry: renderRegistry,
            controlRegistry: controlRegistry,
        };

        const graph: GeoArtGraph = {
            version: '2.0',
            control: {
                nodes: [
                    {
                        id: 'slider1',
                        type: 'slider',
                        params: {
                            min: { v: 0 },
                            max: { v: 1 },
                            value: { v: 0.5 },
                        },
                    },
                ],
            },
            compute: {
                nodes: [
                    {
                        id: "time",
                        type: "time",
                        params: {}
                    },
                    {
                        id: "staticAdd",
                        type: "add",
                        params: {
                            a: { v: 5 },
                            b: { v: 10 },
                        }
                    }
                ]
            },
            render: {
                nodes: [
                    {
                        id: 'changingCircle',
                        type: 'circle',
                        renderConfig: { layer: 'paint' },
                        params: {
                            intervalTicks: { v: 1 },
                            radius: { ref: "time.time" },
                            centerPoints: { v: [{ v: { x: 1, y: 1, dx: 0, dy: 0, r: 1, g: 1, b: 1, a: 1 } }] },
                        },
                    },
                    {
                        id: 'unchangingPolygon',
                        type: 'polygon',
                        renderConfig: { layer: 'paint' },
                        params: {
                            points: { v: [{ v: { x: 0, y: 0, dx: 0, dy: 0, r: 1, g: 1, b: 1, a: 1 } }, { v: { x: 1, y: 0, dx: 0, dy: 0, r: 1, g: 1, b: 1, a: 1 } }, { v: { x: 0.5, y: 1, dx: 0, dy: 0, r: 1, g: 1, b: 1, a: 1 } }] },
                        },
                    },

                ],
            },
        };

        const orbitCtx = createFakeContext();
        const trailCtx = createFakeContext();
        const engine = createGraphEngine(orbitCtx, trailCtx, 800, customRegistry);

        engine.load(graph);
        engine.tick();

        expect(mockChangingRender).toHaveBeenCalledTimes(1);
        expect(mockUnchangingControl).toHaveBeenCalledTimes(0);
        expect(mockUnchangingCompute).toHaveBeenCalledTimes(1);
        expect(mockUnchangingRender).toHaveBeenCalledTimes(1);

        engine.tick();
        expect(mockChangingRender).toHaveBeenCalledTimes(2);
        expect(mockUnchangingControl).toHaveBeenCalledTimes(0);
        expect(mockUnchangingCompute).toHaveBeenCalledTimes(1);
        expect(mockUnchangingRender).toHaveBeenCalledTimes(1);


        engine.tick();
        expect(mockChangingRender).toHaveBeenCalledTimes(3);
        expect(mockUnchangingControl).toHaveBeenCalledTimes(0);
        expect(mockUnchangingCompute).toHaveBeenCalledTimes(1);
        expect(mockUnchangingRender).toHaveBeenCalledTimes(1);
    })
})

describe('graph engine — render node toggling', () => {
    test('render node will only be called if toggled on', () => {
        const mockFn = mock();

        const mockCircleDef = implementRenderNode('circle', {
            defaults: {
                center: { x: 0, y: 0 },
                color: { r: 0, g: 0, b: 0, a: 0 },
                intervalTicks: 1,
                radius: 0.5,
                centerPoints: [],
                eccentricity: 0,
                tilt: 0
            },
            evaluate: () => {
                mockFn();
            },
        });

        const legacyCircleDef = convertRenderNodeImplementationToLegacy(mockCircleDef);

        const customRegistry: LegacyNodeRegistry = {
            computeRegistry: realNodeRegistry.computeRegistry,
            renderRegistry: new Map([['circle', legacyCircleDef]]),
            controlRegistry: realNodeRegistry.controlRegistry,
        };

        const graph: GeoArtGraph = {
            version: '2.0',
            control: { nodes: [] },
            compute: {
                nodes: [
                    {
                        id: "time",

                        type: "time",
                        params: {}
                    }
                ]
            },
            render: {
                nodes: [
                    {
                        id: 'testCircle',
                        type: 'circle',
                        renderConfig: { layer: 'paint' },
                        params: {

                            intervalTicks: { v: 1 },
                            radius: { ref: "time.time" },
                            centerPoints: { v: [{ v: { x: 1, y: 1, dx: 0, dy: 0, r: 1, g: 1, b: 1, a: 1 } }] },
                        },
                    },
                ],
            },
        };

        const orbitCtx = createFakeContext();
        const trailCtx = createFakeContext();
        const engine = createGraphEngine(orbitCtx, trailCtx, 800, customRegistry);

        engine.load(graph);
        engine.tick();

        expect(mockFn).toHaveBeenCalledTimes(1);
        engine.tick();
        expect(mockFn).toHaveBeenCalledTimes(2);
        engine.toggleRenderNode('testCircle');
        engine.tick();
        expect(mockFn).toHaveBeenCalledTimes(2);


    });



});
