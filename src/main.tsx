import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './application/index.css';
import { App } from './application/App.tsx';
import { container } from './application/algorithmStorage/container';
import { ALGORITHM_STORAGE_SERVICE_TOKEN } from './application/algorithmStorage/algorithmStorageTokens';
import { AlgorithmStorageProvider } from './application/algorithmStorage/AlgorithmStorageContext';
import type { IAlgorithmStorageService } from './application/algorithmStorage/IAlgorithmStorageService';

const storageService = container.resolve<IAlgorithmStorageService>(ALGORITHM_STORAGE_SERVICE_TOKEN);

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}
createRoot(root).render(
  <StrictMode>
    <AlgorithmStorageProvider service={storageService}>
      <App />
    </AlgorithmStorageProvider>
  </StrictMode>,
);
