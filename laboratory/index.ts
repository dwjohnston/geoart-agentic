import { conductExperiment } from './conductExperiment.ts'
import { createCallAI } from './createCallAI.ts'
import { basePrompt } from './ingredients/basePrompt5.ts'
import { feedbackPrompt } from './ingredients/feedbackPrompt.ts'
import schemaJson from './ingredients/schema.ts'

const ingredients = {
  schema: schemaJson,
  basePrompt,
  feedbackPrompt,
}

const results = await conductExperiment(
  {
    name: 'lab',
    model: ['anthropic/claude-sonnet-4-6'],
    renderTicks: 1000,
    numIterations: 3,
    ingredients,
  },
  'laboratory/results',
  createCallAI(ingredients),
)

for (const result of results) {
  console.log(`Experiment complete: ${result.resultName}`)
  console.log(`Iterations recorded: ${result.iterations.length}`)
}
