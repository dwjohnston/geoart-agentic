import { describe, expect, test } from 'bun:test';
import { exportReactComponentFileName, generateReactComponentSource } from './exportReactComponent';
import type { ExportableAlgorithm } from './exportReactComponent';
import type { GeoArtGraph } from '../schema/_generated/schema-types';

const graph: GeoArtGraph = {
  version: '2.0',
  control: { nodes: [] },
  compute: { nodes: [{ id: 'time', type: 'time', params: {} }] },
  render: { nodes: [] },
};

const algorithm: ExportableAlgorithm = { id: 'my-algo', name: 'My Cool Algorithm', graph };

describe('exportReactComponentFileName', () => {
  test('builds a PascalCase .tsx filename from the algorithm name', () => {
    expect(exportReactComponentFileName(algorithm)).toBe('MyCoolAlgorithm.tsx');
  });

  test('falls back to a generic name when the name has no alphanumerics', () => {
    expect(exportReactComponentFileName({ ...algorithm, name: '!!!' })).toBe('Algorithm.tsx');
  });

  test('prefixes a leading digit so the identifier stays valid', () => {
    expect(exportReactComponentFileName({ ...algorithm, name: '3 Body Problem' })).toBe('Algorithm3BodyProblem.tsx');
  });
});

describe('generateReactComponentSource', () => {
  const source = generateReactComponentSource(algorithm);

  test('imports AlgorithmCanvas from the graph engine public exports', () => {
    expect(source).toContain("import { AlgorithmCanvas } from './graphEngine/exports';");
  });

  test('declares a component named after the algorithm', () => {
    expect(source).toContain('export function MyCoolAlgorithm(');
  });

  test('embeds the full graph as valid JSON', () => {
    const match = source.match(/const graph: GeoArtGraph = ([\s\S]*?);\n\nexport type/);
    expect(match).not.toBeNull();
    expect(JSON.parse(match![1])).toEqual(graph);
  });

  test('documents the source-directory dependency up front', () => {
    expect(source).toContain('src/graphEngine, src/nodes, src/schema, src/common-tooling, src/domain-helpers');
  });
});
