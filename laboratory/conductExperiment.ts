import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { renderToImage } from './renderToImage.ts'
import type { CallAI, ExperimentConfig, ExperimentResult, IterationRecord, PriorFeedback, ResolvedCombination } from './types.ts'
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

function shortHash(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 8)
}

function buildInnerFolderName(combo: ResolvedCombination): string {
  const agentName = combo.model.replace(/\//g, '-')
  const schemaHash = shortHash(JSON.stringify(combo.schema))
  const basePromptHash = shortHash(combo.basePrompt)
  const feedbackPromptHash = shortHash(combo.feedbackPrompt)
  return `${agentName}-${schemaHash}-${basePromptHash}-${feedbackPromptHash}-${combo.numIterations}-iterations-${combo.renderTicks}-ticks`
}

function buildCombinations(variables: ExperimentConfig['variables']): ResolvedCombination[] {
  const models = normaliseArray(variables.model)
  const renderTicksArr = normaliseArray(variables.renderTicks)
  const numIterationsArr = normaliseArray(variables.numIterations)
  const schemas = normaliseArray(variables.schema)
  const basePrompts = normaliseArray(variables.basePrompt)
  const feedbackPrompts = normaliseArray(variables.feedbackPrompt)

  const combinations: ResolvedCombination[] = []
  for (const model of models)
    for (const renderTicks of renderTicksArr)
      for (const numIterations of numIterationsArr)
        for (const schema of schemas)
          for (const basePrompt of basePrompts)
            for (const feedbackPrompt of feedbackPrompts)
              combinations.push({ model, renderTicks, numIterations, schema, basePrompt, feedbackPrompt })
  return combinations
}

async function runSingleCombination(
  combo: ResolvedCombination,
  experimentDir: string,
  createCallAIForCombo: (combo: ResolvedCombination) => CallAI,
): Promise<ExperimentResult> {
  const resultName = buildInnerFolderName(combo)
  const resultDir = path.join(experimentDir, resultName)
  await mkdir(resultDir, { recursive: true })

  await writeFile(path.join(resultDir, '_schema.json'), JSON.stringify(combo.schema, null, 2))
  await writeFile(path.join(resultDir, '_basePrompt.md'), combo.basePrompt)

  const callAI = createCallAIForCombo(combo)
  const { numIterations, renderTicks } = combo

  const iterations: IterationRecord[] = []
  let priorFeedback: PriorFeedback = null

  console.log(`[lab] starting run: ${resultName} (${numIterations} iteration${numIterations === 1 ? '' : 's'})`)

  for (let i = 0; i < numIterations; i++) {
    let algorithmJson: unknown
    let rawText: string | undefined
    const paddedIndex = String(i).padStart(2, '0')
    const isFirst = i === 0
    try {
      rawText = await withSpinner(
        `[lab] iteration ${i + 1}/${numIterations} — prompting ${combo.model}`,
        () => callAI(combo.model, i, priorFeedback),
      )

      algorithmJson = JSON.parse(rawText)
      validateSchema(algorithmJson)
      await writeFile(
        path.join(resultDir, `iteration_${paddedIndex}_algorithm.json`),
        JSON.stringify(algorithmJson, null, 2),
      )

      console.log(`[lab] iteration ${i + 1}/${numIterations} — rendering`)
      const { imageBuffer, calls } = await renderToImage(algorithmJson, renderTicks)

      await writeFile(path.join(resultDir, `iteration_${paddedIndex}.png`), imageBuffer)
      await writeFile(path.join(resultDir, `iteration_${paddedIndex}_calls.json`), JSON.stringify(calls, null, 2))
      console.log(`[lab] iteration ${i + 1}/${numIterations} — saved iteration_${paddedIndex}.png + calls`)

      iterations.push({
        iterationIndex: i,
        prompt: isFirst ? combo.basePrompt : combo.feedbackPrompt,
        algorithmJson,
        imageBuffer,
      })

      priorFeedback = { imageBuffer, message: null }
    } catch (err) {
      console.error(`[lab] iteration ${i + 1}/${numIterations} — failed:`, err)
      const message = err instanceof Error ? err.message : String(err)
      await writeFile(
        path.join(resultDir, `iteration_${paddedIndex}_failure.json`),
        JSON.stringify({ iterationIndex: i, message, rawText: rawText ?? null }, null, 2),
      )
      priorFeedback = { imageBuffer: null, message }
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

export function defaultCreateExperimentFolderName(experimentName: string): string {
  return `${experimentName}-${new Date().toISOString()}`
}

export async function conductExperiment(
  c: ExperimentConfig,
  outputPath: string,
  createCallAIForCombo: (combo: ResolvedCombination) => CallAI,
  createExperimentFolderName: (experimentName: string) => string = defaultCreateExperimentFolderName,
): Promise<ExperimentResult[]> {
  const experimentFolderName = createExperimentFolderName(c.name)
  const experimentDir = path.join(outputPath, experimentFolderName)
  await mkdir(experimentDir, { recursive: true })

  const combinations = buildCombinations(c.variables)

  return Promise.all(
    combinations.map(combo => runSingleCombination(combo, experimentDir, createCallAIForCombo)),
  )
}

export async function singleTest(
  config: Omit<ExperimentConfig, 'name'>,
  outputPath: string,
  createCallAIForCombo: (combo: ResolvedCombination) => CallAI,
): Promise<ExperimentResult> {
  const results = await conductExperiment({ ...config, name: 'single-test' }, outputPath, createCallAIForCombo)
  return results[0]
}
