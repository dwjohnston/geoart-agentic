import 'reflect-metadata';
import { container } from 'tsyringe';
import { LocalStorageAlgorithmStorageService } from './LocalStorageAlgorithmStorageService';
import { ALGORITHM_STORAGE_SERVICE_TOKEN } from './algorithmStorageTokens';

container.registerInstance(
  ALGORITHM_STORAGE_SERVICE_TOKEN,
  new LocalStorageAlgorithmStorageService(),
);

export { container };
