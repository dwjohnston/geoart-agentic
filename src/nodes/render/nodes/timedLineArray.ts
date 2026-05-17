import { toSolidColorPoint } from '../../../domain-helpers/colorPoint';
import { implementRenderNode } from '../implementRenderNode';
import type { RenderEvalContext } from '../../../graphEngine/externalInterfaces/RenderNodeDefinition';

type ColorPoint = { x: number; y: number; r: number; g: number; b: number; a: number; dx?: number; dy?: number };
type Link = [ColorPoint, ColorPoint];

function computeLinks(
  arrayA: ColorPoint[],
  arrayB: ColorPoint[],
  mode: 'all-to-all' | 'distribute' | 'interleave',
): Link[] {
  if (arrayA.length === 0 || arrayB.length === 0) return [];

  if (mode === 'all-to-all') {
    const links: Link[] = [];
    for (const a of arrayA) {
      for (const b of arrayB) {
        links.push([a, b]);
      }
    }
    return links;
  }

  if (mode === 'distribute') {
    return arrayA.map((a, i): Link => [a, arrayB[Math.floor(i * arrayB.length / arrayA.length)]]);
  }

  // interleave
  return arrayA.map((a, i): Link => [a, arrayB[i % arrayB.length]]);
}

function getPingPongIndex(counter: number, n: number): number {
  if (n <= 1) return 0;
  const cycle = 2 * (n - 1);
  const pos = counter % cycle;
  return pos < n ? pos : cycle - pos;
}

function getInsideOutLinksAtStep(links: Link[], step: number): Link[] {
  const n = links.length;
  if (n === 0) return [];
  const centerLeft = Math.floor((n - 1) / 2);
  const centerRight = Math.ceil((n - 1) / 2);
  const leftIdx = centerLeft - step;
  const rightIdx = centerRight + step;
  const result: Link[] = [];
  if (leftIdx >= 0 && leftIdx < n) result.push(links[leftIdx]);
  if (rightIdx !== leftIdx && rightIdx >= 0 && rightIdx < n) result.push(links[rightIdx]);
  return result;
}

function drawLink(
  canvas: CanvasRenderingContext2D,
  a: ColorPoint,
  b: ColorPoint,
  width: number,
  height: number,
): void {
  const aPixelX = a.x * (width / 2) + (width / 2);
  const aPixelY = (height / 2) - a.y * (height / 2);
  const bPixelX = b.x * (width / 2) + (width / 2);
  const bPixelY = (height / 2) - b.y * (height / 2);

  const gradient = canvas.createLinearGradient(aPixelX, aPixelY, bPixelX, bPixelY);
  gradient.addColorStop(0, `rgba(${a.r * 255}, ${a.g * 255}, ${a.b * 255}, ${a.a})`);
  gradient.addColorStop(1, `rgba(${b.r * 255}, ${b.g * 255}, ${b.b * 255}, ${b.a})`);

  canvas.strokeStyle = gradient;
  canvas.beginPath();
  canvas.moveTo(aPixelX, aPixelY);
  canvas.lineTo(bPixelX, bPixelY);
  canvas.stroke();
}

type IntervalState = { counter: number };

function selectLinks(
  links: Link[],
  intervalMode: 'all' | 'cycle' | 'back-and-forth' | 'inside-out' | 'inside-out-and-forth',
  ctx: RenderEvalContext,
): Link[] {
  if (intervalMode === 'all') return links;

  const n = links.length;
  if (n === 0) return [];

  const state = (ctx.getState?.() as IntervalState | undefined) ?? { counter: 0 };
  const counter = state.counter;
  ctx.setState?.({ counter: counter + 1 });

  if (intervalMode === 'cycle') {
    return [links[counter % n]];
  }

  if (intervalMode === 'back-and-forth') {
    return [links[getPingPongIndex(counter, n)]];
  }

  const totalSteps = Math.ceil(n / 2);
  const step = intervalMode === 'inside-out'
    ? counter % totalSteps
    : getPingPongIndex(counter, totalSteps);

  return getInsideOutLinksAtStep(links, step);
}

const timedLineArrayNodeDef = implementRenderNode('timedLineArray', {
  defaults: {
    intervalTicks: 6,
    colorPointsA: [],
    colorPointsB: [],
    mode: 'all-to-all',
    intervalMode: 'all',
  },
  evaluate: (inputs, ctx) => {
    const links = computeLinks(
      inputs.colorPointsA.map(toSolidColorPoint),
      inputs.colorPointsB.map(toSolidColorPoint),
      inputs.mode,
    );
    if (links.length === 0) return;

    ctx.canvas.lineWidth = 1;

    const linksToRender = selectLinks(links, inputs.intervalMode, ctx);

    for (const [a, b] of linksToRender) {
      drawLink(ctx.canvas, a, b, ctx.width, ctx.height);
    }
  },
});

export default timedLineArrayNodeDef;
