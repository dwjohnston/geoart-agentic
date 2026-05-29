
function assertType<T>(_v: T) { }

import { describe, it } from 'bun:test';
import type { ControlNodeKinds } from '../../schema/typeHelpers';
import type { NodeWithDefaults } from './ControlNodeImplementation';

describe('NodeWithDefaults', () => {
    it('makes params required for a control node kind', () => {
        // slider params should be required
        assertType<NodeWithDefaults<'slider'>>({
            id: 's1',
            type: 'slider',
            params: {
                label: { v: 'Speed' },
                min: { v: 0 },
                max: { v: 1 },
                value: { v: 0 },
                step: { v: 0.1 },
            },
        });

        assertType<NodeWithDefaults<'slider'>>({
            id: 's1',
            type: 'slider',
            //@ts-expect-error - all params are required
            params: {
                label: { v: 'Speed' },
                min: { v: 0 },
                max: { v: 1 },
                step: { v: 0.1 },
            },
        });

        //@ts-expect-error - params are required by NodeWithDefaults
        assertType<NodeWithDefaults<'slider'>>({ id: 's1', type: 'slider' });
    });

});
