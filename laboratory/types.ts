export type ModelId = 'anthropic/claude-sonnet-4-6' | 'anthropic/claude-haiku-4-5' | 'openai/gpt-4o' | (string & {})

export type Ingredient = {
  schema: object
  basePrompt: string
  feedbackPrompt: string
}

export type ExperimentVariable<T> = T | T[]

export type ExperimentConfig = {
  name: string
  model: ExperimentVariable<ModelId>
  numIterations: ExperimentVariable<number>
  renderTicks?: number
  ingredients: Ingredient
}

export type ExperimentResult = {
  resultName: string
  iterations: IterationRecord[]
}

export type IterationRecord = {
  iterationIndex: number
  prompt: string
  algorithmJson: unknown
  imageBuffer: Buffer
}

export type CallAI = (
  model: ModelId,
  iterationIndex: number,
  priorImageBuffer: Buffer | null,
) => Promise<string>
