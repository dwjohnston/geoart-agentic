import { describe, test, expect } from 'bun:test';
import {
  generateComputeRegistryContent,
  generateRenderRegistryContent,
  generateControlRegistryContent,
} from './generate-registries';

describe('generateComputeRegistryContent', () => {
  test('includes imports and computeRegistry export', () => {
    const content = generateComputeRegistryContent(['add', 'orbit']);
    expect(content).toContain("import add from './nodes/add';");
    expect(content).toContain("import orbit from './nodes/orbit';");
    expect(content).toContain('[add, orbit]');
    expect(content).toContain('computeRegistry');
  });
});

describe('generateRenderRegistryContent', () => {
  test('includes imports and renderRegistry export', () => {
    const content = generateRenderRegistryContent(['circle', 'timedLine']);
    expect(content).toContain("import circle from './nodes/circle';");
    expect(content).toContain("import timedLine from './nodes/timedLine';");
    expect(content).toContain('[circle, timedLine]');
    expect(content).toContain('renderRegistry');
  });
});

describe('generateControlRegistryContent', () => {
  test('includes imports and controlRegistry export', () => {
    const content = generateControlRegistryContent(['Slider', 'ColorPicker']);
    expect(content).toContain("import Slider from './nodes/Slider';");
    expect(content).toContain("import ColorPicker from './nodes/ColorPicker';");
    expect(content).toContain('[Slider, ColorPicker]');
    expect(content).toContain('controlRegistry');
  });
});
