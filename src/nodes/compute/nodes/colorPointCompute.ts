import { implementComputeNode, } from '../implementComputeNode';

// Sentinel defaults for the deprecated object params. When a graph does not
// declare `point`/`color`, the evaluator supplies these defaults. We treat a
// value equal to its sentinel as "not provided" — mirroring how the orbit node
// treats an empty `centerPoints` array as "not provided" and falls back to the
// deprecated `center` param.
const DEPRECATED_POINT_DEFAULT = { x: 0, y: 0 };
const DEPRECATED_COLOR_DEFAULT = { r: 1, g: 1, b: 1, a: 1 };

const colorPointNodeImplementation = implementComputeNode('colorPointCompute', {
  defaults: {
    // Deprecated params kept for backwards compatibility
    point: { ...DEPRECATED_POINT_DEFAULT },
    color: { ...DEPRECATED_COLOR_DEFAULT },
    // New flat params
    r: 1,
    g: 1,
    b: 1,
    a: 1,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
  },

  evaluate(inputs) {
    const point = inputs.point;
    const color = inputs.color;

    // Resolve position/colour according to the precedence rules:
    //  1. The deprecated `point`/`color` params when they were declared
    //     (i.e. they differ from their sentinel defaults), so existing
    //     algorithms keep working unchanged.
    //  2. Otherwise the new flat params (x, y, r, g, b, a).
    const pointProvided =
      (point.x !== DEPRECATED_POINT_DEFAULT.x || point.y !== DEPRECATED_POINT_DEFAULT.y);
    const colorProvided =
      (color.r !== DEPRECATED_COLOR_DEFAULT.r ||
        color.g !== DEPRECATED_COLOR_DEFAULT.g ||
        color.b !== DEPRECATED_COLOR_DEFAULT.b ||
        color.a !== DEPRECATED_COLOR_DEFAULT.a);

    const x = pointProvided ? point.x : inputs.x;
    const y = pointProvided ? point.y : inputs.y;
    const r = colorProvided ? color.r : inputs.r;
    const g = colorProvided ? color.g : inputs.g;
    const b = colorProvided ? color.b : inputs.b;
    const a = colorProvided ? color.a : inputs.a;
    const dx = inputs.dx ?? 0;
    const dy = inputs.dy ?? 0;

    const colorPoint = {
      x,
      y,
      r,
      g,
      b,
      a,
      dx,
      dy,
    };

    console.log(pointProvided, colorProvided, colorPoint)

    return {
      colorPoint,
      // `colorPoints` must always be an array containing exactly one point.
      points: [colorPoint],
    };
  },
});

export default colorPointNodeImplementation;
