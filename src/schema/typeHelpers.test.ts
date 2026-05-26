import { describe, it, expect } from 'bun:test';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertType<T>(_value: T) { }
import { type ComputeNodeKinds, type ControlNodeKinds, type RenderNodeKinds, type ValueTypeByName, type NodeInputsResolved, type NodeOutputsResolved, type ResolvedValue, type ReferencedValueDeclared, type StaticValueDeclared, type ValueDeclared, type NodeInputsDeclared, type PortReferenceForNodeType } from './typeHelpers';
import type { GeoArtGraph } from './_generated/schema-types';
import { fColorPoint } from '../constants';



describe("ControlNodeKinds, ComputeNodeKinds, RenderNodeKinds", () => {
    it("are correctly typed", () => {

        assertType<ControlNodeKinds>("slider");

        //@ts-expect-error - mismatching types
        assertType<ControlNodeKinds>("foo");



        assertType<ComputeNodeKinds>("add");
        //@ts-expect-error - mismatching types
        assertType<ComputeNodeKinds>("slider");

        assertType<RenderNodeKinds>("circle");
        //@ts-expect-error - mismatching types
        assertType<RenderNodeKinds>("add");
    });
})

describe("ValueTypeByName", () => {


    it("only accepts full suffixed values", () => {


        type X = ValueTypeByName<"numberValue">;
        //@ts-expect-error - needs to be one of the full types
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type T = ValueTypeByName<"X">


        const x = { v: 9 } satisfies X;
        expect(x.v).toBe(9)

    })
    it("maps 'numberValue' to { v: number } without kind", () => {
        assertType<ValueTypeByName<"numberValue">>({ v: 1 });


        //@ts-expect-error - wrong v type
        assertType<ValueTypeByName<"numberValue">>({ v: "foo" });

        //@ts-expect-error - kind is not part of the type
        assertType<ValueTypeByName<"numberValue">>({ kind: 'number', v: 1 });
    });


    it("waveTypes", () => {
        assertType<ValueTypeByName<"waveTypeEnumValue">>({ "v": "saw" })

        //@ts-expect-error - not matching the enum
        assertType<ValueTypeByName<"waveTypeEnumValue">>({ "v": "sdfds" })

    })
});


describe('ResolvedValue', () => {
    it("has just the shorthand value representation", () => {
        assertType<ResolvedValue<"waveTypeEnumValue">>("reverse-saw")

        //@ts-expect-error - mis matching type
        assertType<ResolvedValue<"waveTypeEnumValue">>("sfdsfd")


        assertType<ResolvedValue<"numberValue">>(1);


        assertType<ResolvedValue<"stringArrayValue">>(["1", "2"]);




    })
})

describe("NodeInputsRecord", () => {
    it("maps 'add' inputs to named ports without kind", () => {
        assertType<NodeInputsResolved<"add">>({ a: 1, b: 2 });

        //@ts-expect-error - wrong key name
        assertType<NodeInputsResolved<"add">>({ x: 1, b: 2 });

        //@ts-expect-error - wrong v type on port a
        assertType<NodeInputsResolved<"add">>({ a: "foo", b: 0 });
    });

    assertType<NodeInputsResolved<"pointsOnALine">>({
        "pointA": {

            r: 1,
            g: 1,
            b: 1,
            a: 1,
            x: 1,
            y: 1,
            dx: 0,
            dy: 0,

        },

        "pointB": {
            r: 1,
            g: 1,
            b: 1,
            a: 1,
            x: 1,
            y: 1,
            dx: 0,
            dy: 0,




        },
        "numberOfPoints": 1,

    })
});

describe("NodeOutputsRecord", () => {
    it("maps 'add' outputs to named ports with raw .v types", () => {
        assertType<NodeOutputsResolved<"add">>({ sum: 42 });

        //@ts-expect-error - wrong key name
        assertType<NodeOutputsResolved<"add">>({ value: 42 });

        //@ts-expect-error - wrong value type (string instead of number)
        assertType<NodeOutputsResolved<"add">>({ sum: "42" });
    });

    it("maps multi-output node 'orbit' to both port names", () => {
        assertType<NodeOutputsResolved<"orbit">>({
            point: { x: 0, y: 0 },
            points: [],
        });

        //@ts-expect-error - missing 'points' port
        assertType<NodeOutputsResolved<"orbit">>({ point: { x: 0, y: 0 } });
    });


    it("pointsOnALine (colorPointArray return", () => {
        assertType<NodeOutputsResolved<"pointsOnALine">>({
            "points": [
                {
                    r: 1,
                    g: 1,
                    b: 1,
                    a: 1,
                    x: 1,
                    y: 1,
                    dx: 0,
                    dy: 0,

                }
            ]
        })
    });
});


