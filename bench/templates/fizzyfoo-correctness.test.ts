import { describe, expect, test } from 'bun:test';
import graph from './src/algorithms/reference/general/fizzyFooReferenceGraph';

describe('fizzyFoo algorithm structure', () => {
  test('has five orbit modules', () => {
    const orbitModules = (graph.module?.nodes ?? []).filter(n => n.type === 'orbit-module');
    expect(orbitModules).toHaveLength(5);
  });

  test('has one slider control node', () => {
    const sliders = (graph.control?.nodes ?? []).filter(n => n.type === 'slider');
    expect(sliders).toHaveLength(1);
  });

  test('has one time compute node', () => {
    const timeNodes = (graph.compute?.nodes ?? []).filter(n => n.type === 'time');
    expect(timeNodes).toHaveLength(1);
  });
});
