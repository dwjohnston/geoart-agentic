import { describe, expect, test } from 'bun:test';
import { encodeGraphForUrl, decodeGraphFromUrl } from './graphUrlEncoding';

describe('graphUrlEncoding', () => {
  test('round-trips a value through encode/decode', () => {
    const value = { a: 1, nested: { b: [1, 2, 3] } };
    expect(decodeGraphFromUrl(encodeGraphForUrl(value))).toEqual(value);
  });

  test('undoes query-string space-for-plus mangling', () => {
    const encoded = encodeGraphForUrl({ a: 1 }).replace(/\+/g, ' ');
    expect(decodeGraphFromUrl(encoded)).toEqual({ a: 1 });
  });

  test('throws on malformed input', () => {
    expect(() => decodeGraphFromUrl('not a valid encoded string!!')).toThrow();
  });
});
