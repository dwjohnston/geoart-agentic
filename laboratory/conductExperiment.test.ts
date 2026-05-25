import { describe, it, expect } from 'bun:test';
import { exists } from 'node:fs/promises';
import path from 'node:path';
import { conductExperiment } from './conductExperiment.ts';
import type { PriorFeedback } from './types.ts';
import earthVenus from '../src/algorithms/reference/general/earthVenus.ts';

const OUTPUT_PATH = 'laboratory/_testResults';

describe('conductExperiment', () => {
    it('runs an experiment and writes the expected folders and files', async () => {
        const test1FolderName = 'test1'

        const results = await conductExperiment(
            {
                name: 'test',
                variables: {
                    model: ['stub'],
                    renderTicks: [3000],
                    numIterations: [2],
                    schema: [{ type: 'test' }],
                    basePrompt: ['base prompt content'],
                    feedbackPrompt: ['feedback prompt content'],
                },
            },
            OUTPUT_PATH,
            () => async () => JSON.stringify(earthVenus),
            () => test1FolderName
        );

        expect(results).toBeDefined();
        expect(results).toHaveLength(1);

        const experimentDir = path.join(OUTPUT_PATH, test1FolderName);
        expect(await exists(experimentDir)).toBe(true);

        const innerFolder = results[0].resultName;
        const resultDir = path.join(experimentDir, innerFolder);
        expect(await exists(resultDir)).toBe(true);

        expect(await exists(path.join(resultDir, '_schema.json'))).toBe(true);
        expect(await exists(path.join(resultDir, '_basePrompt.md'))).toBe(true);
        expect(await exists(path.join(resultDir, 'iteration_00_algorithm.json'))).toBe(true);
        expect(await exists(path.join(resultDir, 'iteration_00.png'))).toBe(true);
        expect(await exists(path.join(resultDir, 'iteration_01_algorithm.json'))).toBe(true);
        expect(await exists(path.join(resultDir, 'iteration_01.png'))).toBe(true);
    });

    it('creates a separate result folder for each model', async () => {
        const test2FolderName = 'test2';

        const results = await conductExperiment(
            {
                name: 'test',
                variables: {
                    model: ['stub-model-a', 'stub-model-b'],
                    renderTicks: [3000],
                    numIterations: [1],
                    schema: [{ type: 'test' }],
                    basePrompt: ['base prompt content'],
                    feedbackPrompt: ['feedback prompt content'],
                },
            },
            OUTPUT_PATH,
            () => async () => JSON.stringify(earthVenus),
            () => test2FolderName,
        );

        expect(results).toHaveLength(2);

        const experimentDir = path.join(OUTPUT_PATH, test2FolderName);
        expect(await exists(experimentDir)).toBe(true);

        const resultDirA = path.join(experimentDir, results[0].resultName);
        expect(await exists(resultDirA)).toBe(true);
        const resultDirB = path.join(experimentDir, results[1].resultName);
        expect(await exists(resultDirB)).toBe(true);


        [resultDirA, resultDirB].forEach(async (v) => {
            expect(await exists(path.join(v, '_schema.json'))).toBe(true);
            expect(await exists(path.join(v, '_basePrompt.md'))).toBe(true);
            expect(await exists(path.join(v, 'iteration_00_algorithm.json'))).toBe(true);
            expect(await exists(path.join(v, 'iteration_00.png'))).toBe(true);
        })



        expect(results[0].resultName).not.toBe(results[1].resultName);
    });

    it('creates a separate result folder for each base prompt', async () => {
        const test3FolderName = 'test3';

        const results = await conductExperiment(
            {
                name: 'test',
                variables: {
                    model: ['stub'],
                    renderTicks: [3000],
                    numIterations: [1],
                    schema: [{ type: 'test' }],
                    basePrompt: ['base prompt A', 'base prompt B'],
                    feedbackPrompt: ['feedback'],
                },
            },
            OUTPUT_PATH,
            () => async () => JSON.stringify(earthVenus),
            () => test3FolderName,
        );

        expect(results).toHaveLength(2);

        const experimentDir = path.join(OUTPUT_PATH, test3FolderName);
        expect(await exists(experimentDir)).toBe(true);

        const resultDirA = path.join(experimentDir, results[0].resultName);
        expect(await exists(resultDirA)).toBe(true);
        const resultDirB = path.join(experimentDir, results[1].resultName);
        expect(await exists(resultDirB)).toBe(true);

        [resultDirA, resultDirB].forEach(async (v) => {
            expect(await exists(path.join(v, '_schema.json'))).toBe(true);
            expect(await exists(path.join(v, '_basePrompt.md'))).toBe(true);
            expect(await exists(path.join(v, 'iteration_00_algorithm.json'))).toBe(true);
            expect(await exists(path.join(v, 'iteration_00.png'))).toBe(true);
        });

        expect(results[0].resultName).not.toBe(results[1].resultName);
    });

    it('does not throw when the AI returns an invalid algorithm', async () => {
        const callLog: Array<{ iterationIndex: number, priorFeedback: PriorFeedback }> = []

        const results = await conductExperiment(
            {
                name: 'test',
                variables: {
                    model: ['stub'],
                    renderTicks: [3000],
                    numIterations: [2],
                    schema: [{ type: 'test' }],
                    basePrompt: ['base prompt content'],
                    feedbackPrompt: ['feedback prompt content'],
                },
            },
            OUTPUT_PATH,
            () => async (_model, iterationIndex, priorFeedback) => {
                callLog.push({ iterationIndex, priorFeedback })
                return 'this is not valid json'
            },
            () => 'test4',
        );

        expect(results).toHaveLength(1);
        expect(results[0].iterations).toHaveLength(0);

        expect(callLog).toHaveLength(2);
        expect(callLog[0].priorFeedback).toBeNull();
        expect(callLog[1].priorFeedback).not.toBeNull();
        expect(callLog[1].priorFeedback?.message).toContain('JSON Parse error');

        const resultDir = path.join(OUTPUT_PATH, 'test4', results[0].resultName);
        expect(await exists(path.join(resultDir, 'iteration_00_failure.json'))).toBe(true);
        expect(await exists(path.join(resultDir, 'iteration_01_failure.json'))).toBe(true);
    });
});
