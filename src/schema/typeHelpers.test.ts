import { describe, it, assertType, expect } from 'vitest';
import { type ComputeNodeKinds, type ControlNodeKinds, type RenderNodeKinds, type ValueTypeByName, type NodeInputsRecord, type NodeOutputsRecord, type ResolvedValue } from './typeHelpers';


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
        assertType<ValueTypeByName<"waveTypeValue">>({ "v": "saw" })

        //@ts-expect-error - not matching the enum
        assertType<ValueTypeByName<"waveTypeValue">>({ "v": "sdfds" })

    })
});


describe('ResolvedValue', () => {
    it("has just the shorthand value representation", () => {
        assertType<ResolvedValue<"waveTypeValue">>("reverse-saw")

        //@ts-expect-error - mis matching type
        assertType<ResolvedValue<"waveTypeValue">>("sfdsfd")


        assertType<ResolvedValue<"numberValue">>(1);


        assertType<ResolvedValue<"stringArrayValue">>(["1", "2"]);




    })
})

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
                r: 1,
                g: 1,
                b: 1,
                a: 1,
                x: 1,
                y: 1,
            },
        },

        "pointB": {
            "v": {
                r: 1,
                g: 1,
                b: 1,
                a: 1,
                x: 1,
                y: 1,


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
                    r: 1,
                    g: 1,
                    b: 1,
                    a: 1,
                    x: 1,
                    y: 1,
                }
            ]
        })
    });
});