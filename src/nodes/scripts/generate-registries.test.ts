import { describe, test, expect } from 'bun:test';
import {
  generateComputeRegistryContent,
  generateRenderRegistryContent,
  generateControlRegistryContent,
  generateModuleRegistryContent,
} from './generate-registries';
import { moduleRegistry } from '../module/registry';

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

describe('generateModuleRegistryContent', () => {
  test('keys the registry by filename, camelCasing the import identifier', () => {
    const content = generateModuleRegistryContent(['orbit-module']);
    expect(content).toContain("import orbitModule from './nodes/orbit-module';");
    expect(content).toContain("['orbit-module', orbitModule],");
    expect(content).toContain('moduleRegistry');
  });
});

describe('module implementation filenames', () => {
  // The registry is keyed by filename; the implementation independently declares
  // its own `_kind`. These must agree, otherwise the file is named after the
  // wrong kind (or vice versa).
  test.each([...moduleRegistry.entries()])(
    'module file "%s" declares a matching _kind',
    (filename, impl) => {
      expect(impl._kind as string).toBe(filename);
    }
  );
});
