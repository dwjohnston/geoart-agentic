import { describe, it } from 'vitest';
import { Grid } from './Grid';
import { TestPanel } from '../ui-tooling/TestPanel';
import { render } from 'vitest-browser-react';
describe('Grid component', () => {
  it('renders grid container with correct classes', async () => {
    await render(
      <TestPanel>
        <Grid container gap={16}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>
      </TestPanel>
    );

  })
})
