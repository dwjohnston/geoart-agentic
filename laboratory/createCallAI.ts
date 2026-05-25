import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import type { CallAI, Ingredient, ModelId } from './types.ts'

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
  return async (model, iterationIndex, priorImageBuffer) => {
    const llmModel = buildModel(model)
    const isFirst = iterationIndex === 0

    const messages: Parameters<typeof generateText>[0]['messages'] =
      isFirst || priorImageBuffer === null
        ? [{ role: 'user', content: ingredients.basePrompt }]
        : [
            {
              role: 'user',
              content: [
                { type: 'image', image: priorImageBuffer },
                { type: 'text', text: ingredients.feedbackPrompt },
              ],
            },
          ]

    const result = await generateText({
      model: llmModel,
      system: JSON.stringify(ingredients.schema),
      messages,
    })

    return result.text
  }
}
