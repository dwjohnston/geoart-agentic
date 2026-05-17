import { describe, expect, it } from 'bun:test';
import timeNodeDef from './time.node';

const ctx = { tickCount: 0, getState: <T>() => ({} as T), setState: () => {} };

describe('timeNodeDef', () => {
  it('outputs the tick count unchanged', () => {
    expect(timeNodeDef.evaluate([], { ...ctx, tickCount: 42 })[0].v).toBe(42);
  });

  it('outputs 0 at tick 0', () => {
    expect(timeNodeDef.evaluate([], { ...ctx, tickCount: 0 })[0].v).toBe(0);
  });

  it('handles large tick counts', () => {
    expect(timeNodeDef.evaluate([], { ...ctx, tickCount: 3600 })[0].v).toBe(3600);
  });
});
