function roundNumbers(v: unknown, precision = 10): unknown {
  if (typeof v === 'number') return parseFloat(v.toFixed(precision));
  if (Array.isArray(v)) return v.map(x => roundNumbers(x, precision));
  if (v && typeof v === 'object') return Object.fromEntries(
    Object.entries(v).map(([k, val]) => [k, roundNumbers(val, precision)])
  );
  return v;
}

export type Call =
  | { kind: 'method'; name: string; args: unknown[] }
  | { kind: 'property'; name: string; value: unknown };

export type FakeContext = CanvasRenderingContext2D & {
  getCalls(): Call[];
};


/**
 * This creates a fake CanvasRenderingContext2D object. 
 * 
 * We use this in tests instead of making calls to a real drawing context.
 * @returns 
 */
export function createFakeContext(): FakeContext {
  const calls: Call[] = [];

  const creatorPrefixes: Record<string, string> = {
    createLinearGradient: 'gradient',
    createRadialGradient: 'gradient',
    createConicGradient: 'gradient',
    createPattern: 'pattern',
  };

  const makeSubProxy = (prefix: string) =>
    new Proxy({} as Record<string | symbol, unknown>, {
      get(_t, subProp) {
        return (...subArgs: unknown[]) => {
          calls.push({ kind: 'method', name: `${prefix}.${String(subProp)}`, args: subArgs });
        };
      },
    });

  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === 'getCalls') {
        return () => calls;
      }
      const creatorPrefix = creatorPrefixes[String(prop)];
      if (creatorPrefix) {
        return (...args: unknown[]) => {
          calls.push({ kind: 'method', name: String(prop), args: args.map(a => roundNumbers(a)) });
          return makeSubProxy(creatorPrefix);
        };
      }
      return (...args: unknown[]) => {
        calls.push({ kind: 'method', name: String(prop), args: args.map(a => roundNumbers(a)) });
      };
    },
    set(_target, prop, value) {
      calls.push({ kind: 'property', name: String(prop), value: roundNumbers(value) });
      return true;
    },
  };

  return new Proxy({}, handler) as FakeContext;
}
