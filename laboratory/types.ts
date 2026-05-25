export type ModelId = 'anthropic/claude-sonnet-4-6' | 'anthropic/claude-haiku-4-5' | 'openai/gpt-4o' | (string & {})

export type Ingredient = {
  schema: object
  basePrompt: string
  feedbackPrompt: string
}

export type ExperimentVariables = {
  model: ModelId | ModelId[]
  renderTicks: number | number[]
  numIterations: number | number[]
  schema: object | object[]
  basePrompt: string | string[]
  feedbackPrompt: string | string[]
}

export type ExperimentConfig = {
  name: string
  variables: ExperimentVariables
}

export type ResolvedCombination = {
  model: ModelId
  renderTicks: number
  numIterations: number
  schema: object
  basePrompt: string
  feedbackPrompt: string
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

export type PriorFeedback = {
  imageBuffer: Buffer | null
  message: string | null
} | null

export type CallAI = (
  model: ModelId,
  iterationIndex: number,
  priorFeedback: PriorFeedback,
) => Promise<string>