describe("GeoArtGraph", () => {


    //💪 It would be good to have a case here for control nodes that accept array inputs, and how they cannot have static references

    it("empty case", () => {
        assertType<GeoArtGraph>({
            version: '2.0',
            control: {
                nodes: [
                ],
            },
            compute: {
                nodes: [
                ]
            },
            render: {
                nodes: [

                ],
            },
        })
    })

    it("minimal case", () => {
        assertType<GeoArtGraph>({
            version: '2.0',
            control: {
                nodes: [
                    {
                        id: 'speedSlider',
                        type: 'slider',
                        params: {
                            label: { v: 'Speed' },
                            min: { v: -5 },
                            max: { v: 5 },
                            value: { v: 0.2 },
                            step: { v: 0.01 },
                        },
                    },
                ],
            },
            compute: {
                nodes: [
                    { id: 'time', type: 'time', params: {} },
                    {
                        id: 'orbit',
                        type: 'orbit',
                        params: {
                            time: { ref: 'time.time' },
                            radius: { v: 0.3 },
                            speed: { ref: 'speedSlider.value' },
                        },
                    },
                ],
            },
            render: {
                nodes: [
                    {
                        id: 'dot',
                        type: 'circle',
                        renderConfig: { layer: 'live' },
                        params: {
                            center: { ref: 'orbit.point' },
                            radius: { v: 0.02 },
                            color: { v: { r: 0.3, g: 0.7, b: 1, a: 1 } },
                        },
                    },
                ],
            },
        })
    })

    it("control nodes cannot have referenced values", () => {
        assertType<GeoArtGraph>({
            version: '2.0',
            control: {
                nodes: [
                    {
                        id: 'speedSlider',
                        type: 'slider',
                        params: {
                            label: { v: 'Speed' },

                            // @ts-expect-error - referenced nodes not allowed here
                            min: { ref: "foo.bar" },
                            max: { v: 5 },
                            value: { v: 0.2 },
                            step: { v: 0.01 },
                        },
                    },
                ],
            },
            compute: {
                nodes: [
                ]
            },
            render: {
                nodes: [

                ],
            },
        })
    })

    it("array values can be a referenced value for the entire array", () => {
        assertType<GeoArtGraph>({
            version: '2.0',
            control: {
                nodes: [
                ],
            },
            compute: {
                nodes: [
                ]
            },
            render: {
                nodes: [
                    {
                        id: 'dot',
                        type: 'circle',
                        renderConfig: { layer: 'live' },
                        params: {
                            // nb. no actual enforcement that the ref port is the correct value type
                            centerPoints: { ref: 'orbit.points' },
                        },
                    },
                ],
            },
        })
    })

    it("array values can be a static list of static values", () => {
        assertType<GeoArtGraph>({
            version: '2.0',
            control: {
                nodes: [
                ],
            },
            compute: {
                nodes: [
                ]
            },
            render: {
                nodes: [
                    {
                        id: 'dot',
                        type: 'circle',
                        renderConfig: { layer: 'live' },
                        params: {
                            centerPoints: {
                                v: [{
                                    v: fColorPoint()
                                },
                                {
                                    v: fColorPoint()
                                },

                                //@ts-expect-error - mismatching values still error
                                { v: "foo" }

                                ]
                            }
                        },
                    },
                ],
            },
        })
    })

    it("array values can be a static list of referenced values", () => {
        assertType<GeoArtGraph>({
            version: '2.0',
            control: {
                nodes: [
                ],
            },
            compute: {
                nodes: [
                ]
            },
            render: {
                nodes: [
                    {
                        id: 'dot',
                        type: 'circle',
                        renderConfig: { layer: 'live' },
                        params: {
                            centerPoints: {
                                v: [{
                                    ref: "foo.bar",
                                },

                                // Can be a mix
                                {
                                    v: fColorPoint()
                                }
                                ]
                            },
                        },
                    }
                ],
            },
        })
    })
})

