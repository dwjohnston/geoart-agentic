import { describe, it, expect } from 'bun:test';
import { isPrime } from './isPrime';

describe('isPrime', () => {
  it('returns false for values less than 2', () => {
    expect(isPrime(0)).toBe(false);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(-5)).toBe(false);
  });

  it('returns true for 2 (smallest prime)', () => {
    expect(isPrime(2)).toBe(true);
  });

  it('returns false for even numbers greater than 2', () => {
    expect(isPrime(4)).toBe(false);
    expect(isPrime(6)).toBe(false);
    expect(isPrime(100)).toBe(false);
  });

  it('returns true for small primes', () => {
    expect(isPrime(3)).toBe(true);
    expect(isPrime(5)).toBe(true);
    expect(isPrime(7)).toBe(true);
    expect(isPrime(11)).toBe(true);
    expect(isPrime(13)).toBe(true);
  });

  it('returns false for composite odd numbers', () => {
    expect(isPrime(9)).toBe(false);
    expect(isPrime(15)).toBe(false);
    expect(isPrime(25)).toBe(false);
  });

  it('returns true for larger primes', () => {
    expect(isPrime(97)).toBe(true);
    expect(isPrime(7919)).toBe(true);
  });
});
