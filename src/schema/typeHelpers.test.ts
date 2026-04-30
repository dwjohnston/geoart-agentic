import { describe, it, assertType } from 'vitest';
import { type ComputeNodeKinds, type ControlNodeKinds, type RenderNodeKinds, type ValueTypeByName, type NodeInputsRecord, type NodeOutputsRecord } from './typeHelpers';


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
    it("maps 'numberValue' to { v: number } without kind", () => {
        assertType<ValueTypeByName<"numberValue">>({ v: 1 });

        //@ts-expect-error - wrong v type
        assertType<ValueTypeByName<"numberValue">>({ v: "foo" });

        //@ts-expect-error - kind is not part of the type
        assertType<ValueTypeByName<"numberValue">>({ kind: 'number', v: 1 });
    });
});

describe("NodeInputsRecord", () => {
    it("maps 'add' inputs to named ports without kind", () => {
        assertType<NodeInputsRecord<"add">>({ a: { v: 0 }, b: { v: 0 } });

        //@ts-expect-error - wrong key name
        assertType<NodeInputsRecord<"add">>({ x: { v: 0 }, b: { v: 0 } });

        //@ts-expect-error - wrong v type on port a
        assertType<NodeInputsRecord<"add">>({ a: { v: "foo" }, b: { v: 0 } });
    });

    assertType<NodeInputsRecord<"pointsOnALine">>({
        "pointA": {
            "v": {
                "color": {
                    r: 1,
                    g: 1,
                    b: 1,
                    a: 1
                },
                point: {
                    x: 1,
                    y: 1,
                },
                "valueType": "colorPoint"
            }
        },
        "pointB": {
            "v": {
                "color": {
                    r: 1,
                    g: 1,
                    b: 1,
                    a: 1
                },
                point: {
                    x: 1,
                    y: 1,
                },
                "valueType": "colorPoint"
            }
        },
        "numberOfPoints": {
            "v": 1
        }

    })
});

describe("NodeOutputsRecord", () => {
    it("maps 'add' outputs to named ports with raw .v types", () => {
        assertType<NodeOutputsRecord<"add">>({ sum: 42 });

        //@ts-expect-error - wrong key name
        assertType<NodeOutputsRecord<"add">>({ value: 42 });

        //@ts-expect-error - wrong value type (string instead of number)
        assertType<NodeOutputsRecord<"add">>({ sum: "42" });
    });

    it("maps multi-output node 'orbit' to both port names", () => {
        assertType<NodeOutputsRecord<"orbit">>({
            point: { x: 0, y: 0 },
            points: [],
        });

        //@ts-expect-error - missing 'points' port
        assertType<NodeOutputsRecord<"orbit">>({ point: { x: 0, y: 0 } });
    });


    it("pointsOnALine (colorPointArray return", () => {
        assertType<NodeOutputsRecord<"pointsOnALine">>({
            "points": [
                {
                    "color": {
                        r: 1,
                        g: 1,
                        b: 1,
                        a: 1
                    },
                    point: {
                        x: 1,
                        y: 1,
                    },
                    "valueType": "colorPoint"
                }
            ]
        })
    });
});