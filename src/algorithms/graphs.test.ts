import { describe, expect, test } from 'bun:test';
import { GRAPHS } from './index';
import { compile, realNodeRegistry } from '../graphEngine/exports';

describe('all graphs compile without error', () => {
  for (const entry of GRAPHS) {
    test(entry.id, () => {
      expect(() => compile(entry.graph, realNodeRegistry)).not.toThrow();
    });
  }
});
