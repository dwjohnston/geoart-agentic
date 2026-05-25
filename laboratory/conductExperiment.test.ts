import { describe, it, expect } from 'bun:test';
import { conductExperiment } from './conductExperiment.ts';
import earthVenus from '../src/algorithms/reference/general/earthVenus.ts';

describe('conductExperiment', () => {
    it('runs an experiment with a stub AI call', async () => {
        const results = await conductExperiment(
            {
                name: 'test',
                model: ['stub'],
                renderTicks: 3000,
                numIterations: 1,
                ingredients: {
                    schema: {},
                    basePrompt: '',
                    feedbackPrompt: '',
                },
            },
            'laboratory/_testResults',
            async () => JSON.stringify(earthVenus),
        );

        expect(results).toBeDefined();
    });
});