describe("Declared value types", () => {

    describe("array values are special", () => {





        it("ValueDeclared<colorPointArray> matches the type in required by GeoArtGraph", () => {
            const centerPointsArrayOfMixed = {
                v: [{
                    v: fColorPoint()
                },
                // Can be a mix
                {
                    ref: "hello.world"
                }

                ]
            }

            assertType<GeoArtGraph>({
                version: '2.0',
                control: {
                    nodes: [
                    ],
                },
                compute: {
                    nodes: [
                    ]
                },
                render: {
                    nodes: [
                        {
                            id: 'dot',
                            type: 'circle',
                            renderConfig: { layer: 'live' },
                            params: {
                                centerPoints: centerPointsArrayOfMixed
                            },
                        },
                    ],
                },
            })


            assertType<ValueDeclared<"colorPointArray">>(centerPointsArrayOfMixed)
        })

        it(`StaticValueDeclared<"colorPointArray"> can only be a static list of static values`, () => {
            assertType<StaticValueDeclared<"colorPointArray">>({
                v: [{
                    v: fColorPoint()
                }]
            })

            assertType<StaticValueDeclared<"colorPointArray">>({
                v: [{

                    //@ts-expect-error mismatching type
                    v: 1231
                }]
            })


            assertType<StaticValueDeclared<"colorPointArray">>({
                v: [{

                    //@ts-expect-error refs not valid
                    ref: "foo.bar"
                }]
            })

            assertType<StaticValueDeclared<"colorPointArray">>({
                //@ts-expect-error - refs not valid
                "ref": "foo.bar"
            })


        })
        it(`ValueDeclared<colorPointArray> can be a reference value to an array`, () => {
            assertType<ValueDeclared<"colorPointArray">>({
                ref: "foo.bar"
            })
        })

        it(`ValueDeclared<colorPointArray> can be a static value of mixed of static values or referenced values `, () => {
            assertType<ValueDeclared<"colorPointArray">>({
                v: [{
                    v: fColorPoint()
                }]
            })

            assertType<ValueDeclared<"colorPointArray">>({
                v: [{

                    //@ts-expect-error mismatching type
                    v: 1231
                }]
            })


            assertType<ValueDeclared<"colorPointArray">>({
                v: [{
                    ref: "foo.bar"
                }]
            })


        })
    });


    it("ReferencedValueDeclared is { ref: string }", () => {
        assertType<ReferencedValueDeclared>({ ref: "node.output" });

        //@ts-expect-error - missing ref
        assertType<ReferencedValueDeclared>({ v: 1 });

        //@ts-expect-error - wrong ref type
        assertType<ReferencedValueDeclared>({ ref: 123 });
    });

    it("StaticValueDeclared maps to { v: ResolvedValue<type> }", () => {
        assertType<StaticValueDeclared<"number">>({ v: 42 });

        //@ts-expect-error - wrong v type (string instead of number)
        assertType<StaticValueDeclared<"number">>({ v: "42" });

        assertType<StaticValueDeclared<"waveTypeEnum">>({ v: "sine" });

        //@ts-expect-error - wrong enum value
        assertType<StaticValueDeclared<"waveType">>({ v: "invalid" });
    });

    it("ValueDeclared is static or referenced", () => {
        assertType<ValueDeclared<"number">>({ v: 42 });
        assertType<ValueDeclared<"number">>({ ref: "node.output" });

        //@ts-expect-error - neither static nor ref
        assertType<ValueDeclared<"number">>({ x: 42 });
    });
});

describe("NodeInputsDeclared", () => {
    it("compute nodes accept both static and referenced values", () => {
        assertType<NodeInputsDeclared<"add">>({
            a: { v: 1 },
            b: { ref: "other.output" },
        });

        assertType<NodeInputsDeclared<"add">>({
            a: { v: 1 },
        });
    });

    it("render nodes accept both static and referenced values", () => {
        assertType<NodeInputsDeclared<"circle">>({
            center: { ref: "orbit.point" },
            radius: { v: 0.5 },
        });
    });

    it("control nodes only accept static values", () => {
        assertType<NodeInputsDeclared<"slider">>({
            value: { v: 50 },
        });

        assertType<NodeInputsDeclared<"slider">>({
            //@ts-expect-error - control nodes cannot use refs
            value: { ref: "other.output" },
        });
    });

    it("all inputs are optional", () => {
        assertType<NodeInputsDeclared<"add">>({});

        assertType<NodeInputsDeclared<"slider">>({});
    });
});

describe("PortReferenceForNodeType", () => {
    it("single-output node produces nodeId.portName", () => {
        assertType<PortReferenceForNodeType<"slider", "s1">>("s1.value");
        assertType<PortReferenceForNodeType<"time", "t">>("t.time");
        assertType<PortReferenceForNodeType<"add", "adder">>("adder.sum");

        //@ts-expect-error - wrong port name
        assertType<PortReferenceForNodeType<"add", "adder">>("adder.value");

        //@ts-expect-error - wrong node id prefix
        assertType<PortReferenceForNodeType<"add", "adder">>("other.sum");
    });

    it("multi-output node produces a union of all port refs", () => {
        assertType<PortReferenceForNodeType<"orbit", "o">>("o.point");
        assertType<PortReferenceForNodeType<"orbit", "o">>("o.points");

        //@ts-expect-error - not a valid orbit output port
        assertType<PortReferenceForNodeType<"orbit", "o">>("o.value");
    });

    it("render node (no outputs) resolves to never", () => {
        // @ts-expect-error - render nodes have no outputs, so this is never
        assertType<PortReferenceForNodeType<"circle", "c">>("c.anything");
    });

    it("constraint rejects non-node-kinds", () => {
        // @ts-expect-error - not a valid node kind
        assertType<PortReferenceForNodeType<"notANode", "x">>("x.value");
    });
});