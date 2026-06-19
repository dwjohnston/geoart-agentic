import { defineConfig } from '../../../thunderjar/src/defineConfig.ts';

export default defineConfig({
  commands: {
    testRunner: 'bun test',
    promptFiles: ['CLAUDE.md', '.claude/'],
    beforeRun: 'bun scripts/generate-agent-files.ts {approachName}',
  },

  tasks: {
    'normalise-compute-node': {
      description: 'Add a normalise compute node',
      prompt: `Add a normalise compute node. It fits an array of input points into a square bounding box centred on one or more normalisation centers.

Inputs:
- inputPoints: colorPointArrayValueOrRef
- normalisationCenters: colorPointArrayValueOrRef
- normalisationSize: numberValueOrRef (full side length of target bounding box)
- strength: numberValueOrRef (0-1, lerps between original and normalised positions)
- mode: "product" | "sequential" (default: "product")

Output: points (colorPointArrayValue)

Mode product: for each normalisation center, produce a copy of all input points normalised to that center. N points × M centers → N×M output points.
Mode sequential: apply each center in sequence — output of center k becomes input for center k+1. N → N output points.

Output points inherit colors from input points. Normalisation center colors are ignored.

Follow the existing compute node conventions.`,
      measurements: [
        { type: 'command', run: 'bun typecheck', expectExitCode: 0 },
        { type: 'command', run: 'bun test', expectExitCode: 0 },
        { type: 'fileCreated', path: 'src/nodes/compute/nodes/normalise.ts' },
        { type: 'fileCreated', path: 'src/nodes/compute/nodes/normalise.test.ts' },
        { type: 'grep', glob: 'src/**/*.ts', pattern: 'as any', expect: 'absent' },
        { type: 'correctness-test', templatePath: 'bench/templates/normalise-correctness.test.ts' },
      ],
    },
  },

  experiments: {
    e1: {
      description: 'skills, sonnet',
      task: 'normalise-compute-node',
      commitHash: 'bf1f495',
      promptsCommit: 'HEAD',
      approachName: 'skills',
      modelName: 'claude-sonnet-4-6',
      harnessName: 'claude-code',
    },
  },
});
