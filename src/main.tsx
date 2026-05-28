import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './application/index.css';

import { ApplicationEntry } from './application/ApplicationEntry.tsx';


const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}
createRoot(root).render(
  <StrictMode>
    <ApplicationEntry />
  </StrictMode>,
);
