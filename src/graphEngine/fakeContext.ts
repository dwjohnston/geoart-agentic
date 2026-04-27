export type Call =
  | { kind: 'method'; name: string; args: unknown[] }
  | { kind: 'set'; name: string; value: unknown };

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

  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === 'getCalls') {
        return () => calls;
      }
      if (prop === 'createLinearGradient') {
        return (...args: unknown[]) => {
          calls.push({ kind: 'method', name: 'createLinearGradient', args });
          return new Proxy({}, {
            get(_t, gradProp) {
              return (...gradArgs: unknown[]) => {
                calls.push({ kind: 'method', name: `gradient.${String(gradProp)}`, args: gradArgs });
              };
            },
          });
        };
      }
      return (...args: unknown[]) => {
        calls.push({ kind: 'method', name: String(prop), args });
      };
    },
    set(_target, prop, value) {
      calls.push({ kind: 'set', name: String(prop), value });
      return true;
    },
  };

  return new Proxy({}, handler) as FakeContext;
}
