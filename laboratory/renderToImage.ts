import { createCanvas } from '@napi-rs/canvas'
import type { CompiledGraph } from '../src/graphEngine/compiler/compiler'
import type { EvalContext } from '../src/graphEngine/evaluator/EvalContext'
import type { GeoArtGraph } from '../src/schema/_generated/schema-types'
import { compile } from '../src/graphEngine/compiler/compiler'
import { tick } from '../src/graphEngine/evaluator/evaluator'
import { computeRegistry } from '../src/nodes/compute/registry'
import { controlRegistry } from '../src/nodes/control/registry'
import { renderRegistry } from '../src/nodes/render/registry'

export type RenderResult = { imageBuffer: Buffer; calls: [] }

const CANVAS_SIZE = 400

export async function renderToImage(json: unknown, ticks = 1): Promise<RenderResult> {
  let compiled: CompiledGraph
  try {
    compiled = compile(json as GeoArtGraph, { computeRegistry, renderRegistry, controlRegistry })
  } catch (err) {
    throw new Error(`renderToImage: compile failed — ${err instanceof Error ? err.message : String(err)}`)
  }

  const orbitCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE)
  const trailCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE)

  const enabledRenderNodes = new Set<string>()
  for (const nodeId of compiled.sortedNodes) {
    const node = compiled.nodes.get(nodeId)
    if (node?.layer === 'render') {
      enabledRenderNodes.add(nodeId)
    }
  }

  try {
    for (let t = 1; t <= ticks; t++) {
      const ctx: EvalContext = {
        tickCount: t,
        canvas: {
          orbit: orbitCanvas.getContext('2d') as unknown as CanvasRenderingContext2D,
          trail: trailCanvas.getContext('2d') as unknown as CanvasRenderingContext2D,
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
        },
        getState<T>(): T { return undefined as unknown as T },
        setState(): void { },
        enabledRenderNodes,
      }
      tick(compiled, t, ctx)
    }
  } catch (err) {
    throw new Error(`renderToImage: evaluation failed — ${err instanceof Error ? err.message : String(err)}`)
  }

  return {
    imageBuffer: trailCanvas.toBuffer('image/png') as unknown as Buffer,
    calls: [],
  }
}
