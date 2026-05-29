import { describe, it } from 'bun:test';
import type { StaticModuleNodeParams } from './ModuleImplementation';

function assertType<T>(_value: T) { }

describe('StaticModuleNodeParams', () => {
  it('extracts all input ports as optional raw value types for orbit-module', () => {
    assertType<StaticModuleNodeParams<"orbit-module">>({
      speed: 1,
      radius: 0.3,
      numPoints: 50,
    });


    // They are allowed to be ommited
    assertType<StaticModuleNodeParams<"orbit-module">>({
      speed: 1,
    });

    assertType<StaticModuleNodeParams<"orbit-module">>({});
  });

  it('rejects static params with refs', () => {
    assertType<StaticModuleNodeParams<"orbit-module">>({
      // @ts-expect-error - refs are not allowed in static params
      speed: { ref: "slider.value" },
    });
  });

  it('rejects invalid port names', () => {
    assertType<StaticModuleNodeParams<"orbit-module">>({
      // @ts-expect-error - invalid port name
      invalidPort: 1,
    });
  });

  it('rejects wrong value types', () => {
    assertType<StaticModuleNodeParams<"orbit-module">>({
      // @ts-expect-error - speed expects number, not string
      speed: "fast",
    });
  });

  it('extracts inputs for other module nodes', () => {
    assertType<StaticModuleNodeParams<"orbit-module">>({
      speed: 1,
      radius: 0.5,
      numPoints: 100,
    });
  });
});
