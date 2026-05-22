import { conductExperiment } from './conductExperiment.ts'
import schemaJson from './ingredients/schema.ts'
import { basePrompt } from './ingredients/basePrompt.ts'
import { feedbackPrompt } from './ingredients/feedbackPrompt.ts'

const results = await conductExperiment({
  name: 'lab',
  model: 'anthropic/claude-sonnet-4-6',
  renderTicks: 1000,
  numIterations: 3,
  ingredients: {
    schema: schemaJson,
    basePrompt,
    feedbackPrompt,
  },
})

for (const result of results) {
  console.log(`Experiment complete: ${result.resultName}`)
  console.log(`Iterations recorded: ${result.iterations.length}`)
}
