import { describe, expect, test } from 'vitest';
import { GRAPHS } from './index';
import { compile } from '../graphEngine/compiler/compiler';

describe('all graphs compile without error', () => {
  for (const entry of GRAPHS) {
    test(entry.id, () => {
      expect(() => compile(entry.graph)).not.toThrow();
    });
  }
});
