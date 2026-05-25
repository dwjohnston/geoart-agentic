import { conductExperiment } from './conductExperiment.ts'
import { createCallAI } from './createCallAI.ts'
import { basePrompt } from './ingredients/basePrompt5.ts'
import { feedbackPrompt } from './ingredients/feedbackPrompt.ts'
import schemaJson from './ingredients/schema.ts'

const results = await conductExperiment(
  {
    name: 'lab',
    variables: {
      model: ['anthropic/claude-sonnet-4-6', 'anthropic/claude-haiku-4-5'],
      renderTicks: [1000],
      numIterations: [2],
      schema: [schemaJson],
      basePrompt: [basePrompt],
      feedbackPrompt: [feedbackPrompt],
    },
  },
  'laboratory/results',
  (combo) => createCallAI(combo),
)

for (const result of results) {
  console.log(`Experiment complete: ${result.resultName}`)
  console.log(`Iterations recorded: ${result.iterations.length}`)
}
