import type { ResolvedValue } from "../schema/typeHelpers";

export function fColorPoint(partial: Partial<ResolvedValue<"colorPointValue">> = {}): ResolvedValue<"colorPointValue"> {
    return {
        x: 0,
        y: 0,
        r: 1,
        g: 1,
        b: 1,
        a: 1,
        dx: 0,
        dy: 0,
        ...partial
    }
}


export function wrapInV<T extends Record<string, unknown>>(
    obj: T
): { [K in keyof T]: { v: T[K] } } {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, { v: value }])
    ) as { [K in keyof T]: { v: T[K] } };
}