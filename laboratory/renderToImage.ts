import type { Call } from '../src/common-tooling/test-tooling/fakeContext'
import type { CompiledGraph } from '../src/graphEngine/compiler/compiler'
import type { EvalContext } from '../src/graphEngine/evaluator/EvalContext'
import type { GeoArtGraph } from '../src/schema/_generated/schema-types'
import { createFakeContext } from '../src/common-tooling/test-tooling/fakeContext'
import { replayCallsOnCanvas } from '../src/common-tooling/test-tooling/replayContext'
import { compile } from '../src/graphEngine/compiler/compiler'
import { tick } from '../src/graphEngine/evaluator/evaluator'
import { computeRegistry } from '../src/nodes/compute/registry'
import { controlRegistry } from '../src/nodes/control/registry'
import { renderRegistry } from '../src/nodes/render/registry'

export type RenderResult = { imageBuffer: Buffer; calls: Call[] }

const CANVAS_SIZE = 400

export async function renderToImage(json: unknown, ticks = 1): Promise<RenderResult> {
  let compiled: CompiledGraph
  try {
    compiled = compile(json as GeoArtGraph, { computeRegistry, renderRegistry, controlRegistry })
  } catch (err) {
    throw new Error(`renderToImage: compile failed — ${err instanceof Error ? err.message : String(err)}`)
  }

  const orbitCtx = createFakeContext()
  const trailCtx = createFakeContext()

  const enabledRenderNodes = new Set<string>()
  for (const nodeId of compiled.sortedNodes) {
    const node = compiled.nodes.get(nodeId)
    if (node?.layer === 'render') {
      enabledRenderNodes.add(nodeId)
    }
  }

  try {
    for (let t = 1; t <= ticks; t++) {
      orbitCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
      const ctx: EvalContext = {
        tickCount: t,
        canvas: {
          orbit: orbitCtx,
          trail: trailCtx,
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
        },
        getState<T>(): T { return undefined as unknown as T },
        setState(): void {},
        enabledRenderNodes,
      }
      tick(compiled, t, ctx)
    }
  } catch (err) {
    throw new Error(`renderToImage: evaluation failed — ${err instanceof Error ? err.message : String(err)}`)
  }

  const orbitCalls = orbitCtx.getCalls()
  const trailCalls = trailCtx.getCalls()
  const allCalls = [...trailCalls, ...orbitCalls]

  const canvas = replayCallsOnCanvas(allCalls, CANVAS_SIZE, CANVAS_SIZE)
  return {
    imageBuffer: canvas.toBuffer('image/png') as unknown as Buffer,
    calls: allCalls,
  }
}
