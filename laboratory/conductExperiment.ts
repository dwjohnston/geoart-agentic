import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { renderToImage } from './renderToImage.ts'
import type { CallAI, ExperimentConfig, ExperimentResult, IterationRecord, ModelId } from './types.ts'
import { validateSchema } from './validateSchema.ts'

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

async function withSpinner<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let frame = 0
  let elapsed = 0
  const interval = setInterval(() => {
    elapsed += 100
    process.stdout.write(`\r${SPINNER_FRAMES[frame % SPINNER_FRAMES.length]} ${label} (${(elapsed / 1000).toFixed(1)}s)`)
    frame++
  }, 100)
  try {
    const result = await fn()
    clearInterval(interval)
    process.stdout.write(`\r✓ ${label} (${(elapsed / 1000).toFixed(1)}s)\n`)
    return result
  } catch (err) {
    clearInterval(interval)
    process.stdout.write(`\r✗ ${label} (${(elapsed / 1000).toFixed(1)}s)\n`)
    throw err
  }
}

function normaliseArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

function buildResultName(experimentName: string, model: ModelId, numIterations: number): string {
  const safeModel = model.replace(/\//g, '-')
  return `${experimentName}__${safeModel}__${numIterations}`
}

async function runSingleCombination(
  config: ExperimentConfig,
  model: ModelId,
  numIterations: number,
  outputPath: string,
  callAI: CallAI,
): Promise<ExperimentResult> {
  const resultName = buildResultName(config.name, model, numIterations)
  const resultDir = path.join(outputPath, resultName)
  await mkdir(resultDir, { recursive: true })

  const { ingredients, renderTicks } = config

  const iterations: IterationRecord[] = []
  let feedbackImageBuffer: Buffer | null = null

  console.log(`[lab] starting run: ${resultName} (${numIterations} iteration${numIterations === 1 ? '' : 's'})`)

  for (let i = 0; i < numIterations; i++) {
    let algorithmJson: unknown
    try {
      const isFirst = i === 0

      const text = await withSpinner(
        `[lab] iteration ${i + 1}/${numIterations} — prompting ${model}`,
        () => callAI(model, i, feedbackImageBuffer),
      )

      const paddedIndex = String(i).padStart(2, '0')
      algorithmJson = JSON.parse(text)
      validateSchema(algorithmJson)
      await writeFile(
        path.join(resultDir, `iteration_${paddedIndex}_algorithm.json`),
        JSON.stringify(algorithmJson, null, 2),
      )

      console.log(`[lab] iteration ${i + 1}/${numIterations} — rendering`)
      const { imageBuffer, calls } = await renderToImage(algorithmJson, renderTicks)
      feedbackImageBuffer = imageBuffer

      await writeFile(path.join(resultDir, `iteration_${paddedIndex}.png`), imageBuffer)
      await writeFile(path.join(resultDir, `iteration_${paddedIndex}_calls.json`), JSON.stringify(calls, null, 2))
      console.log(`[lab] iteration ${i + 1}/${numIterations} — saved iteration_${paddedIndex}.png + calls`)

      iterations.push({
        iterationIndex: i,
        prompt: isFirst ? ingredients.basePrompt : ingredients.feedbackPrompt,
        algorithmJson,
        imageBuffer,
      })
    } catch (err) {
      console.error(`[lab] iteration ${i + 1}/${numIterations} — failed:`, err)
      const wrapped = err instanceof Error ? err : new Error(String(err))
        ; (wrapped as Error & { iterationIndex: number }).iterationIndex = i
      await writeFile(
        path.join(resultDir, 'failure.json'),
        JSON.stringify(
          { iterationIndex: i, message: wrapped.message, stack: wrapped.stack, algorithmJson: algorithmJson ?? null },
          null,
          2,
        ),
      )
      throw wrapped
    }
  }

  console.log(`[lab] run complete: ${resultName} — writing iterations.json`)
  await writeFile(
    path.join(resultDir, 'iterations.json'),
    JSON.stringify(
      iterations.map(r => ({ ...r, imageBuffer: undefined })),
      null,
      2,
    ),
  )

  return { resultName, iterations }
}

export async function conductExperiment(
  c: ExperimentConfig,
  outputPath: string,
  callAI: CallAI,
): Promise<ExperimentResult[]> {
  const config = { ...c, name: `${c.name}-${new Date().toISOString()}` }
  const models = normaliseArray(config.model)
  const iterationCounts = normaliseArray(config.numIterations)

  const combinations: Array<{ model: ModelId; numIterations: number }> = []
  for (const model of models) {
    for (const numIterations of iterationCounts) {
      combinations.push({ model, numIterations })
    }
  }

  return Promise.all(
    combinations.map(({ model, numIterations }) =>
      runSingleCombination(config, model, numIterations, outputPath, callAI),
    ),
  )
}

export async function singleTest(
  config: Omit<ExperimentConfig, 'name'>,
  outputPath: string,
  callAI: CallAI,
): Promise<ExperimentResult> {
  const results = await conductExperiment({ ...config, name: 'single-test' }, outputPath, callAI)
  return results[0]
}

