import { describe, it, expect } from 'bun:test';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertType<T>(_value: T) { }
import { objectEntries } from './typedObject';

describe('objectEntries', () => {
  it('returns the correct entries', () => {
    const obj = { a: 1, b: 'hello', c: true };
    const entries = objectEntries(obj);
    expect(entries).toEqual([['a', 1], ['b', 'hello'], ['c', true]])

    entries.map((v) => {

      if (v[0] === "a") {
        assertType<number>(v[1]);

        //@ts-expect-error = type errors in the right places
        assertType<string>(v[1]);
      }

      if (v[0] === "b") {
        assertType<string>(v[1]);
      }

      if (v[0] === "c") {
        assertType<boolean>(v[1]);
      }
    })




  });

});
