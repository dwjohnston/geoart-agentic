import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import type { CallAI, Ingredient, ModelId } from './types.ts'

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1) return text.slice(firstBrace, lastBrace + 1)
  return text.trim()
}

function buildModel(modelId: ModelId) {
  const slashIndex = modelId.indexOf('/')
  const provider = modelId.slice(0, slashIndex)
  const subId = modelId.slice(slashIndex + 1)

  if (provider === 'anthropic') {
    return createAnthropic()(subId)
  }
  if (provider === 'openai') {
    return createOpenAI()(subId)
  }
  throw new Error(`Unknown provider prefix: ${provider}`)
}

export function createCallAI(ingredients: Ingredient): CallAI {
  return async (model, iterationIndex, priorFeedback) => {
    const llmModel = buildModel(model)

    const messages: Parameters<typeof generateText>[0]['messages'] =
      iterationIndex === 0 || priorFeedback === null
        ? [{ role: 'user', content: ingredients.basePrompt }]
        : [
          {
            role: 'user',
            content: [
              ...(priorFeedback.imageBuffer !== null
                ? [{ type: 'image' as const, image: priorFeedback.imageBuffer }]
                : []),
              { type: 'text' as const, text: priorFeedback.message ?? ingredients.feedbackPrompt },
            ],
          },
        ]

    const result = await generateText({
      model: llmModel,
      system: `You are a generative art algorithm designer. Respond with a single raw JSON object only — no markdown, no code fences, no explanation. The JSON must conform to this schema:\n\n${JSON.stringify(ingredients.schema, null, 2)}`,
      messages,
    })

    return extractJson(result.text)
  }
}
