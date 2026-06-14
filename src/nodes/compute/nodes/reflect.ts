import { implementComputeNode } from '../implementComputeNode';

function reflectAboutLine(
  px: number,
  py: number,
  lx: number,
  ly: number,
): { x: number; y: number } {
  // Reflect (px, py) about a line through origin with unit direction (lx, ly).
  // Formula: P_reflected = 2*(P·L̂)*L̂ - P
  const dot = px * lx + py * ly;
  return {
    x: 2 * dot * lx - px,
    y: 2 * dot * ly - py,
  };
}

const reflectNodeImplementation = implementComputeNode('reflect', {
  isTimeDependant: false,
  defaults: {
    inputPoints: [],
    reflectionPoints: [],
  },
  evaluate: (inputs) => {
    const inputPoints = inputs.inputPoints;
    const reflectionPoints = inputs.reflectionPoints;

    const points = inputPoints.flatMap((input) =>
      reflectionPoints.map((reflection) => {
        const { dx = 0, dy = 0 } = reflection;
        const len = Math.sqrt(dx * dx + dy * dy);

        // dx=dy=0 is a no-op for this reflection point
        if (len < 1e-10) {
          return { ...input };
        }

        const lx = dx / len;
        const ly = dy / len;

        // Translate P by -R, reflect, translate back by +R
        const translated = reflectAboutLine(
          input.x - reflection.x,
          input.y - reflection.y,
          lx,
          ly,
        );
        const x = translated.x + reflection.x;
        const y = translated.y + reflection.y;

        // Reflect tangent vector (no translation for vectors)
        const inputDx = input.dx ?? 0;
        const inputDy = input.dy ?? 0;
        const reflectedTangent = reflectAboutLine(inputDx, inputDy, lx, ly);

        return {
          x,
          y,
          r: input.r,
          g: input.g,
          b: input.b,
          a: input.a,
          dx: reflectedTangent.x,
          dy: reflectedTangent.y,
        };
      }),
    );

    return { points };
  },
});

export default reflectNodeImplementation;
