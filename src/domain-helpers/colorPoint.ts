import type { ResolvedValue } from "../schema/typeHelpers";

export type ColorPoint = ResolvedValue<"colorPointValue">;

type NullableChannels = {
  r: number | null;
  g: number | null;
  b: number | null;
  a: number | null;
};

type SolidChannels = { r: number; g: number; b: number; a: number };

export type Solid<T extends NullableChannels> = Omit<T, keyof SolidChannels> &
  SolidChannels;

// A null colour channel only carries meaning in a colour shift ('ignore this
// channel'). When a colour point is rendered directly, null reads as 0.
export function toSolidColorPoint<T extends NullableChannels>(
  point: T,
): Solid<T> {
  return {
    ...point,
    r: point.r ?? 0,
    g: point.g ?? 0,
    b: point.b ?? 0,
    a: point.a ?? 0,
  };
}
